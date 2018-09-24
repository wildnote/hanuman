require 'faker'

FactoryBot.define do
  factory :question, class: 'Hanuman::Question' do
    answer_type
    survey_template
    question_text { Faker::Lorem.sentence(2) }

    trait :with_rule_and_coditions do
      rule { create(:rule) }

      transient do
        number_of_conditions 2
      end

      after :create do |question, evaluator|
        create_list :condition, evaluator.number_of_conditions, rule: question.rule
      end
    end

    trait :with_tags do
      transient do
        number_of_tags 2
      end

      after :create do |question, evaluator|
        tags = Faker::Lorem.words(evaluator.number_of_tags)
        question.tag_list.add(*tags)
        question.save
      end
    end
  end
end
