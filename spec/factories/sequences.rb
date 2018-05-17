FactoryBot.define do
  sequence(:unique_name) { |n| "name #{n}" }
  sequence(:unique_number) { |n| n }
end
