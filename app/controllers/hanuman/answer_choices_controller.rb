require_dependency "hanuman/application_controller"

module Hanuman
  class AnswerChoicesController < ApplicationController
    helper_method :sort_column, :sort_direction
    before_action :set_answer_choice, only: [:show, :edit, :update, :destroy]

    # GET /answer_choices
    def index
      @answer_choices = AnswerChoice.filtered_by_question_id_and_sort(params[:question_id], sort_column, sort_direction).page(params[:page])
      respond_to do |format|
        format.html # index.html.erb
        format.json { render json: @answer_choices.to_json(methods: :formatted_answer_choice)}
      end
    end

    # GET /answer_choices/1
    def show
    end

    # GET /answer_choices/new
    def new
      @answer_choice = AnswerChoice.new
    end

    # GET /answer_choices/1/edit
    def edit
    end

    # POST /answer_choices
    def create
      @answer_choice = AnswerChoice.new(answer_choice_params)

      if @answer_choice.save
        redirect_to @answer_choice, notice: 'Answer choice was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /answer_choices/1
    def update
      if @answer_choice.update(answer_choice_params)
        redirect_to @answer_choice, notice: 'Answer choice was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /answer_choices/1
    def destroy
      @answer_choice.destroy
      redirect_to answer_choices_url, notice: 'Answer choice was successfully destroyed.'
    end

    # helper methods
    def sort_column
      !params[:sort].blank? ? params[:sort] : "hanuman_questions.question_text asc, hanuman_answer_choices.option_text asc, hanuman_answer_choices.scientific_text asc"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_answer_choice
        @answer_choice = AnswerChoice.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def answer_choice_params
        params.require(:answer_choice).permit(:question_id, :option_text, :scientific_text)
      end
  end
end
