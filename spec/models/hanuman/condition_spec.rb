require 'spec_helper'

module Hanuman
  RSpec.describe Condition, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:condition)).to be_valid
      end

      it { is_expected.to validate_presence_of(:rule_id) }
      it do
        is_expected.to validate_inclusion_of(:operator)
                            .in_array(Hanuman::Condition::OPERATORS)
      end
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:question) }
      it { is_expected.to belong_to(:rule) }
    end

    describe 'Callbacks' do
      it { is_expected.to callback(:cleanup_rule_if_single_condition).after(:destroy) }
    end
  end
end
