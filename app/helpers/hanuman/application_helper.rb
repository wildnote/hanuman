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
      when 1
        if mode.include? 'Edit'
          :patch
        else
          :post
        end
      else
        :patch
      end
    end

    def sortable(column, title, path_call_string = nil)
      title ||= column.titleize
      css_class = column.gsub('*', '') == sort_column.gsub(' asc,', ',').gsub(' desc,', ',').gsub(' asc', '').gsub(' desc', '') ? "current #{sort_direction}" : nil
      direction = column.gsub('*', '') == sort_column.gsub(' asc,', ',').gsub(' desc,', ',').gsub(' asc', '').gsub(' desc', '') && sort_direction == 'asc' ? 'desc' : 'asc'
      if path_call_string
        link_to raw(title), eval(path_call_string+"(params.to_unsafe_h.merge(:sort => column.gsub('*,', '!').gsub(',', ' ' + direction + ',').gsub('*', ' asc').gsub('!', ' asc,'), :direction => direction, :page => nil))"), {:class => css_class}
      else
        link_to raw(title), params.permit(column, title, direction).merge(:sort => column.gsub('*,', '!').gsub(',', ' ' + direction + ',').gsub('*', ' asc').gsub('!', ' asc,'), :direction => direction, :page => nil), {:class => css_class}
      end
    end

    def project_context_engine_pagination(pagination_markup)
      unless pagination_markup.blank?
        pagination_path = pagination_markup.to_s.split("a href=\"/")[1].split("?")[0]
        pagination_markup.gsub(pagination_path, "projects/" + params[:project_id] + "/" + pagination_path).gsub("project_id=" + params[:project_id], "").gsub("&amp;&amp;", "&").html_safe
      end
    end
  end
end
