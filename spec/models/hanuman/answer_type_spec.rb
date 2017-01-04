require 'spec_helper'

module Hanuman
  RSpec.describe AnswerType, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:answer_type)).to be_valid
      end

      it { is_expected.to validate_presence_of(:name) }
      it { is_expected.to validate_uniqueness_of(:name) }
      it do
        is_expected.to validate_inclusion_of(:status)
                            .in_array(Hanuman::AnswerType::ANSWER_CHOICE_STATUSES)
      end
    end

    describe 'Relations' do
      it { is_expected.to have_many(:questions).dependent(:restrict_with_exception) }
    end
  end
end