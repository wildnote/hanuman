require 'faker'

FactoryGirl.define do
  factory :question, class: 'Hanuman::Question' do
    answer_type
    survey_template
    question_text { Faker::Lorem.sentence(2) }
  end
end