module Hanuman
  class Setting < ActiveRecord::Base
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
