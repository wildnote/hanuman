require 'test_helper'

module Hanuman
  class AnswerTypesControllerTest < ActionController::TestCase
    setup do
      @answer_type = answer_types(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:answer_types)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create answer_type" do
      assert_difference('AnswerType.count') do
        post :create, answer_type: { name: @answer_type.name, status: @answer_type.status }
      end

      assert_redirected_to answer_type_path(assigns(:answer_type))
    end

    test "should show answer_type" do
      get :show, id: @answer_type
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @answer_type
      assert_response :success
    end

    test "should update answer_type" do
      patch :update, id: @answer_type, answer_type: { name: @answer_type.name, status: @answer_type.status }
      assert_redirected_to answer_type_path(assigns(:answer_type))
    end

    test "should destroy answer_type" do
      assert_difference('AnswerType.count', -1) do
        delete :destroy, id: @answer_type
      end

      assert_redirected_to answer_types_path
    end
  end
end
