require_dependency "hanuman/application_controller"

module Hanuman
  class RuleConditionsController < ApplicationController
    before_action :set_rule_condition, only: [:show, :edit, :update, :destroy]

    # GET /rule_conditions
    def index
      @rule_conditions = RuleCondition.all
    end

    # GET /rule_conditions/1
    def show
    end

    # GET /rule_conditions/new
    def new
      @rule_condition = RuleCondition.new
    end

    # GET /rule_conditions/1/edit
    def edit
    end

    # POST /rule_conditions
    def create
      @rule_condition = RuleCondition.new(rule_condition_params)

      if @rule_condition.save
        redirect_to @rule_condition, notice: 'Rule condition was successfully created.'
      else
        render :new
      end
    end

    # PATCH/PUT /rule_conditions/1
    def update
      if @rule_condition.update(rule_condition_params)
        redirect_to @rule_condition, notice: 'Rule condition was successfully updated.'
      else
        render :edit
      end
    end

    # DELETE /rule_conditions/1
    def destroy
      @rule_condition.destroy
      redirect_to rule_conditions_url, notice: 'Rule condition was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_rule_condition
        @rule_condition = RuleCondition.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def rule_condition_params
        params.require(:rule_condition).permit(:rule_id, :condition_id)
      end
  end
end
