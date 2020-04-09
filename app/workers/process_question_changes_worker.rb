class ProcessQuestionChangesWorker
    include Sidekiq::Worker
    sidekiq_options :retry => false
  
    def perform(question_id)
      question = Hanuman::Question.find question_id
      question.submit_blank_observation_data
    end
  end