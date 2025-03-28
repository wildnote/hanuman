# config/initializers/00_ember_cli_patch.rb
module EmberCli
  class App
    alias_method :original_initialize, :initialize

    def initialize(name, **kwargs, &block)
      config = { name: name }.merge(kwargs)

      # Ensure path is properly set
      if config[:path]
        config[:path] = File.expand_path(config[:path])
      end

      Rails.logger.debug "Patched EmberCli::App.initialize with config: #{config.inspect}"
      original_initialize(name, **config, &block)
    end
  end

  class Configuration
    alias_method :original_app, :app

    def app(name, **options)
      # Ensure path is properly set before passing to original_app
      if options[:path]
        options[:path] = File.expand_path(options[:path])
      end
      original_app(name, **options)
    end
  end

  class PathSet
    alias_method :original_root, :root
    alias_method :original_ember, :ember

    def root
      path = app_options.fetch(:path) { default_root }
      pathname = Pathname.new(path)
      
      # Ensure we have an absolute path
      if !pathname.absolute?
        pathname = rails_root.join(path)
      end
      
      Rails.logger.debug "PathSet.root resolved to: #{pathname}"
      pathname
    end

    def ember
      @ember ||= begin
        # Try to find ember in the node_modules directory
        ember_path = root.join("node_modules", "ember-cli", "bin", "ember")
        Rails.logger.debug "Looking for ember at: #{ember_path}"
        
        if !ember_path.executable?
          fail DependencyError.new <<-MSG.strip_heredoc
            No `ember-cli` executable found for `#{app_name}`.

            Install it:

                $ cd #{root}
                $ yarn install

          MSG
        end
        
        Rails.logger.debug "Found ember at: #{ember_path}"
        ember_path
      end
    end
  end
end
