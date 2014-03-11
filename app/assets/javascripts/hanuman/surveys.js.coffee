# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$ ->
  colors = ["red", "blue", "green", "yellow", "brown", "black"];
 
  $('.typeahead').typeahead({source: colors});
  
  $(".chosen-select").chosen
    no_results_text: "No results matched"
  
  $(".chosen-multiselect").chosen
    allow_single_deselect: true
    no_results_text: "No results matched"