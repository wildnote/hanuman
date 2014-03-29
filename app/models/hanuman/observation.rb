module Hanuman
  class Observation < ActiveRecord::Base
    belongs_to :survey
    belongs_to :survey_question
    has_many :observation_answers
    accepts_nested_attributes_for :observation_answers, allow_destroy: true
    has_many :answer_choices, through: :observation_answers
    default_scope {includes(:survey_question).order('hanuman_observations.created_at ASC, hanuman_survey_questions.sort_order asc').references(:survey_question)}
    
    before_save :strip_and_squish_answer
    
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
  end
end
