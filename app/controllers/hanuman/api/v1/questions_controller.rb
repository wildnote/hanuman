module Hanuman
  class Api::V1::QuestionsController < Api::V1::BaseController
    respond_to :json

    def paper_trail_enabled_for_controller
      request.params[:action] != 'duplicate'
    end

    def index
      if params[:ids]
        respond_with Question.includes(:taggings, :answer_choices, rules: [:conditions]).where(id: params[:ids], marked_for_deletion: false)
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
      
      begin
        question = Question.find(params[:id])
        question.paper_trail.without_versioning do
          respond_with question.destroy
        end
      rescue Rack::Timeout::RequestTimeoutException => e
        Honeybadger.notify(e, context: {
          name: "Question Deletion Sent To Worker",
          current_user_id: current_user.id,
          true_user_id: true_user.id,
          user_name: (current_user.present? ? current_user.name : "")
        })
        question = Question.find(params[:id])
        question.mark_all_descendants_for_deletion
        DestroyQuestionWorker.perform_async(question.id, true_user.id)

        respond_with {}
      end
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

    def process_question_changes
      question = Question.find(params[:id])
      question.process_question_changes_on_observations
      respond_with question
    end

    private

    def question_params
      params.require(:question).permit(
        :question_text, :answer_type_id, :sort_order, :survey_template_id, :required, :external_data_source,
        :hidden, :parent_id, :capture_location_data, :data_source_id, :enable_survey_history, :new_project_location,
        :combine_latlong_as_polygon, :combine_latlong_as_line, :enable_survey_history,
        :layout_section, :layout_row, :layout_column, :layout_column_position, :default_answer,
        :export_continuation_characters, :helper_text, :tag_list, :max_photos, :db_column_name, :api_column_name, :css_style, :report_children_width,
        :marked_for_deletion, :flagged_answers, :report_label, :exclude_from_report, :convert_to_utm
      )
    end

  end
end
