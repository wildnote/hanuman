FactoryGirl.define do
  sequence(:unique_name) { |n| "name #{n}" }
end