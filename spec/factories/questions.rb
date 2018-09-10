require 'faker'

FactoryGirl.define do
  factory :question, class: 'Hanuman::Question' do
    answer_type
    survey_template
    question_text { Faker::Lorem.sentence(2) }
    trait :with_rule_and_coditions do
      rules { create(:rule) }

      transient do
        number_of_conditions 2
      end

      after :create do |question, evaluator|
        create_list :condition, evaluator.number_of_conditions, rule: question.rules
      end
    end
  end
end
