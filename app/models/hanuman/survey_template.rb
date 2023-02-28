module Hanuman
  class SurveyTemplate < ActiveRecord::Base
    has_paper_trail

    # Constants
    STATUSES = %w(active draft inactive).freeze

    # Relations
    has_many :questions, -> { order :sort_order }, dependent: :destroy
    has_many :surveys, dependent: :restrict_with_exception

    # Validations
    validates :name, presence: true
    validates :status, inclusion: { in: STATUSES }
    # validates_uniqueness_of :name MOVED THIS TO CHILD APPLICAITON TO MAKE IT SCOPED BY ORANIZATION-KDH

    # Scopes
    scope :all_active_sorted, -> { where("status = 'active'").all_sorted }
    scope :all_sorted, -> { order('name ASC') }

    amoeba do
      include_association :questions
      customize(lambda { |_original_post, new_post|
        new_post.name = "#{new_post.name}"
      })
    end

    def name_plus_version
      template_version.blank? ? name : name + " " + template_version
    end

    def num_reports_submitted
      surveys.count
    end

    # a survey template
    def fully_editable
      num_reports_submitted < 1 ? true : false
    end

    # return true if any questions in survey template have calculations
    def has_calc_engine_calcs?
      has_calcs = false
      questions.each do |q|
        if q.is_calc_engine_calculated?
          has_calcs = true
          return
        end
      end
      return has_calcs
    end

    # after duplicating the survey template remap ancestry and rule information
    def remap_conditional_logic(old_survey_template)
      questions.each do |q|
        # remap ancestry and conditional logic after the duplication because the don't just copy over
        # update ancestry relationships
        unless q.ancestry.blank?
          ancestry_array = q.ancestry.split('/')
          new_ancestors = []
          ancestry_array.each do |p|
            new_ancestor = questions.find_by_duped_question_id p.to_i
            new_ancestors << new_ancestor.id
          end
          new_ancestors_string = new_ancestors.join('/')
          q.ancestry = new_ancestors_string
          q.save!
        end
        clean_duplicated_question(q) if q.duped_question_id
      end

      old_question_ids = old_survey_template.questions.pluck(:id)
      question_ids = questions.pluck(:id)

      # Clean unneded conditions from the old survey
      questions.each do |question|
        question.rules.each do |rule|
          rule.conditions.each do |condition|
            condition.destroy! unless question_ids.include?(condition.question_id)
          end
        end
      end

      old_survey_template.questions.each do |question|
        question.rules.each do |rule|
          rule.conditions.each do |condition|
            condition.destroy! unless old_question_ids.include?(condition.question_id)
          end
        end
      end

      reassign_answer_choices_on_lookup_rules

    end

    # Duplicating a Survey Template with lookup values that have rules associated with answer_choice_ids
    def reassign_answer_choices_on_lookup_rules
      questions.each do |q|
        next if q.rules.where(type: "Hanuman::LookupRule").count < 1
        q.rules.each do |rule|
          next unless rule.question.answer_type.has_answer_choices
          next unless rule.question.duped_question_id
          next unless rule.value
          answer_choice_ids = rule.value.split(',')
          next if answer_choice_ids.empty?

          from_duped_question = Hanuman::Question.find_by_id(rule.question.duped_question_id)
          next unless from_duped_question

          answer_choice_texts = from_duped_question.answer_choices.where(id: answer_choice_ids).map(&:option_text)
          new_answer_choice_ids = rule.question.answer_choices.select{|ac| answer_choice_texts.include?(ac.option_text)}.map(&:id)

          rule.value = new_answer_choice_ids.join(",")
          rule.save
        end
      end
    end

    # doing this at the survey template level so we only call survey save once and not all at once when a resort happens
    def resort_submitted_observations
      return if fully_editable
      surveys.each(&:save)
    end

    def clean_duplicated_question(question)
      from_duped_question = Hanuman::Question.find_by_id(question.duped_question_id)
      question.rules.each do |rule|
        duped_rule = from_duped_question.rules.find_by_duped_rule_id(rule.duped_rule_id)
        # if duped_rule
        #   # set the right duped one
        #   rule.duped_rule_id = duped_rule.id
        #   rule.save
        # end
      end

      question.tag_list = from_duped_question.tag_list
      # Associate the conditions from the rule
      from_duped_question.rules.each do |rule|
        rule.conditions.each do |condition|
          new_condition = condition.amoeba_dup
          new_condition.rule = question.rules.find_by(duped_rule_id: rule.id)

          new_condition.save
        end
      end
      question.save!
    end

    # changing approach due to granular sync issues-kdh
    # def set_question_db_column_names
    #   self.questions.each do |q|
    #     q.set_column_names!
    #   end
    # end
    #
    # def set_question_api_column_names
    #   self.questions.each do |q|
    #     q.set_api_column_name!
    #   end
    # end

    def check_structure_helper(checked, errors, parent, i)
      children = []
      qs = self.questions.order(sort_order: :asc)
      if Hanuman::Question.find(parent.id).ancestry.present?
        curr_ancestry = Hanuman::Question.find(parent.id).ancestry + "/" + parent.id.to_s
      else
        curr_ancestry = parent.id.to_s
      end
      qs[i..-1].each_with_index do |question, j|
        next if checked.include?(question.id)
        checked << question.id
        if question.descendants.present?
          if question.answer_type_id == 57 && question.descendants.any?{|q| q.answer_type_id == 57 }
            errors["ancestry"] << "question: #{question.id} - repeater in repeater"
          end
          checked += check_structure_helper(checked, errors, question, i+j+1)
        elsif question.ancestry == curr_ancestry
          # correct children in order
          children << question.id
          # remember and do nothing
          next
        elsif qs.where(ancestry: curr_ancestry).where.not(id: children).length > 0
          # we've hit a question with unexpected ancestry, if there are other children elsewhere in the template something is wrong
          errors["ancestry"] << "question: #{question.id} - issue with ancestry"
          puts "Ancestry isse with question_id: #{question.id}"
        else
          # successfully made it out of section
          # do nothing
          next
        end


      end
    end


    def check_structure_and_rules
      errors = {}
      errors["condition"] = []
      errors["rule"] = []
      errors["ancestry"] = []
      errors["debug"] = []

      checked = []

      parents = []
      children = {}

      question_ids = self.questions.map(&:id)
      qs = self.questions.order(sort_order: :asc)
      qs.each_with_index do |question, i|
        next if checked.include?(question.id)
        checked << question.id
        # loop through rules linked to questions in the template to check that the conditions do as well
        question.rules.each do |rule|
          errors["rule"] << "question: #{question.id} - rule value is blank" if rule.value.blank?
          errors["rule"] << "question: #{question.id} - rule has no conditions" if rule.conditions.length == 0
          rule.conditions.each do |condition|
            if !question_ids.include?(condition.question.id)
              errors["condition"] << "question: #{condition.question.id} - condition references missing question"
              puts "Condition references bad question_id: #{condition.question.id}"
            end
          end
        end
        # doing it both ways gives more opportunity to find bad references
        # loop through conditions linked to questions in the template to check that the rules do as well
        question.conditions.each do |condition|
          errors["condition"] << "question: #{question.id} - condition answer is blank" if condition.answer.blank?
          errors["condition"] << "question: #{question.id} - condition has no rule" if condition.rule_id.blank? # this shouldnt happen because of a validation
          if condition.rule.present?
            if !question_ids.include?(condition.rule.question.id)
              errors["rule"] << "question: #{condition.question.id} - rule references missing question"
              puts "Rule references bad question_id: #{condition.rule.question.id}"
            end
          end
        end


        # recursively check nesting for out of place ancestries
        if question.descendants.present?
          if question.answer_type_id == 57 && question.descendants.any?{|q| q.answer_type_id == 57 }
            errors["ancestry"] << "question: #{question.id} - repeater in repeater"
          end
          checked += check_structure_helper(checked, errors, question, i+1)\
        end



      end

      # puts errors.map{|e| "#{e[0]}: #{e[1]} "}
      errors
    end

    def set_question_css_styles(style)
      questions.each do |q|
        q.update(css_style: style)
      end
    end

    def reset_db_column_names
      questions.each do |q|
        q.update_column(:db_column_name, q.create_db_column_name)
      end
    end

  end
end
