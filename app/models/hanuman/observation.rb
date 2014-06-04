module Hanuman
  class Observation < ActiveRecord::Base
    has_paper_trail
    belongs_to :survey
    belongs_to :survey_question
    has_many :observation_answers
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    default_scope {includes(:survey_question).order('hanuman_survey_questions."group" ASC, hanuman_observations."group" ASC, hanuman_survey_questions."sort_order" ASC').references(:survey_question)}
    
    before_save :strip_and_squish_answer

    amoeba do
      enable
    end
    
    def strip_and_squish_answer
      answer = answer.strip.squish unless answer.blank?
    end
    
    def option_text
      answer.split(' / ')[0]
    end
    
    def scientific_text
      a = answer.split(' ( ')[0].split(' / ')[1]
      a.blank? ? '' : a
    end
    
    def parent_text
      a = answer.split(' ( ')[1]
      a.blank? ? '' : a.gsub(' )', '')
    end

    def self.filtered_by_group(observations_group)
      where('hanuman_observations."group" = ?', observations_group)
    end

    def question_text
      self.survey_question.question.question_text
    end
  end
end
