require 'spec_helper'

module Hanuman
  RSpec.describe ObservationAnswer, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:observation_answer)).to be_valid
      end
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:observation) }
      it { is_expected.to have_one(:survey).through(:observation) }
      it { is_expected.to belong_to(:answer_choice) }
      it { is_expected.to belong_to(:multiselectable) }
    end
  end
end