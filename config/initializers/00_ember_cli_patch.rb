# config/initializers/00_ember_cli_patch.rb
module EmberCli
  class App
    alias_method :original_initialize, :initialize

    def initialize(*args, &block)
      config =
        case args.size
        when 0
          {}  # No arguments: default to empty hash.
        when 1
          # If one argument is passed, wrap it in a hash if it isn’t already.
          args.first.is_a?(Hash) ? args.first : { name: args.first }
        when 2
          # If two arguments are passed, assume the first is a name (or config hash)
          # and the second is additional options. If the first isn't a hash, wrap it.
          base = args.first.is_a?(Hash) ? args.first : { name: args.first }
          base.merge(args.last.is_a?(Hash) ? args.last : {})
        else
          args.first
        end

      Rails.logger.debug "Patched EmberCli::App.initialize with config: #{config.inspect}"
      original_initialize(config, &block)
    end
  end
end
