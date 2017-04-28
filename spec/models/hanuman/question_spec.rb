require 'spec_helper'

module Hanuman
  RSpec.describe Question, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:question)).to be_valid
      end

      it { is_expected.to validate_presence_of(:answer_type_id) }
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:answer_type) }
      it { is_expected.to belong_to(:survey_template) }
      it { is_expected.to have_many(:answer_choices).dependent(:destroy) }
      it { is_expected.to have_many(:observations).dependent(:destroy) }
      it { is_expected.to have_one(:rule).dependent(:destroy) }
      it { is_expected.to have_many(:conditions).dependent(:destroy) }
    end

    describe 'Callbacks' do
      it { is_expected.to callback(:process_question_changes_on_observations).after(:create) }
      it { is_expected.to callback(:process_question_changes_on_observations).after(:update) }
    end
  end
end