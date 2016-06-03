
  class ImportWorker
    include Sidekiq::Worker

    def perform(args={})
      file_name = args['file_name']
      file_path = args['file_path']
      question = Hanuman::Question.find(args["question_id"])
      question.import_answer_choices(file_name, file_path)
    end
  end
