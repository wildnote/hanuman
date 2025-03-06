EmberCli.configure do |c|
  c.app :frontend, path: "../hanuman/frontend"
  puts "Node version being used by Rails: #{`node --version`}"
end
