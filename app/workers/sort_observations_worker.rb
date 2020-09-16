class SortObservationsWorker
  include Sidekiq::Worker

  def perform(survey_id)
    survey = Hanuman::Survey.find(survey_id)

    if survey.wetland_v2_web_v3? 
      survey.set_wetland_dominant_species
    end

    if survey.mobile_v3_or_higher?
      survey.sort_veg_repeaters
    end

    if survey.web_wetland_v3_v4?
      survey.set_dominance_test
      survey.set_rapid_test_hydrophytic
    end

    if survey.should_schedule_sort?
      unless survey.observations_sorted
        survey.sort_observations!
      end

      unless survey.observation_visibility_set
        survey.set_observation_visibility!
      end
    end
  end
end
