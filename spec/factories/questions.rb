require 'faker'

FactoryBot.define do
  factory :question, class: 'Hanuman::Question' do
    answer_type
    survey_template
    question_text { Faker::Lorem.sentence(2) }
    trait :with_rule_and_coditions do
      transient do
        number_of_conditions { 2 }
      end

      after :create do |question, evaluator|
        question.rules << create(:rule)
        question.save
        create_list :condition, evaluator.number_of_conditions, rule: question.rules.first
      end
    end
  end
end
