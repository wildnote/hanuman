module Hanuman
  class AnswerType < ActiveRecord::Base
    has_paper_trail

    # Constants
    ANSWER_CHOICE_STATUSES = %w[active inactive].freeze
    ANSWER_CHOICE_TYPES = ['', 'external', 'internal', 'internal-grouped'].freeze
    ELEMENT_TYPES = [
      '', 'checkbox', 'checkboxes', 'container', 'date', 'document',
      'email', 'file', 'helper', 'line', 'map', 'multiselect', 'number', 'photo',
      'radio', 'select', 'static', 'text', 'textarea', 'time', 'video'
    ].freeze
    GROUP_TYPES = ['Basic', 'Multiple Choice', 'Single Choice', 'Media', 'Design', 'Taxon', 'Geographic'].freeze

    # Scopes
    scope :active_sorted, -> { where(status: 'active').order('name') }
    scope :without_taxon, -> { where.not(descriptive_name: 'Taxon') }

    # Relations
    has_many :questions, dependent: :restrict_with_exception

    # Validations
    validates :name, presence: true, uniqueness: true
    validates :status, inclusion: { in: ANSWER_CHOICE_STATUSES }
    validates :group_type, inclusion: { in: GROUP_TYPES }, allow_blank: true

    def self.sort(sort_column, sort_direction)
      sort = "#{sort_column} #{sort_direction}"
      order(
        sort.gsub('asc asc', 'asc')
              .gsub('asc desc', 'asc')
              .gsub('desc desc', 'desc')
              .gsub('desc asc', 'desc')
      )
    end
  end
end
