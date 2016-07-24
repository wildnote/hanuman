require 'spec_helper'

module Hanuman
  RSpec.describe Rule, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:rule)).to be_valid
      end
      it do
        is_expected.to validate_inclusion_of(:match_type)
                            .in_array(Hanuman::Rule::MATCH_TYPES)
      end
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:question) }
      it { is_expected.to have_many(:conditions).dependent(:destroy) }
    end
  end
end
