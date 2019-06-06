module Hanuman
  class Setting < ActiveRecord::Base
    has_paper_trail
    validates_uniqueness_of :key

    def self.sort(sort_column, sort_direction)
      order((sort_column + " " + sort_direction).gsub("asc asc", "asc").gsub("asc desc", "asc"))
    end


    def self.enable?(key)
      k = find_by_key(key)
      if k.blank?
        false
      else
        k.value == 'true' ? true : false
      end
    end

    def self.value(key)
      k = find_by_key(key)
      if k.blank?
        "Setting not found for key: '" + key + "'!"
      else
        k.value
      end
    end
  end
end
