class SortObservationsWorker
  include Sidekiq::Worker

  def perform(survey_id)
    survey = Hanuman::Survey.find(survey_id)
    survey.sort_observations!
  end
end
