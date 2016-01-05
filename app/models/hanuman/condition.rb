module Hanuman
  class Condition < ActiveRecord::Base
    belongs_to :question

    OPERATORS = ["is equal to", "is not equal to", "is empty", "is not empty", "is greater than", "is less than", "starts with", "contains"]
  end
end
