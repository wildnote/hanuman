FactoryGirl.define do
  factory :hanuman_observation_signature, class: 'Hanuman::ObservationSignature' do
    observation nil
    signature "MyString"
  end
end
