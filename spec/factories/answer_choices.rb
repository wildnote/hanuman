require 'faker'

FactoryGirl.define do
  factory :answer_choice, class: 'Hanuman::AnswerChoice' do
    question
    option_text  { Faker::Lorem.word }
  end
end