// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require typeahead/typeahead.bundle
//= require chosen/chosen.jquery
//= require_tree js-webshim
//= require handlebars
//= require ladda/spin
//= require ladda/ladda
//= require jquery
//= require handlebars
//= require ember
//= require ember-data
//= require_self
//= require ./hanuman_ember
//= require ./surveys
//= require ./templates/all


// Ladda
Ladda.bind('.ladda-button');

// for more details see: http://emberjs.com/guides/application/
window.Hanuman = Ember.Application.create({
  LOG_TRANSITIONS: true
})
