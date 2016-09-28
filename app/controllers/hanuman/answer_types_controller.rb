require_dependency "hanuman/application_controller"

module Hanuman
  class AnswerTypesController < ApplicationController
    helper_method :sort_column, :sort_direction
    before_action :set_answer_type, only: [:show, :edit, :update, :destroy]
    # GET /answer_types
    def index
      @answer_types = AnswerType.sort(sort_column, sort_direction).page(params[:page])
    end

    # GET /answer_types/1
    def show
    end

    # GET /answer_types/new
    def new
      @answer_type = AnswerType.new
    end

    # GET /answer_types/1/edit
    def edit
    end

    # POST /answer_types
    def create
      @answer_type = AnswerType.new(answer_type_params)

      if @answer_type.save
        redirect_to @answer_type, notice: 'Answer type was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /answer_types/1
    def update
      if @answer_type.update(answer_type_params)
        redirect_to @answer_type, notice: 'Answer type was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /answer_types/1
    def destroy
      @answer_type.destroy
      redirect_to answer_types_url, notice: 'Answer type was successfully destroyed.'
    end

    # helper methods
    def sort_column
      !params[:sort].blank? ? params[:sort] : "hanuman_answer_types.name asc, hanuman_answer_types.element_type asc, hanuman_answer_types.descriptive_name asc, hanuman_answer_types.description asc, hanuman_answer_types.has_answer_choices asc, hanuman_answer_types.answer_choice_type asc, hanuman_answer_types.external_data_source asc, hanuman_answer_types.status asc"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_answer_type
        @answer_type = AnswerType.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def answer_type_params
        params.require(:answer_type).permit(:name, :status, :descriptive_name, :has_answer_choices, :external_data_source, :description, :answer_choice_type, :element_type)
      end
  end
end
