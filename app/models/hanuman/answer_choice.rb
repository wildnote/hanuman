module Hanuman
  class AnswerChoice < ActiveRecord::Base
    has_paper_trail
    has_ancestry

    # Scopes
    default_scope { order(option_text: :asc) }
    scope :second_level, -> { where(ancestry: nil) }

    # Relations
    belongs_to :question, inverse_of: :answer_choices

    # Validations
    validates :option_text, :question, presence: true

    # Callbacks
    before_save :protect_split

    def self.filtered_by_question_id_and_sort(question_id, sort_column, sort_direction)
      question_id.blank? ? true : conditions = "hanuman_answer_choices.question_id = " + question_id.to_s
      joins(:question).where(conditions).order((sort_column + " " + sort_direction).gsub("asc asc", "asc").gsub("asc desc", "asc").gsub("desc desc", "desc").gsub("desc asc", "desc"))
    end

    def protect_split
      #ensures that we can count on ' / ' (space forward-slash space)
      #only occurring once in the formatted_answer_choice so we can
      #later rely on .split(' / ') to break apart a stored answer string
      #back into option_text and scientific_text respectively
      option_text = option_text.strip.gsub(' / ', '/') unless option_text.blank?
      scientific_text = scientific_text.strip.gsub(' / ', '/') unless scientific_text.blank?
    end

    def self.all_sorted
      order('option_text ASC, scientific_text ASC')
    end

    def self.sorted
      order('option_text')
    end

    def formatted_answer_choice
      if option_text == scientific_text
        option_text
      else
        scientific_text.blank? ? option_text : scientific_text +  ' / ' + option_text
      end
    end
  end
end
