module Hanuman
  class Project < ActiveRecord::Base
    belongs_to :organization
  end
end
