require 'spec_helper'

module Hanuman
  RSpec.describe AnswerChoice, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:answer_choice)).to be_valid
      end

      it { is_expected.to validate_presence_of(:option_text) }
      it { is_expected.to validate_presence_of(:question) }
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:question).inverse_of(:answer_choices) }
    end
  end
end