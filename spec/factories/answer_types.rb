require 'faker'

FactoryBot.define do
  factory :answer_type, class: 'Hanuman::AnswerType' do
    name              { generate(:unique_name) }
    status            { Hanuman::AnswerType::ANSWER_CHOICE_STATUSES.sample }
    group_type        { Hanuman::AnswerType::GROUP_TYPES.sample }
    description       { Faker::Lorem.sentence(3) }
    descriptive_name  { Faker::Lorem.word }
  end
end
