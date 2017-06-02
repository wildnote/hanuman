class AddGroupTypeToHanumanAnswerTypes < ActiveRecord::Migration
  GROUP_TYPES_TO_SET =
    {
      "Basic": ['checkbox', 'counter', 'date', 'number', 'text', 'textarea', 'time'],
      "Multiple Choice": ['checkboxlist', 'chosenmultiselect'],
      "Single Choice": ['chosenselect', 'locationchosensingleselect', 'radio'],
      "Media": ['document', 'document', 'video'],
      "Design": ['helperabove', 'repeater', 'section', 'static', 'line'],
      "Taxon": ['taxonchosenmultiselect', 'taxonchosensingleselect'],
      "Geographic": ['latlong']
    }

  def up
    add_column :hanuman_answer_types, :group_type, :string
    GROUP_TYPES_TO_SET.each do |group_name, types|
      types.each do |name|
        answer_type = Hanuman::AnswerType.find_by(name: name)
        if answer_type
          answer_type.update_attributes(group_type: group_name)
        end
      end
    end
  end

  def down
    add_column :hanuman_answer_types, :group_type, :string
  end
end
