module Hanuman
  class AnswerType < ActiveRecord::Base
    has_paper_trail
    validates_presence_of :name
    validates_uniqueness_of :name

    def self.active_sorted
      where(status: 'active').order('name')
    end
  end
end
