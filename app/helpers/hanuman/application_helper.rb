module Hanuman
  module ApplicationHelper
    def method_missing(method, *args, &block)
      if (method.to_s.end_with?('_path') || method.to_s.end_with?('_url')) && main_app.respond_to?(method)
        main_app.send(method, *args)
      else
        super
      end
    end
    
    def build_eval_steps_array step
      array = []
      case step
      when 'step_2'
        array << 'step_1'
      when 'step_3'
        array << 'step_1'
        array << 'step 2'
      end
      array
    end
    
    def survey_form_url step
      case step
      when 'step_2', 'step_3'
        :wizard
      else
        @survey
      end
    end
    
    def survey_form_method step
      case step
      when 'step_2', 'step_3'
        :put
      when 'step_1',
        :post
      else
        :patch
      end
    end
  end
end
