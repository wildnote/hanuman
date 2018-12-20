require 'spec_helper'

describe Hanuman::Api::V1::SurveyTemplatesController, type: :controller do
  routes { Hanuman::Engine.routes }

  it { expect(subject.class.superclass.name).to eq('Hanuman::Api::V1::BaseController') }

  before :each do
    request.env["HTTP_ACCEPT"] = 'application/json'
  end

  let(:survey_template) { create(:survey_template) }

  describe 'PUT#update' do
    context 'with valid params' do
      let(:valid_params_to_update) {{name: "New name"}}
      it "updates the survey_template" do
        # Assuming there are no other survey_templates in the database, this
        # specifies that the Hanuman::SurveyTemplate created on the previous line
        # receives the :update_attributes message with whatever params are
        # submitted in the request.
        allow_any_instance_of(Hanuman::SurveyTemplate).to receive(:update).with(valid_params_to_update)
        put :update, id: survey_template, survey_template: valid_params_to_update
        expect(response).to be_success
      end

    end

    context 'with invalid params' do
      let(:invalid_params_to_update) {{name: nil}}
      it 'returns the error message' do
        put :update, id: survey_template, survey_template: invalid_params_to_update
        expect(response).not_to be_success
        expect(json['errors']).not_to be_nil
      end
    end
  end

  describe 'PUT#available_tags' do
    let!(:questions) { create_list(:question, 3, :with_tags, survey_template: survey_template) }
    it 'returns all questions tags' do
      get :available_tags, id: survey_template
      expect(response).to be_success
      expect(json['tags'].length).to eql 6
    end
  end
end
