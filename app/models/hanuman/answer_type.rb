module Hanuman
  class AnswerType < ActiveRecord::Base
    has_paper_trail
    validates_presence_of :name
    validates_uniqueness_of :name
    has_many :questions, dependent: :restrict_with_exception

    ANSWER_CHOICE_STATUSES = ["active", "inactive"]
    ANSWER_CHOICE_TYPES = ["", "external", "internal", "internal-grouped"]
    ELEMENT_TYPES = ["", "checkbox", "checkboxes", "container", "date", "document", "email", "file", "helper", "line", "map", "multiselect", "number", "photo", "radio", "select", "static", "text", "textarea", "time", "video"]

    def self.active_sorted
      where(status: 'active').order('name')
    end

    def self.sort(sort_column, sort_direction)
      self.order((sort_column + " " + sort_direction).gsub("asc asc", "asc").gsub("asc desc", "asc"))
    end
  end
end
