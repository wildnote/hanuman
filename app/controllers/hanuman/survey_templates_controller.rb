require_dependency "hanuman/application_controller"

module Hanuman
  class SurveyTemplatesController < ApplicationController
    respond_to :json, :html
    before_action :set_survey_template, only: [:show, :edit, :update, :destroy, :duplicate, :update_survey_data]

    # GET /survey_templates
    def index
      @survey_templates = SurveyTemplate.all_sorted.page(params[:page])
      respond_to do |format|
        format.html
        format.json {render json: @survey_templates}
      end
    end

    # GET /survey_templates/1
    def show
      respond_to do |format|
        format.html
        format.json {render json: @survey_template}
      end
    end

    # GET /survey_templates/new
    def new
      @survey_template = SurveyTemplate.new
    end

    # GET /survey_templates/1/edit
    def edit
      @project_id = request.fullpath.split("/")[3]
    end

    # POST /survey_templates
    def create
      @survey_template = SurveyTemplate.new(survey_template_params)

      if @survey_template.save
        survey_template_ember_link = admin_path + "/survey_templates/" + @survey_template.id.to_s
        redirect_to survey_template_ember_link, notice: 'Survey template was successfully created.'
      else
        render action: 'new'
      end
    end

    # PATCH/PUT /survey_templates/1
    def update
      if @survey_template.update(survey_template_params)
        redirect_to @survey_template, notice: 'Survey template was successfully updated.'
      else
        render action: 'edit'
      end
    end

    # DELETE /survey_templates/1
    def destroy
      # customizing delete to return validation message when a user tries to delete a survey template with surveys already submitted against it
      begin
        @survey_template.destroy
        flash[:success] = "Survey template was successfully destroyed."
      rescue ActiveRecord::DeleteRestrictionError => e
        @survey_template.errors.add(:base, e)
        flash[:alert] = "#{e}"
      ensure
        redirect_to survey_templates_url
      end
    end

    def duplicate
      survey_template_copy = @survey_template.amoeba_dup

      respond_to do |format|
        if survey_template_copy.save!
          remap_conditional_logic(@survey_template)
          format.html { redirect_to admin_path + "/survey_templates/" + survey_template.id.to_s + "/edit", notice: 'Survey template was successfully duplicated, please rename.' }
          format.json { render :show, status: :created, location: @location }
        else
          format.html { redirect_to survey_templates_path, alert: 'There was an error duplicating your template: ' + survey_template_copy.errors.full_messages.to_sentence + '.'}
          format.json { render json: survey_template_copy.errors, status: :unprocessable_entity }
        end
      end
    end

    def update_survey_data
      @survey_template.resort_submitted_observations
      survey_template_ember_link = admin_path + "/survey_templates/" + @survey_template.id.to_s
      redirect_to survey_template_ember_link, notice: 'Survey data resorted.'
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_survey_template
        @survey_template = SurveyTemplate.find(params[:id])
      end

      # Only allow a trusted parameter "white list" through.
      def survey_template_params
        params.require(:survey_template).permit(:name, :status, :survey_type)
      end
  end
end
