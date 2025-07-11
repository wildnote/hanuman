module Hanuman
  class Api::V1::SurveyTemplatesController < Api::V1::BaseController
    before_action :set_survey_template, only: [:show, :update, :duplicate]

    respond_to :json

    def paper_trail_enabled_for_controller
      request.params[:action] != 'resort_questions'
    end

    def index
      respond_with SurveyTemplate.all
    end

    def show
      respond_with @survey_template
    end

    def create
      respond_with :api, :v1, SurveyTemplate.create(survey_template_params)
    end

    def update
      @survey_template.update(survey_template_params)
      respond_with @survey_template
    end

    def duplicate
      survey_template_copy = @survey_template.amoeba_dup
      survey_template_copy.remap_conditional_logic(@survey_template) if survey_template_copy.save
      respond_with survey_template_copy
    end

    def check_template
      survey_template = SurveyTemplate.find(params[:id])
      errors = survey_template.check_structure_and_rules
      render json: errors.to_json
    end

    def destroy
      survey_template = SurveyTemplate.find(params[:id])
      if survey_template.fully_editable
        respond_with survey_template.destroy
      else
        render json: { "errors" => [ { "detail": "associated-data-restriction" } ] }, status: :unprocessable_entity
      end
    end

    def resort_questions
      Rails.logger.info "=== RESORT_QUESTIONS DEBUG ==="
      Rails.logger.info "Params: #{params.inspect}"
      Rails.logger.info "IDs: #{params[:ids].inspect}"
      
      if params[:ids].present?
        params[:ids].each_with_index do |id, i|
          new_sort_order = i + 1
          Rails.logger.info "Updating question #{id} to sort_order #{new_sort_order}"
          
          # Use find and save to ensure delta generation works
          question = Question.find(id)
          if question.sort_order != new_sort_order
            question.sort_order = new_sort_order
            question.save!
          end
          
          # Verify the update
          Rails.logger.info "Question #{id} sort_order after update: #{question.sort_order}"
        end
      end
      
      head :no_content
    end

    def available_tags
      survey_template = SurveyTemplate.find(params[:id])
      tags = survey_template.questions.map(&:tag_list).split(',').flatten.uniq
      render json: { tags: tags }, status: :ok
    rescue ActsAsTaggableOn::DuplicateTagError
      render json: { tags: tags }, status: :ok
    end

    private

    def set_survey_template
      @survey_template = SurveyTemplate.find(params[:id])
    end

    def survey_template_params
      params.require(:survey_template).permit(:name, :status, :survey_type)
    end
  end
end
