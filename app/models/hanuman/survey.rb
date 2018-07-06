module Hanuman
  class Survey < ActiveRecord::Base
    has_paper_trail

    # Relations
    belongs_to :survey_template
    has_many :observations, dependent: :destroy
    accepts_nested_attributes_for :observations, allow_destroy: true
    has_many :unscope_observations, -> { unscope(:includes, :order) }, class_name: 'Hanuman::Observation'
    has_many :observation_answers, through: :unscope_observations
    has_many :observation_documents, through: :unscope_observations
    has_many :observation_photos, through: :unscope_observations
    has_many :observation_videos, through: :unscope_observations
    has_one :survey_extension, dependent: :delete
    accepts_nested_attributes_for :survey_extension, allow_destroy: true

    attr_accessor :should_schedule_sort, :skip_sort

    # Validations
    validates :survey_template_id, presence: true
    validates :survey_date, presence: true
    validates :survey_extension, presence: true

    before_save :set_observations_unsorted, unless: :skip_sort?
    after_save :schedule_observation_sorting, if: :should_schedule_sort?

    amoeba {
      enable
      include_association :survey_extension
      include_association :observations
    }

    # Delegations
    delegate :name, to: :survey_template, prefix: true

    def author
      versions.first.whodunnit unless versions.blank? rescue nil
    end

    def set_observations_unsorted
      self.observations_sorted = false

      true # need this so that a before_save callback doesn't return false
    end

    def should_schedule_sort?
      !skip_sort? && (@should_schedule_sort || false)
    end

    def skip_sort?
      @skip_sort || false
    end

    def schedule_observation_sorting
      SortObservationsWorker.perform_async(self.id)
    end

    def sorted_observations
      observations_sorted ? observations.reorder('hanuman_observations.sort_order ASC') : sort_observations!
    end

    def get_sorted_observations
      # This sort results in an array of observations where all repeaters of each type are grouped, and all child observations are grouped by question
      sorted_observations = self.observations.reorder('hanuman_questions.sort_order ASC, repeater_id ASC, parent_repeater_id ASC').to_ary

      # This loop iterates over the observations, finds each repeater, and reorders each child with the given parent_repeater_id to be next to its parent observation
      sorted_observations.each_with_index do |possible_repeater, possible_repeater_index|
        if possible_repeater.question.answer_type.name == "repeater" && possible_repeater.repeater_id.present?

          # the number of children reordered so far for this repeater
          current_repeater_child_index = 0

          # we start at the end of the observations array and test each observation to see if it's a child of the current repeater
          test_if_child_index = sorted_observations.count - 1

          # == LHS ==
          # the left side of this equation is the index of the observation most recently tested (to see if it's a child of the current repeater)
          # we test the children in reverse order, so this value starts at the last index value and decreases
          #
          # == RHS ==
          # the right hand side of this equation is the index of the current repeater we are working with, plus the number of this repeater's children that have been reordered so far
          # this value represents the index of the last already-reordered child of the current repeater
          #
          # == END CONDITION ==
          # hence, the loop will run as long as the index of the next child to test is greater than the index of the last child reordered
          # i.e. until every child has been reordered
          while test_if_child_index > (possible_repeater_index + current_repeater_child_index)

            # grab the observation at test_if_child_index and check if it matches the current repeater
            possible_child_of_current_repeater = sorted_observations[test_if_child_index]
            if possible_child_of_current_repeater.parent_repeater_id == possible_repeater.repeater_id

              # remove the child observation from the array
              sorted_observations.delete(possible_child_of_current_repeater)

              # add the child observation back into the array
              # we start the loop at the end of the observation array, so each subsequent child has a lower question sort_order value than the last
              # hence we get the correct order by inserting it at the index BEFORE the previous child that was reordered
              sorted_observations.insert(possible_repeater_index + 1, possible_child_of_current_repeater)

              # increment the tracking variable for the number of children that have been reordered for this repeater
              current_repeater_child_index += 1
            else
              # if the observation was not a child of the repeater, test the next one
              # note that this variable does not need to be decremented if the observation is found to be a child, as in that case the child is reordered
              # the same index then points to a new observation
              test_if_child_index -= 1
            end
          end

        end
      end

      sorted_observations
    end

    def sort_observations!
      sorted_obs = self.get_sorted_observations

      sorted_obs.each_with_index do |sorted_observation, index|
        Hanuman::Observation.find(sorted_observation.id).update_column(:sort_order, index)
      end

      self.update_column(:observations_sorted, true)

      self.observations.reorder('hanuman_observations.sort_order ASC')
    end
  end
end
