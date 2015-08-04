module Hanuman
  class AnswerType < ActiveRecord::Base
    has_paper_trail
    validates_presence_of :name
    validates_uniqueness_of :name
    has_many :questions, dependent: :restrict_with_exception

    ANSWER_CHOICE_TYPES = ["external", "internal", "internal-grouped"]
    ANSWER_CHOICE_STATUSES = ["active", "inactive"]

    def self.active_sorted
      where(status: 'active').order('name')
    end
  end
end
