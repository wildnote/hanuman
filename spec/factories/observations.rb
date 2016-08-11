require 'faker'

FactoryGirl.define do
  factory :observation, class: 'Hanuman::Observation' do
    question
    entry   { (1..5).to_a.sample }
    answer  { Faker::Lorem.word }
    notes   { Faker::Lorem.sentence(3) }
  end
end
