module Hanuman
  class Project < ActiveRecord::Base
    has_paper_trail
    belongs_to :organization
  end
end
