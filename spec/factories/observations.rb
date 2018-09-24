require 'faker'

FactoryBot.define do
  factory :observation, class: 'Hanuman::Observation' do
    question
    answer  { Faker::Lorem.word }
    notes   { Faker::Lorem.sentence(3) }
  end
end
