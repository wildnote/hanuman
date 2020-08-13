class DestroyQuestionWorker
  include Sidekiq::Worker

  def perform(question_id, user_id)
    PaperTrail.whodunnit = user_id
    question = Hanuman::Question.find(question_id)
    question.destroy
  end
end