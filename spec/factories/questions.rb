require 'faker'

FactoryBot.define do
  factory :question, class: 'Hanuman::Question' do
    answer_type
    survey_template
    question_text { Faker::Lorem.sentence(2) }

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
