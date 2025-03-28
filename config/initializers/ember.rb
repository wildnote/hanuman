EmberCli.configure do |c|
  frontend_path = File.expand_path("../../frontend", __dir__)
  Rails.logger.debug "Setting up Ember CLI with frontend path: #{frontend_path}"
  Rails.logger.debug "Checking if ember executable exists: #{File.exist?(File.join(frontend_path, 'node_modules', 'ember-cli', 'bin', 'ember'))}"
  c.app :frontend, path: frontend_path
end
