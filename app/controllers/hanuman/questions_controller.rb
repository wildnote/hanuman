require_dependency "hanuman/application_controller"

module Hanuman
  class QuestionsController < ApplicationController
    helper_method :sort_column, :sort_direction
    before_action :set_question, only: [:show, :edit, :update, :destroy]

    # GET /questions
    def index
      @questions = Question.sort(sort_column, sort_direction).page(params[:page])
    end

    # GET /questions/1
    def show
      respond_to do |format|
        format.html
        format.json {render json: @question}
      end
    end

    # GET /questions/new
    def new
      @question = Question.new
    end

    # GET /questions/1/edit
    def edit
    end

    # POST /questions
    def create
      @question = Question.new(question_params)

      if @question.save
        redirect_to @question, notice: 'Question was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /questions/1
    def update
      if @question.update(question_params)
        redirect_to @question, notice: 'Question was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /questions/1
    def destroy
      @question.destroy
      redirect_to questions_url, notice: 'Question was successfully destroyed.'
    end

    # build up form to grab data to import answer options
    # GET /questions/import_answer_choices
    def import_answer_choices
      @questions = Question.all.order("id")
    end

    # import answer options
    # POST /questions/import
    def import
      question_id = params[:question_id]
      file = params[:file]
      unless question_id.blank?
        question = Question.find question_id
        file_path = params[:file].path
        file_name = params[:file].original_filename
        project_id = question.id
        args = {file_path: file_path, question_id: question_id, file_name: file_name}
        ImportWorker.perform_async(args)
        redirect_to question, notice: 'Answer choices are being imported, refresh page to view them.'
      end
    end

    # helper methods
    def sort_column
      !params[:sort].blank? ? params[:sort] : "hanuman_questions.question_text asc, hanuman_answer_types.name asc"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_question
        @question = Question.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def question_params
        params.require(:question).permit(
          :question_text, :answer_type_id, :sort_order,
          :combine_latlong_as_polygon, :combine_latlong_as_line, :enable_survey_history,
          :layout_section, :layout_row, :layout_column, :layout_column_position, :default_answer
        )
      end
  end
end
