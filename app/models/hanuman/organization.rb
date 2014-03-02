module Hanuman
  class Organization < ActiveRecord::Base
    has_many :organizations
  end
end
