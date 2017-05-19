require 'spec_helper'

module Hanuman
  RSpec.describe Observation, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:observation)).to be_valid
      end

      it { is_expected.to validate_presence_of(:question_id) }
      it { is_expected.to validate_presence_of(:entry) }
      it { is_expected.to delegate_method(:question_text).to(:question) }
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:survey) }
      it { is_expected.to belong_to(:question) }
      it { is_expected.to belong_to(:selectable) }

      it { is_expected.to have_many(:observation_answers).dependent(:destroy) }
      it { is_expected.to have_many(:answer_choices).through(:observation_answers) }
    end

    describe 'Callbacks' do
      it { is_expected.to callback(:strip_and_squish_answer).before(:save) }
    end
  end
end