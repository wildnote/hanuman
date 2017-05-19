require 'spec_helper'

module Hanuman
  RSpec.describe SurveyStep, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:survey_step)).to be_valid
      end

      it { is_expected.to validate_presence_of(:step) }
      it { is_expected.to validate_presence_of(:survey_template) }
      it { is_expected.to validate_uniqueness_of(:step).scoped_to(:survey_template_id) }
    end

    describe 'Relations' do
      it { is_expected.to have_many(:questions).dependent(:destroy) }
      it { is_expected.to belong_to(:survey_template) }
    end
  end
end