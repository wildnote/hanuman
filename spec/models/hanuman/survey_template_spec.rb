require 'spec_helper'

module Hanuman
  RSpec.describe SurveyTemplate, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:survey_template)).to be_valid
      end

      it { is_expected.to validate_presence_of(:name) }
      it do
        is_expected.to validate_inclusion_of(:status)
                            .in_array(Hanuman::SurveyTemplate::STATUSES)
      end
    end

    describe 'Relations' do
      it { is_expected.to have_many(:questions).dependent(:destroy) }
      it { is_expected.to have_many(:surveys).dependent(:restrict_with_exception) }
    end
  end
end