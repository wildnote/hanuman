module Hanuman
  class Api::V1::QuestionsController < Api::V1::BaseController
    respond_to :json

    def index
      if params[:ids]
        respond_with Question.where(id: params[:ids])
      else
        respond_with []
      end
    end

    def show
      respond_with Question.find(params[:id])
    end

    def create
      respond_with :api, :v1, Question.create(question_params)
    end

    def update
      question = Question.find(params[:id])
      question.update_attributes(question_params)
      respond_with question
    end

    def destroy
      question = Question.find(params[:id])
      respond_with question.destroy
    end

    def duplicate
      question = Question.find(params[:id])
      duplicated_question =
        if params[:section]
          question.dup_section
        else
          question.dup_and_save
        end
      respond_with duplicated_question
    end

    private

    def question_params
      params.require(:question).permit(
        :question_text, :answer_type_id, :sort_order, :survey_template_id, :required, :external_data_source,
        :hidden, :parent_id, :capture_location_data, :data_source_id, :enable_survey_history, :new_project_location,
        :combine_latlong_as_polygon, :combine_latlong_as_line, :enable_survey_history,
        :layout_section, :layout_row, :layout_column, :layout_column_position, :default_answer
      )
    end

  end
end
