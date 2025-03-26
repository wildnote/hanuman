# config/initializers/00_ember_cli_patch.rb
module EmberCli
  class App
    alias_method :original_initialize, :initialize

    def initialize(*args, **kwargs, &block)
      config = if args.first.is_a?(Symbol)
        { name: args.first }.merge(kwargs)
      elsif args.first.is_a?(Hash)
        args.first.merge(kwargs)
      else
        kwargs
      end

      # Ensure path is properly set
      if config[:path]
        config[:path] = File.expand_path(config[:path])
      end

      Rails.logger.debug "Patched EmberCli::App.initialize with config: #{config.inspect}"
      original_initialize(config, &block)
    end
  end

  class Configuration
    alias_method :original_app, :app

    def app(name, options = {})
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
      
      # Handle the case where path is a hash literal
      if pathname.to_s.include?('{:name=>:frontend}')
        pathname = Pathname.new(File.expand_path('../../frontend', __dir__))
      elsif !pathname.absolute?
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
        
        # If not found, try to find it in the global node_modules
        if !ember_path.executable?
          global_ember_path = Pathname.new(`npm root -g`).join("ember-cli", "bin", "ember")
          Rails.logger.debug "Looking for global ember at: #{global_ember_path}"
          
          if global_ember_path.executable?
            ember_path = global_ember_path
          else
            fail DependencyError.new <<-MSG.strip_heredoc
              No `ember-cli` executable found for `#{app_name}`.

              Install it:

                  $ cd #{root}
                  $ #{package_manager} install

            MSG
          end
        end
        
        Rails.logger.debug "Found ember at: #{ember_path}"
        ember_path
      end
    end
  end
end
