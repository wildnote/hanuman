require_dependency "hanuman/application_controller"

module Hanuman
  class AnswerTypesController < ApplicationController
    before_action :set_answer_type, only: [:show, :edit, :update, :destroy]

    # GET /answer_types
    def index
      @answer_types = AnswerType.order('name')
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
