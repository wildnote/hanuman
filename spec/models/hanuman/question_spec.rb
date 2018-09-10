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
      it { is_expected.to have_many(:rules).dependent(:destroy) }
      it { is_expected.to have_many(:conditions).dependent(:destroy) }
    end

    describe 'Instance methods' do
      describe '#question_text_not_required' do
        let(:question) { create(:question) }
        context 'when `answer_type` is equals to `line`' do
          before do
            question.answer_type.name = 'line'
            question.answer_type.save
          end
          it 'returns `true`' do
            expect(question.question_text_not_required).to be_truthy
          end
        end
        context 'when `answer_type` is not equal to `line` or `nil`' do
          before do
            question.answer_type.name = 'fasdfasd'
            question.answer_type.save
          end
          it 'returns `false`' do
            expect(question.question_text_not_required).to be_falsy
          end
        end
      end
      describe '#dup_and_save' do
        context 'when a question has multiple conditions' do
          let(:question_to_duplicate) { create(:question, :with_rule_and_coditions, number_of_conditions: 2) }
          it 'duplicates and saves a single question with answer choices and conditions' do
            new_question = question_to_duplicate.dup_and_save
            expect(new_question.rules.first.conditions.count).to equal(2)
            expect(new_question.rules.first.id).to_not equal(question_to_duplicate.rule.id)
          end
        end

        context 'when a question dependent conditions' do
          let(:question_with_conditions) { create(:question, :with_rule_and_coditions, number_of_conditions: 2) }
          it 'doesn`t re-add conditions to an existing question' do
            question_to_duplicate = question_with_conditions.rules.first.conditions.first.question
            question_to_duplicate.dup_and_save
            expect(question_with_conditions.rules.first.conditions.count).to equal(2)
          end
        end
      end
    end
  end
end
