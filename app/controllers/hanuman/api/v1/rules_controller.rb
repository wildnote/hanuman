module Hanuman
  class Api::V1::RulesController < Api::V1::BaseController
    respond_to :json

    def index
      respond_with Rule.includes(:conditions).all
    end

    def show
      rule = Rule.includes(:conditions).find(params[:id])

      # Log what we're returning for debugging
      Rails.logger.info "DEBUGGING: Rule #{rule.id} has #{rule.conditions.size} conditions"

      # Log each condition
      rule.conditions.each do |condition|
        Rails.logger.info "DEBUGGING: Condition #{condition.id}: operator=#{condition.operator}, answer=#{condition.answer}, question_id=#{condition.question_id}"
      end

      # Check if the rule actually has the conditions loaded
      if rule.association(:conditions).loaded?
        Rails.logger.info "DEBUGGING: Rule #{rule.id} has conditions loaded"
      else
        Rails.logger.info "DEBUGGING: Rule #{rule.id} does NOT have conditions loaded"
      end

      # Log the actual JSON that will be returned
      serialized = ActiveModelSerializers::SerializableResource.new(rule, root: :rule).as_json
      Rails.logger.info "DEBUGGING: Serialized rule: #{serialized.inspect}"

      respond_with rule, root: :rule
    end

    def create
      rule = Rule.create(rule_params)
      respond_with rule, location: -> { api_v1_rules_path(rule) }, root: :rule
    end

    def update
      rule = Rule.find(params[:id])
      rule.update(rule_params)
      respond_with rule, root: :rule
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
      params.require(:rule).permit(:match_type, :question_id, :value, :type, :script)
    end
  end
end
