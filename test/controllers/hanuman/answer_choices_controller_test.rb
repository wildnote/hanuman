require 'test_helper'

module Hanuman
  class AnswerChoicesControllerTest < ActionController::TestCase
    setup do
      @answer_choice = answer_choices(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:answer_choices)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create answer_choice" do
      assert_difference('AnswerChoice.count') do
        post :create, answer_choice: { option_text: @answer_choice.option_text, question_id: @answer_choice.question_id }
      end

      assert_redirected_to answer_choice_path(assigns(:answer_choice))
    end

    test "should show answer_choice" do
      get :show, id: @answer_choice
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @answer_choice
      assert_response :success
    end

    test "should update answer_choice" do
      patch :update, id: @answer_choice, answer_choice: { option_text: @answer_choice.option_text, question_id: @answer_choice.question_id }
      assert_redirected_to answer_choice_path(assigns(:answer_choice))
    end

    test "should destroy answer_choice" do
      assert_difference('AnswerChoice.count', -1) do
        delete :destroy, id: @answer_choice
      end

      assert_redirected_to answer_choices_path
    end
  end
end
