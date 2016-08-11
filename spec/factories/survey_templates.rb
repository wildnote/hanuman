FactoryGirl.define do
  factory :survey_template, class: 'Hanuman::SurveyTemplate' do
  	name  	{ Faker::Lorem.word }
  	status 	{ Hanuman::AnswerType::ANSWER_CHOICE_STATUSES.sample }
  end
end