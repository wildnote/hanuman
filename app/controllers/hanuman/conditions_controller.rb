require_dependency "hanuman/application_controller"

module Hanuman
  class ConditionsController < ApplicationController
    before_action :set_condition, only: [:show, :edit, :update, :destroy]

    # GET /conditions
    def index
      @conditions = Condition.all
    end

    # GET /conditions/1
    def show
    end

    # GET /conditions/new
    def new
      @condition = Condition.new
    end

    # GET /conditions/1/edit
    def edit
    end

    # POST /conditions
    def create
      @condition = Condition.new(condition_params)

      if @condition.save
        redirect_to @condition, notice: 'Condition was successfully created.'
      else
        render :new
      end
    end

    # PATCH/PUT /conditions/1
    def update
      if @condition.update(condition_params)
        redirect_to @condition, notice: 'Condition was successfully updated.'
      else
        render :edit
      end
    end

    # DELETE /conditions/1
    def destroy
      @condition.destroy
      redirect_to conditions_url, notice: 'Condition was successfully destroyed.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_condition
        @condition = Condition.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def condition_params
        params.require(:condition).permit(:question_id, :operator, :answer)
      end
  end
end
