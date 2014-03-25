module Hanuman
  class Organization < ActiveRecord::Base
    has_many :projects
  end
end
