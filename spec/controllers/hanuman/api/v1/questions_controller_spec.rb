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
end
