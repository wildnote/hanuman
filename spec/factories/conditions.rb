FactoryBot.define do
  factory :condition, class: 'Hanuman::Condition' do
    question
    rule
    operator { Hanuman::Condition::OPERATORS.sample }
  end
end
