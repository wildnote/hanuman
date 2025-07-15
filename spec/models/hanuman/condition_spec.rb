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

      describe 'answer validation' do
        let(:rule) { create(:rule) }
        let(:question) { create(:question) }

        context 'when operator requires an answer' do
          %w[is_equal_to is_not_equal_to is_greater_than is_less_than starts_with contains].each do |operator|
            it "requires answer for '#{operator}' operator" do
              condition = build(:condition, rule: rule, question: question, operator: operator, answer: '')
              expect(condition).not_to be_valid
              expect(condition.errors[:answer]).to include("can't be blank")
            end

            it "is valid with answer for '#{operator}' operator" do
              condition = build(:condition, rule: rule, question: question, operator: operator, answer: 'some answer')
              expect(condition).to be_valid
            end
          end
        end

        context 'when operator does not require an answer' do
          %w[is_empty is_not_empty].each do |operator|
            it "does not require answer for '#{operator}' operator" do
              condition = build(:condition, rule: rule, question: question, operator: operator, answer: '')
              expect(condition).to be_valid
            end

            it "is valid with empty answer for '#{operator}' operator" do
              condition = build(:condition, rule: rule, question: question, operator: operator, answer: nil)
              expect(condition).to be_valid
            end
          end
        end
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
