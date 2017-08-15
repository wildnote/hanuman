require 'spec_helper'

module Hanuman
  RSpec.describe Survey, type: :model do
    describe 'Validations' do
      it 'has a valid factory' do
        expect(build(:survey)).to be_valid
      end

      it { is_expected.to validate_presence_of(:survey_template_id) }
      it { is_expected.to validate_presence_of(:survey_date) }
    end

    describe 'Relations' do
      it { is_expected.to belong_to(:survey_template) }
      it { is_expected.to have_many(:observations).dependent(:destroy) }
      it { is_expected.to have_one(:survey_extension).dependent(:delete) }
    end

    describe 'Callbacks' do
      it { is_expected.to callback(:apply_group_sort).before(:save) }
    end
  end
end
