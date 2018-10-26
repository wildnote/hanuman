require 'faker'

FactoryBot.define do
  factory :survey, class: 'Hanuman::Survey' do
    survey_template
    survey_extension
    survey_date { Faker::Date.between(2.days.ago, Date.today)  }
  end
end
