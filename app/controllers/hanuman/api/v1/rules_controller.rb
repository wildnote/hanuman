module Hanuman
  class Api::V1::RulesController < Api::V1::BaseController
    respond_to :json

    def index
      respond_with Rule.all
    end

    def show
      respond_with Rule.find(params[:id])
    end

    def create
      rule = Rule.create(rule_params)
      respond_with rule, location: -> { api_v1_rules_path(rule) }, root: :rule
    end

    def update
      rule = Rule.find(params[:id])
      rule.update(rule_params)
      respond_with rule
    end

    def destroy
      rule = Rule.find(params[:id])
      respond_with rule.destroy
    end

    private

    def rule_params
      # RTC Name rule example
      # value: 135155,135156
      # type: Hanuman::LookupRule
      params.require(:rule).permit(:match_type, :question_id, :value, :type)
    end
  end
end
