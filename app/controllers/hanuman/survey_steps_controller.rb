require_dependency "hanuman/application_controller"

module Hanuman
  class SurveyStepsController < ApplicationController
    include Wicked::Wizard
    steps :step_2, :step_3

    def show
      # doesn't feel right to set survey_id in session here
      @survey = Survey.includes(:observations => [:survey_question => [:question => [:answer_type]]]).find session[:survey_id]
      set = @survey.observations.maximum(:set) + 1
      survey_template = @survey.survey_template
      case step
      when :step_2
        survey_template.survey_questions.by_step('step_2').each do |sq|
          @survey.observations.build(survey_question_id: sq.id, set: set)
        end
      when :step_3
        survey_template.survey_questions.by_step('step_3').each do |sq|
          @survey.observations.build(survey_question_id: sq.id, set: 9999)
        end
      end
      render_wizard
    end

    def update
      @survey = Survey.find session[:survey_id]
      @survey.attributes = survey_params

      #sign_in(current_user, :bypass => true) # needed for devise

      if params[:commit].eql? 'Save + Add Another'
        @survey.save
        set = @survey.observations.maximum(:set) + 1
        survey_template = @survey.survey_template
        survey_template.survey_questions.by_step('step_2').each do |sq|
          @survey.observations.build(survey_question_id: sq.id, set: set)
        end
        render_wizard
      else
        render_wizard @survey
      end
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      #def set_survey
      #  @survey = Survey.find(params[:id])
      #end

      def finish_wizard_path
        survey_path(@survey)
      end

      # Only allow a trusted parameter "white list" through.
      def survey_params
        params.require(:survey).permit(
          :survey_template_id,
          :survey_date,
          survey_extension_attributes: [
            :id
          ],
          observations_attributes: [
            :id,
            :survey_question_id,
            :answer,
            :set,
            answer_choice_ids: []
          ]
        )
      end
  end
end
