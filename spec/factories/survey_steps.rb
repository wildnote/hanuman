FactoryGirl.define do
  factory :survey_step, class: 'Hanuman::SurveyStep' do
    survey_template
    step { generate(:unique_name) }
  end
end