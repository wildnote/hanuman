setMapMarkers = ->
  if $(".map-container").length > 0
    project_id = $(".map-container .hidden").text()
    $.ajax
      url: "/projects/" + project_id + "/maps.json"
      success: (data) ->
        handler = Gmaps.build('Google')
        handler.buildMap {
          provider: {scrollwheel: false, zoomControl: true}
          internal: id: 'map'
        }, ->
          markers = handler.addMarkers(data)
          $(markers).each ->
            this.serviceObject.icon = 'https://s3-us-west-1.amazonaws.com/wildnote/google-maps-utility-library-v3/chart_marker_green.png'
          handler.map.centerOn markers[0]
          handler.getMap().setZoom(8)
      dataType: 'JSON'

@setupDefaultMaps = ->
  $('.latlong').each ->
    # getMapDetails then run callback function setupMap
    getMapDetails this, setupMap


getMapDetails = (latlongelement, callback) ->
  mapId = $(latlongelement).attr('id')
  infoWindow = $(latlongelement).data('infowindow')
  lat = null
  lng = null
  if $(latlongelement).data('latlong')
    latLong = $(latlongelement).data('latlong').split(",")
    lat = latLong[0]
    lng = latLong[1]
    icon = 'https://s3-us-west-1.amazonaws.com/wildnote/google-maps-utility-library-v3/chart_marker_green.png'
    setZoom = false
    $('.edit-map').text('Edit location on map')
  else
    lat = 35.2749210
    lng = -120.6560650
    icon = "/images/blank-marker.png"
    setZoom = true
  mapDetails = {
    mapId: mapId,
    infoWindow: infoWindow,
    lat: lat,
    lng: lng,
    icon: icon,
    setZoom: setZoom
  }
  callback(mapDetails)


setupMap = (mapDetails) ->
  #console.log mapDetails
  mapId = mapDetails.mapId
  infoWindow = mapDetails.infoWindow
  lat = mapDetails.lat
  lng = mapDetails.lng
  handler = Gmaps.build('Google')
  zoom = mapDetails.setZoom
  if lat == null
    handler.buildMap {
      provider: {scrollwheel: false, zoomControl: true}
      internal: id: mapId
    }
  else
    handler.buildMap {
      provider: {scrollwheel: false, zoomControl: true}
      internal: id: mapId
      }, ->
      markers = handler.addMarkers([ {
        lat: lat
        lng: lng
        infoWindow: infoWindow
      } ])
      markers[0].serviceObject.icon = mapDetails.icon
      handler.map.centerOn markers[0]
      handler.getMap().setZoom(8)
      return

$editListener = null

setupMapWithEdit = (mapDetails) ->
  #mapId, infoWindow, lat, lng
  mapId = mapDetails.mapId
  infoWindow = mapDetails.infoWindow
  lat = mapDetails.lat
  lng = mapDetails.lng
  handler = Gmaps.build('Google')
  handler.buildMap {
    provider: {scrollwheel: false, zoomControl: true}
    internal: id: mapId
    }, ->
    mapId = mapId
    markers = handler.addMarkers([ {
      lat: lat
      lng: lng
      infoWindow: infoWindow
    } ])
    markers[0].serviceObject.icon = mapDetails.icon
    handler.map.centerOn markers[0]
    # handler.bounds.extendWith markers
    # handler.fitMapToBounds()
    $editListener = google.maps.event.addListener handler.getMap(), 'click', (event) ->
      $(".edit-map").text("Edit location plot point")
      mapId = mapId
      $mapElement = $(document.getElementById(mapId))
      $latlongElement = $mapElement.parent().parent().find('.latlong-entry')
      #$newLatLng = $("#survey_observations_attributes_0_answer")
      clickLat = event.latLng.lat()
      clickLng = event.latLng.lng()
      $latlongElement.val(clickLat + ", " + clickLng) if $latlongElement.length > 0
      # storage mechanism to retrive original lat long in case of a cancel
      $newLat = document.getElementById("edit-map-lat")
      $newLng = document.getElementById("edit-map-lng")
      $newLng.innerHTML = clickLng if $newLat.length > 0
      $newLat.innerHTML = clickLat if $newLat.length > 0

      markers = handler.addMarkers([ {
        lat: clickLat
        lng: clickLng
        infowindow: infoWindow
      } ])
      markers[0].serviceObject.icon = 'https://s3-us-west-1.amazonaws.com/wildnote/google-maps-utility-library-v3/chart_marker_blue.png'
      handler.bounds.extendWith markers
      # handler.fitMapToBounds()
      $editListener.remove()
      $(".edit-map").show()
      return

@bindButtons = ->
  $(".edit-map").on "click", ->
    $(this).text("Position map then click here to plot")
    # getMapDetails then run callback function setupMapWithEdit
    $mapContainer = $(this).closest(".map-container").find(".latlong")
    $formGroup = $(this).closest('.form-group')
    $latlongElement = $formGroup.find('.latlong-entry')
    $cancelButton = $formGroup.find('.cancel-map')
    $helperText = $formGroup.find('.helper-text p')
    getMapDetails $mapContainer, setupMapWithEdit
    $(this).hide()
    $cancelButton.show()
    $helperText.text("Now click on the map to plot a location").show()
  $(".cancel-map").on "click", ->
    $(".edit-map").text("Position map then click here to plot")
    $formGroup = $(this).closest('.form-group')
    $editButton = $formGroup.find('.edit-map')
    $helperText = $formGroup.find('.helper-text p')
    $editListener.remove()
    $(this).hide()
    $editButton.show()
    $helperText.text("").hide()

setMapHeight = ->
  if $("#map").length > 0
    mapWidth = $("#map").width()
    # mapHeight = mapWidth * 0.55
    mapHeight = $(window).height() - 176
    $("#map").css "min-height", mapHeight + "px"

$(window).resize ->
  if $("#map").length > 0
    setMapHeight()
    setMapMarkers()

$ ->
  # this if statement is for big map under navbar that plots all latlong for a project
  if $("#map").length > 0
    setMapHeight()
    setMapMarkers()
  # below methods are for maps in survey edit, show and new
  # setting up each map
  setupDefaultMaps()
  # binding edit and cancel buttons in each map
  bindButtons()
