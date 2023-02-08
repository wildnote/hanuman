class SortObservationsWorker
  include Sidekiq::Worker

  def perform(survey_id)
    survey = Hanuman::Survey.find(survey_id)
    return if survey.lock_callbacks || survey.has_missing_questions

    survey.update_column(:lock_callbacks, true)

    if survey.mobile_v3_or_higher?
      survey.sort_veg_repeaters
    end

    unless survey.observations_sorted
      survey.sort_observations!
    end

    unless survey.observation_visibility_set
      survey.set_observation_visibility!
    end

    survey.update_column(:lock_callbacks, false)

  end

end
