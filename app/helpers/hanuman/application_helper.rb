module Hanuman
  module ApplicationHelper
    def method_missing(method, *args, &block)
      if (method.to_s.end_with?('_path') || method.to_s.end_with?('_url')) && main_app.respond_to?(method)
        main_app.send(method, *args)
      else
        super
      end
    end
    
    def survey_form_url step
      case step
      when 'step_2', 'step_3'
        :wizard
      else
        @survey
      end
    end
    
    def survey_form_method step, mode
      case step
      when 'step_2', 'step_3'
        :put
      when 'step_1'
        if mode.include? 'Edit'
          :patch
        else
          :post
        end
      else
        :patch
      end
    end
    
    def survey_excluded_steps_render step
      array = []
      case step
      when 'step_1'
        array << 'step_2'
        array << 'step_3'
      when 'step_2'
        array << 'step_3'
      end
      array
    end
  end
end
