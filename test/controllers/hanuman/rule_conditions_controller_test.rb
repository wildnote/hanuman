require 'test_helper'

module Hanuman
  class RuleConditionsControllerTest < ActionController::TestCase
    setup do
      @rule_condition = rule_conditions(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:rule_conditions)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create rule_condition" do
      assert_difference('RuleCondition.count') do
        post :create, rule_condition: { condition_id: @rule_condition.condition_id, rule_id: @rule_condition.rule_id }
      end

      assert_redirected_to rule_condition_path(assigns(:rule_condition))
    end

    test "should show rule_condition" do
      get :show, id: @rule_condition
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @rule_condition
      assert_response :success
    end

    test "should update rule_condition" do
      patch :update, id: @rule_condition, rule_condition: { condition_id: @rule_condition.condition_id, rule_id: @rule_condition.rule_id }
      assert_redirected_to rule_condition_path(assigns(:rule_condition))
    end

    test "should destroy rule_condition" do
      assert_difference('RuleCondition.count', -1) do
        delete :destroy, id: @rule_condition
      end

      assert_redirected_to rule_conditions_path
    end
  end
end
