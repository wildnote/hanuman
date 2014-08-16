
$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "hanuman/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "hanuman"
  s.version     = Hanuman::VERSION
  s.authors     = ["Kristen Hazard", "David Simmons"]
  s.email       = "info@suntouchersoftware.com"
  s.homepage    = "https://github.com/kristenhazard/hanuman"
  s.summary     = "Hanuman. The Hindu monkey god. An open source rails clone of survey monkey."
  s.description = "Hanuman. The Hindu monkey god. An open source rails clone of survey monkey."

  s.files = Dir["{app,config,db,lib,vendor}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency 'rails', '4.1.4'
  s.add_dependency 'paper_trail', '~> 3.0.2'
  s.add_dependency 'ancestry'
  s.add_dependency 'amoeba'
  s.add_dependency 'haml-rails'
  s.add_dependency 'coffee-rails'
  s.add_dependency 'sass-rails', '4.0.3'
  s.add_dependency 'uglifier'
  s.add_dependency 'modernizr-rails'
  s.add_dependency 'jquery-rails'
  s.add_dependency 'handlebars_assets'
  s.add_dependency 'ember-rails'
  s.add_dependency 'ember-source'

  s.add_development_dependency 'pg'
end
