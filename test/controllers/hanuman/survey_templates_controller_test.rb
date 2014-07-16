require 'test_helper'

module Hanuman
  class SurveyTemplatesControllerTest < ActionController::TestCase
    setup do
      @survey_template = survey_templates(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:survey_templates)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create survey_template" do
      assert_difference('SurveyTemplate.count') do
        post :create, survey_template: { name: @survey_template.name, status: @survey_template.status, survey_type: @survey_template.survey_type }
      end

      assert_redirected_to survey_template_path(assigns(:survey_template))
    end

    test "should show survey_template" do
      get :show, id: @survey_template
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @survey_template
      assert_response :success
    end

    test "should update survey_template" do
      patch :update, id: @survey_template, survey_template: { name: @survey_template.name, status: @survey_template.status, survey_type: @survey_template.survey_type }
      assert_redirected_to survey_template_path(assigns(:survey_template))
    end

    test "should destroy survey_template" do
      assert_difference('SurveyTemplate.count', -1) do
        delete :destroy, id: @survey_template
      end

      assert_redirected_to survey_templates_path
    end
  end
end
