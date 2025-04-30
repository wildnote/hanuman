module Hanuman
  module SurveyTemplateIntegrityChecker
    extend ActiveSupport::Concern

    # Check the integrity of a form
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
  end
end 