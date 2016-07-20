require 'faker'

FactoryGirl.define do
  factory :answer_type, class: 'Hanuman::AnswerType' do
    name              { generate(:unique_name) }
    status            { Hanuman::AnswerType::ANSWER_CHOICE_STATUSES.sample }
    description       { Faker::Lorem.sentence(3) }
    descriptive_name  { Faker::Lorem.word }
  end
end