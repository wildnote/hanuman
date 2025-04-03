require_dependency "hanuman/application_controller"
require 'ember_cli/helpers'

module Hanuman
  class AdminController < ApplicationController
    include EmberCli::Helpers
    layout 'admin'

    def index
    end

  end
end
