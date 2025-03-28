require_dependency "hanuman/application_controller"

module Hanuman
  class AdminController < ApplicationController
    include EmberCli::Helpers
    layout 'admin'

    def index
    end

  end
end
