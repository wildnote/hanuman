require 'faker'

FactoryBot.define do
  factory :observation_answer, class: 'Hanuman::ObservationAnswer' do
    observation
    answer_choice
  end
end
