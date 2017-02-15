module Hanuman
  class Api::V1::ConditionsController < Api::V1::BaseController
    respond_to :json

    def index
      respond_with Condition.all
    end

    def show
      respond_with Condition.find(params[:id])
    end

    def create
      respond_with :api, :v1, Condition.create(condition_params)
    end

    def update
      condition = Condition.find(params[:id])
      condition.update(condition_params)
      respond_with condition
    end

    def destroy
      condition = Condition.find(params[:id])
      respond_with condition.destroy
    end

    private

    def condition_params
      params.require(:condition).permit(:operator, :answer, :question_id, :rule_id)
    end
  end
end
