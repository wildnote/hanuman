require 'test_helper'

module Hanuman
  class SurveyStepsControllerTest < ActionController::TestCase
    setup do
      @survey_step = survey_steps(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:survey_steps)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create survey_step" do
      assert_difference('SurveyStep.count') do
        post :create, survey_step: { duplicator: @survey_step.duplicator, step: @survey_step.step, survey_template_id: @survey_step.survey_template_id }
      end

      assert_redirected_to survey_step_path(assigns(:survey_step))
    end

    test "should show survey_step" do
      get :show, id: @survey_step
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @survey_step
      assert_response :success
    end

    test "should update survey_step" do
      patch :update, id: @survey_step, survey_step: { duplicator: @survey_step.duplicator, step: @survey_step.step, survey_template_id: @survey_step.survey_template_id }
      assert_redirected_to survey_step_path(assigns(:survey_step))
    end

    test "should destroy survey_step" do
      assert_difference('SurveyStep.count', -1) do
        delete :destroy, id: @survey_step
      end

      assert_redirected_to survey_steps_path
    end
  end
end
