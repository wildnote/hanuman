require 'spec_helper'

describe Hanuman::Api::V1::QuestionsController, type: :controller do
  routes { Hanuman::Engine.routes }

  it { expect(subject.class.superclass.name).to eq('Hanuman::Api::V1::BaseController') }

  before :each do
    request.env["HTTP_ACCEPT"] = 'application/json'
  end

  let(:question) { create(:question) }

  describe 'POST#duplicate' do
    it 'duplicates the given question' do
      allow_any_instance_of(Hanuman::Question).to receive(:duplicate)
      post :duplicate, id: question
      expect(response).to be_success
    end
  end


  describe 'PUT#update' do
    context 'with valid params' do
      let(:valid_params_to_update) {{helper_text: "This is text"}}
      it "updates the question" do
        # Assuming there are no other questions in the database, this
        # specifies that the Hanuman::SurveyTemplate created on the previous line
        # receives the :update_attributes message with whatever params are
        # submitted in the request.
        allow_any_instance_of(Hanuman::Question).to receive(:update).with(valid_params_to_update)
        put :update, id: question, question: valid_params_to_update
        expect(response).to be_success
        question.reload
        expect(question.helper_text).to eql('This is text')
      end
    end

    context 'with invalid params' do
      let(:invalid_params_to_update) {{question_text: nil}}
      it 'returns the error message' do
        put :update, id: question, question: invalid_params_to_update
        expect(response).not_to be_success
        expect(json['errors']).not_to be_nil
      end
    end
  end
end
