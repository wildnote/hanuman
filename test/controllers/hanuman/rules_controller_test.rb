require 'test_helper'

module Hanuman
  class RulesControllerTest < ActionController::TestCase
    setup do
      @rule = rules(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:rules)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create rule" do
      assert_difference('Rule.count') do
        post :create, rule: { match_type: @rule.match_type, question_id: @rule.question_id }
      end

      assert_redirected_to rule_path(assigns(:rule))
    end

    test "should show rule" do
      get :show, id: @rule
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @rule
      assert_response :success
    end

    test "should update rule" do
      patch :update, id: @rule, rule: { match_type: @rule.match_type, question_id: @rule.question_id }
      assert_redirected_to rule_path(assigns(:rule))
    end

    test "should destroy rule" do
      assert_difference('Rule.count', -1) do
        delete :destroy, id: @rule
      end

      assert_redirected_to rules_path
    end
  end
end
