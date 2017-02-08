class AddGpsDataToHanumanObservationVideos < ActiveRecord::Migration
  NO_ANSWER_TYPES = %w(repeater section helperabove helperbelow line static photo document video)

  def up
    add_column :hanuman_answer_types, :has_an_answer, :boolean, default: true
    Hanuman::AnswerType.all.each do |answer_type|
      if NO_ANSWER_TYPES.include? answer_type.name
        answer_type.update_attribute(:has_an_answer, false)
      end
    end
  end

  def down
    remove_column :hanuman_answer_types, :has_an_answer
  end
end
