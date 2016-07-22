FactoryGirl.define do
  factory :survey_template, class: 'Hanuman::SurveyTemplate' do
  	name  { Faker::Lorem.word }
  end
end