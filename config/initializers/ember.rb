if Rails.env.development?
EmberCli.configure do |c|
  c.app :frontend, path: File.expand_path("../../frontend", __dir__)
  end
end