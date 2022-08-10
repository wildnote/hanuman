class DestroyQuestionWorker
  include Sidekiq::Worker

  def perform(question_id, user_id)

    begin
      PaperTrail.whodunnit = user_id
      question = Hanuman::Question.unscoped.find(question_id)
      question.destroy
    rescue => e
      Honeybadger.notify(e, context: {
        name: "Question Deletion Worker Failure",
        user_id: user_id
      })
    end
  end
end