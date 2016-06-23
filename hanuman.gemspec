
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
  s.add_dependency 'ancestry'#, '2.1.0'
  s.add_dependency 'amoeba', '3.0.0'
  s.add_dependency 'haml-rails', '0.5.3'
  s.add_dependency 'coffee-rails', '4.0.1'
  s.add_dependency 'sass-rails', '4.0.3'
  s.add_dependency 'uglifier', '2.5.3'
  s.add_dependency 'modernizr-rails', '2.7.1'
  s.add_dependency 'jquery-rails', '3.1.1'
  s.add_dependency 'ember-rails', '0.15'
  s.add_dependency 'ember-source', '1.8.1'
  s.add_dependency 'ember-data-source', '1.0.0.beta.12'
  s.add_dependency 'kaminari', '0.16.1'
  s.add_dependency 'active_model_serializers', '0.8.1'
  s.add_dependency 'roo', '2.3.2'
  s.add_dependency 'carrierwave'
  s.add_dependency 'cloudinary', '1.2.0'
  s.add_dependency 'sidekiq'

  s.add_development_dependency 'pg', '0.17.1'
end
