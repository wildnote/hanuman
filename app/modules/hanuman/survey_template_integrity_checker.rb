module Hanuman
  module SurveyTemplateIntegrityChecker
    extend ActiveSupport::Concern

    # Check the integrity of a form
    #
    # This method performs comprehensive validation of a survey template to ensure
    # data integrity and proper configuration. It returns a hash with the following structure:
    # {
    #   valid: boolean,      # Overall validity status
    #   errors: array,       # Critical issues that prevent form from being valid
    #   warnings: array,     # Non-critical issues that should be addressed
    #   details: hash        # Detailed information about specific issues
    # }
    #
    # === ISSUES CHECKED ===
    #
    # == CRITICAL ERRORS (valid: false) ==
    # 1. Questions without sort_order
    #    - Questions must have a sort_order to determine display sequence
    #
    # 2. Lookup rules with blank default values
    #    - LookupRule types must have a value set when conditions exist
    #
    # 3. Calculation rules without scripts
    #    - CalculationRule types must have a script defined
    #
    # 4. Rule conditions referencing non-existent questions
    #    - Conditions must reference questions within the same survey template
    #
    # 5. Incomplete rule conditions
    #    - VisibilityRule and LookupRule conditions must have answers unless using 'is empty'/'is not empty' operators
    #
    # 6. Questions requiring answer choices but having none
    #    - Questions with answer_type.has_answer_choices? must have answer_choices defined
    #    - Exception: locationchosensingleselect with new_project_location=true
    #    - Exception: taxon questions (taxonchosenmultiselect, taxonchosensingleselect) with data_source_id
    #
    # 7. Answer choices with blank option_text
    #    - All answer choices must have non-blank option_text
    #
    # 8. Ancestry and sort order relationship violations
    #    - Children of containers must be grouped together with sequential sort orders
    #    - No other questions should be placed between children of the same parent
    #    - Children must have the correct ancestry string matching their parent
    #
    # == WARNINGS (valid: true, but issues should be addressed) ==
    # 1. Duplicate sort orders
    #    - Multiple questions with the same sort_order value
    #    - Can cause display ordering issues
    #
    # 2. Duplicate API column names
    #    - Multiple questions with the same api_column_name
    #    - Can cause data export/import conflicts
    #
    # 3. Duplicate DB column names
    #    - Multiple questions with the same db_column_name
    #    - Can cause database storage conflicts
    #
    # 4. Empty rules (automatically deleted)
    #    - Rules with no conditions are automatically removed
    #    - Warning logged before deletion
    #
    # 5. Location questions without dynamic location setup
    #    - locationchosensingleselect questions without new_project_location=true
    #    - Requires manual verification that locations exist in the project
    #
    # 6. Taxon questions without data source
    #    - taxonchosenmultiselect/taxonchosensingleselect questions without data_source_id
    #    - May not function properly without proper data source configuration
    #
    # 7. Duplicate answer choice values
    #    - Multiple answer choices with the same option_text within a question
    #    - Can cause user confusion and data ambiguity
    #
    # == SPECIAL HANDLING ==
    # - Location questions (locationchosensingleselect) with new_project_location=true are allowed to have no answer choices
    # - Taxon questions (taxonchosenmultiselect, taxonchosensingleselect) with data_source_id are allowed to have no answer choices
    # - Empty rules are automatically cleaned up during the check
    #
    # == LOGGING ==
    # - All errors and warnings are logged to Rails.logger
    # - A summary is logged when any issues are found
    # - Detailed information is included in the returned details hash
    #
    # @return [Hash] Integrity check results with valid, errors, warnings, and details
    def check_form_integrity
      {
        valid: true,
        errors: [],
        warnings: [],
        details: {}
      }.tap do |result|
        # Get all question IDs for reference
        question_ids = questions.map(&:id)
        
        # Get all questions that have rules
        questions_with_rules = questions.select { |q| q.rules.any? }
        questions_with_rules_ids = questions_with_rules.map(&:id)
        
        # Check for duplicate sort orders
        sort_orders = questions.map(&:sort_order)
        duplicate_sort_orders = sort_orders.select { |order| sort_orders.count(order) > 1 }.uniq
        if duplicate_sort_orders.any?
          result[:warnings] << "Form has questions with duplicate sort orders"
          result[:details][:duplicate_sort_orders] = duplicate_sort_orders.map do |order|
            questions_with_order = questions.select { |q| q.sort_order == order }
            "Questions (#{questions_with_order.map(&:id).join(', ')}) have sort order: #{order}"
          end
        end
        
        # Check for duplicate column names
        api_column_names = questions.map(&:api_column_name).compact
        duplicate_api_names = api_column_names.select { |name| api_column_names.count(name) > 1 }.uniq
        if duplicate_api_names.any?
          # Don't set valid to false for duplicate API column names
          result[:warnings] << "Form has questions with duplicate api_column_names"
          result[:details][:duplicate_api_names] = duplicate_api_names.map do |name|
            questions_with_name = questions.select { |q| q.api_column_name == name }
            "Questions (#{questions_with_name.map(&:id).join(', ')}) have api_column_name: #{name}"
          end
          
          # Add detailed warning messages for each duplicate API column name
          duplicate_api_names.each do |name|
            questions_with_name = questions.select { |q| q.api_column_name == name }
            question_ids_text = questions_with_name.map(&:id).join(', ')
            warning_message = "Duplicate api_column_name '#{name}' found in questions: #{question_ids_text}"
            result[:warnings] << warning_message
            Rails.logger.info warning_message
          end
        end
        
        db_column_names = questions.map(&:db_column_name).compact
        duplicate_db_names = db_column_names.select { |name| db_column_names.count(name) > 1 }.uniq
        if duplicate_db_names.any?
          # Don't set valid to false for duplicate DB column names
          result[:warnings] << "Form has questions with duplicate db_column_names"
          result[:details][:duplicate_db_names] = duplicate_db_names.map do |name|
            questions_with_name = questions.select { |q| q.db_column_name == name }
            "Questions (#{questions_with_name.map(&:id).join(', ')}) have db_column_name: #{name}"
          end
          
          # Add detailed warning messages for each duplicate DB column name
          duplicate_db_names.each do |name|
            questions_with_name = questions.select { |q| q.db_column_name == name }
            question_ids_text = questions_with_name.map(&:id).join(', ')
            warning_message = "Duplicate db_column_name '#{name}' found in questions: #{question_ids_text}"
            result[:warnings] << warning_message
            Rails.logger.info warning_message
          end
        end
        
        # Check ancestry and sort order relationships
        check_ancestry_and_sort_order_integrity(result, questions)
        
        # Check each question
        questions.each do |question|
          # Check question structure
          if question.sort_order.nil?
            result[:valid] = false
            result[:errors] << "Question #{question.id} (#{question.question_text}) has no sort order"
          end
          
          # Check rules and conditions
          if question.rules.any?
            question.rules.each do |rule|
              # Check for empty rules (rules with no conditions)
              if rule.conditions.empty?
                result[:warnings] << "Question #{question.id} (#{question.question_text}) has #{rule.type} #{rule.id} with no conditions, rule has been deleted"
                rule.destroy
              else
                # Only check default value for lookup rules that have conditions
                if rule.type == "Hanuman::LookupRule" && rule.value.blank?
                  result[:valid] = false
                  result[:errors] << "Question #{question.id} (#{question.question_text}) has lookup rule #{rule.id} with blank default value"
                end
              end
              
              # Check for script in calculation rules
              if rule.type == "Hanuman::CalculationRule" && rule.script.blank?
                result[:valid] = false
                result[:errors] << "Question #{question.id} (#{question.question_text}) has calculation rule #{rule.id} with no script"
              end
              
              # Check conditions
              rule.conditions.each do |condition|
                # Check condition references to ensure they point to questions in the same survey template
                unless question_ids.include?(condition.question_id)
                  result[:valid] = false
                  result[:errors] << "Question #{question.id} (#{question.question_text}): Rule #{rule.id} has condition #{condition.id} referencing question #{condition.question_id} which is not in this survey template"
                end
                
                # Check condition completeness based on rule type
                if ['Hanuman::VisibilityRule', 'Hanuman::LookupRule'].include?(rule.type)
                  if condition.answer.blank? && !['is empty', 'is not empty'].include?(condition.operator)
                    result[:valid] = false
                    result[:errors] << "Question #{question.id} (#{question.question_text}): Rule #{rule.id} has condition #{condition.id} with blank answer"
                  end
                end
              end
            end
          end
          
          # Check answer choices
          if question.answer_type&.has_answer_choices?
            if question.answer_choices.empty?
              # Special handling for locationchosensingleselect answer type
              if question.answer_type.name == "locationchosensingleselect"
                # Check if new_project_location is set
                if question.new_project_location
                  # This is a dynamic location question, so it's okay to have no answer choices
                  Rails.logger.info "Question #{question.id} is a dynamic location question (new_project_location=true)"
                else
                  # no project context so can't check if there are locations
                  warning_message = "Question #{question.id} (#{question.question_text}) is a location question dynamic locations not setup, confirm locations exist in the project"
                  result[:warnings] << warning_message
                  Rails.logger.info warning_message
                  result[:details][:location_warnings] ||= []
                  result[:details][:location_warnings] << warning_message
                end
              # Special handling for taxon question types
              elsif ["taxonchosenmultiselect", "taxonchosensingleselect"].include?(question.answer_type.name)
                # Check if data_source_id is set
                if question.data_source_id.blank?
                  # Add a warning for taxon questions with no data source
                  warning_message = "Question #{question.id} (#{question.question_text}) is a taxon question but has no data source selected"
                  result[:warnings] << warning_message
                  Rails.logger.info warning_message
                  result[:details][:taxon_warnings] ||= []
                  result[:details][:taxon_warnings] << warning_message
                else
                  Rails.logger.info "Question #{question.id} is a taxon question with data source ID: #{question.data_source_id}"
                end
              else
                # For non-location, non-taxon questions that require answer choices, this is an error
                result[:valid] = false
                result[:errors] << "Question #{question.id} (#{question.question_text}) requires answer choices but has none"
              end
            else
              # Check for duplicate answer choice values
              answer_choice_values = question.answer_choices.map(&:option_text)
              duplicate_values = answer_choice_values.select { |value| answer_choice_values.count(value) > 1 }.uniq
              if duplicate_values.any?
                result[:warnings] << "Question #{question.id} (#{question.question_text}) has duplicate answer choice values"
                result[:details][:duplicate_answer_choices] ||= []
                duplicate_values.each do |value|
                  choices_with_value = question.answer_choices.select { |choice| choice.option_text == value }
                  result[:details][:duplicate_answer_choices] << "Question #{question.id} (#{question.question_text}) has multiple answer choices (#{choices_with_value.map(&:id).join(', ')}) with the same value: #{value}"
                end
              end
              
              question.answer_choices.each do |choice|
                if choice.option_text.blank?
                  result[:valid] = false
                  result[:errors] << "Question #{question.id} (#{question.question_text}) has answer choice #{choice.id} with blank option text"
                end
              end
            end
          end
        end
        
        # Log a summary of all errors and warnings
        if result[:errors].any? || result[:warnings].any?
          Rails.logger.info "=== Form Integrity Check Summary ==="
          Rails.logger.info "Form ID: #{id}"
          Rails.logger.info "Valid: #{result[:valid]}"
          
          if result[:errors].any?
            Rails.logger.info "=== ERRORS ==="
            result[:errors].each do |error|
              Rails.logger.info "ERROR: #{error}"
            end
          end
          
          if result[:warnings].any?
            Rails.logger.info "=== WARNINGS ==="
            result[:warnings].each do |warning|
              Rails.logger.info "WARNING: #{warning}"
            end
          end
          
          Rails.logger.info "================================"
        end
      end
    end

    private

    # Check ancestry and sort order relationships for all questions
    # This ensures that children of containers are properly grouped together
    # and have sequential sort orders without other questions mixed in between
    def check_ancestry_and_sort_order_integrity(result, questions)
      # Get all container questions (sections and repeaters)
      containers = questions.select { |q| q.answer_type&.name&.in?(['section', 'repeater']) }
      
      containers.each do |container|
        # Get all direct children of this container
        container_children = questions.select { |q| q.parent_id == container.id }
        
        next if container_children.empty?
        
        # Sort children by sort_order
        sorted_children = container_children.sort_by(&:sort_order)
        
        # Check if children are grouped together (no gaps with other questions)
        container_sort_order = container.sort_order
        first_child_sort_order = sorted_children.first.sort_order
        last_child_sort_order = sorted_children.last.sort_order
        
        # Find all questions that should be between the container and its children
        questions_between = questions.select do |q|
          q.id != container.id && 
          !container_children.map(&:id).include?(q.id) &&
          q.sort_order > container_sort_order &&
          q.sort_order < first_child_sort_order
        end
        
        # Check if there are questions between container and its first child
        if questions_between.any?
          result[:valid] = false
          result[:errors] << "Container question #{container.id} (#{container.question_text}) has children that are not immediately following it in sort order"
          result[:details][:ancestry_violations] ||= []
          result[:details][:ancestry_violations] << {
            container_id: container.id,
            container_text: container.question_text,
            issue: "Questions between container and first child",
            questions_between: questions_between.map { |q| { id: q.id, text: q.question_text, sort_order: q.sort_order } }
          }
        end
        
        # Check if children are sequential (no gaps between them)
        # Only check for gaps that are within the same ancestry level
        sorted_children.each_with_index do |child, index|
          next if index == 0 # Skip first child
          
          previous_child = sorted_children[index - 1]
          expected_sort_order = previous_child.sort_order + 1
          
          # Check if there are any questions between the previous child and current child
          # that belong to the same parent (same ancestry level)
          questions_between_children = questions.select do |q|
            q.id != container.id && 
            q.id != previous_child.id && 
            q.id != child.id &&
            q.parent_id == container.id && # Same parent
            q.sort_order > previous_child.sort_order &&
            q.sort_order < child.sort_order
          end
          
          if questions_between_children.any?
            result[:valid] = false
            result[:errors] << "Container question #{container.id} (#{container.question_text}) has non-sequential child sort orders"
            result[:details][:ancestry_violations] ||= []
            result[:details][:ancestry_violations] << {
              container_id: container.id,
              container_text: container.question_text,
              issue: "Non-sequential child sort orders",
              previous_child: { id: previous_child.id, text: previous_child.question_text, sort_order: previous_child.sort_order },
              current_child: { id: child.id, text: child.question_text, sort_order: child.sort_order },
              expected_sort_order: expected_sort_order,
              questions_between: questions_between_children.map { |q| { id: q.id, text: q.question_text, sort_order: q.sort_order } }
            }
          end
        end
        
        # Check if children have correct ancestry
        expected_ancestry = container.ancestry.present? ? "#{container.ancestry}/#{container.id}" : container.id.to_s
        
        sorted_children.each do |child|
          if child.ancestry != expected_ancestry
            result[:valid] = false
            result[:errors] << "Child question #{child.id} (#{child.question_text}) has incorrect ancestry for parent #{container.id} (#{container.question_text})"
            result[:details][:ancestry_violations] ||= []
            result[:details][:ancestry_violations] << {
              container_id: container.id,
              container_text: container.question_text,
              child_id: child.id,
              child_text: child.question_text,
              issue: "Incorrect ancestry",
              expected_ancestry: expected_ancestry,
              actual_ancestry: child.ancestry
            }
          end
        end
        
        # Check if there are questions after the last child that should be children
        questions_after_children = questions.select do |q|
          q.id != container.id && 
          !container_children.map(&:id).include?(q.id) &&
          q.sort_order > last_child_sort_order &&
          q.sort_order < last_child_sort_order + 1000 # Reasonable gap threshold
        end
        
        # If there are questions immediately after children, check if they should be children
        if questions_after_children.any?
          # Check if any of these questions have ancestry that suggests they should be children
          misplaced_children = questions_after_children.select do |q|
            q.ancestry == expected_ancestry
          end
          
          if misplaced_children.any?
            result[:valid] = false
            result[:errors] << "Container question #{container.id} (#{container.question_text}) has children with sort orders outside the expected range"
            result[:details][:ancestry_violations] ||= []
            result[:details][:ancestry_violations] << {
              container_id: container.id,
              container_text: container.question_text,
              issue: "Children with sort orders outside expected range",
              misplaced_children: misplaced_children.map { |q| { id: q.id, text: q.question_text, sort_order: q.sort_order } }
            }
          end
        end
      end
    end
  end
end 