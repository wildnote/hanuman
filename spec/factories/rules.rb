require 'faker'

FactoryBot.define do
  factory :rule, class: 'Hanuman::Rule' do
    question
		match_type 	{ Hanuman::Rule::MATCH_TYPES.sample }
  end
end
