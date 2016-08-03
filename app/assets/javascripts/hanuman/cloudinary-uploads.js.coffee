
addTexareaForUpload = (file, data, idx) ->

  # this code is seting the attr values for the hidden fields for the uploaded images.
  dataObj = JSON.parse(data._response.jqXHR.responseText);
  fileValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+"."+dataObj.format+"#"+dataObj.signature
  if file == "photo"
    regex = /\[observation_photos_attributes]\[\d+]\[photo]/
    nameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][description]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][photo]")
  else if file == "document"
    regex = /\[observation_documents_attributes]\[\d+]\[document]/
    nameAttr = data.cloudinaryField.replace(/\[observation_documents_attributes]\[\d+]\[document]/, "[observation_documents_attributes][" + idx + "][description]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_documents_attributes]\[\d+]\[document]/, "[observation_documents_attributes][" + idx + "][document]")
    # if document then overwrite  the filevalue
    fileValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+"#"+dataObj.signature
  else if file == "video"
    console.log data
    regex = /\[observation_videos_attributes]\[\d+]\[video]/
    nameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][description]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][video]")

  # this is simply appending the textarea and the hidden input. I am adding the hidden input right next to the img video-preview
  $("."+file+"-preview").last().append "<br>"
  $("."+file+"-preview").last().append "<textarea rows=2 cols=55 style='margin:20px 0 20px 0;' placeholder='Add "+file+" description here...' name="+nameAttr+"></textarea>"
  $("."+file+"-preview").last().append "<p>"+data.result.public_id+"</p>"
  $("."+file+"-preview").last().append "<p><a id="+file+" class='remove-upload' href='#'>Remove "+file+"</a></p>"
  $("."+file+"-preview").last().append "<input class='"+file+"-hidden-input' value="+fileValue+" type='hidden'  name="+hiddenNameAttr+">"
  $("."+file+"-preview").last().append "<br>"


  # this is finding the hidden field that was placed on the dom with mismatched name attributes and removing them because I already placed the correct hidden input next to preview
  fileHiddenFields = $('form input[type=hidden]')
  fileHiddenFields.each (i, obj) ->
    name = $(obj).attr('name')
    className = $(obj).attr('class')
    if name.match(regex) != null && className !=  file+"-hidden-input"
      $(obj).remove()




bindPhotoUploads = ->
  # ***** PHOTOS *****
  $('.survey-photo-upload').on 'click', ->
    $('.photo-column .progress').removeClass('hidden')
    # progress bar
    $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadprogress', (e, data) ->
      # implement progress indicator
      $(".photo-progress-bar").css('width', Math.round((data.loaded * 100.0) / data.total) + '%')

  photoIdx = 0
  $('.cloudinary-fileupload.survey-photo-upload').bind 'cloudinarydone', (e, data) ->
    callback = ->
      $('.photo-progress-bar').removeAttr("style")
      $('.photo-column .progress').addClass('hidden')

    setTimeout callback, 1000

    # need to wrap this .append in a div class=photo-preview-container
    $('.photo-preview-container').append "<div class='photo-preview'>" + $.cloudinary.image(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350).prop('outerHTML') + "</div>"
    addTexareaForUpload("photo", data, photoIdx)
    photoIdx += 1

  # handle errors
  $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadfail', (e, data) ->
    # append error message
    $('.photo-upload-error').append "<p> Failed to upload photo, please try again</p>"
    $(".survey-photo-upload").on 'click', ->
      $('.photo-upload-error').find('p').remove()


bindVideoUploads = ->
  $('.survey-video-upload').on 'click', ->
    $('.video-column .progress').removeClass('hidden')
    # progress bar
    $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadprogress', (e, data) ->
      # implement progress indicator
      $(".video-progress-bar").css('width', Math.round((data.loaded * 100.0) / data.total) + '%')


  # ***** VIDEOS *****
  videoIdx = 0
  $('.cloudinary-fileupload.survey-video-upload').bind 'cloudinarydone', (e, data) ->
    callback = ->
      $('.video-progress-bar').removeAttr("style")
      $('.video-column .progress').addClass('hidden')
    setTimeout callback, 1000

    $('.video-preview-container').append "<div class='video-preview'>" + $.cloudinary.video(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350) + "</div>"
    addTexareaForUpload("video", data, videoIdx)
    videoIdx += 1

  # handle errors
  $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadfail', (e, data) ->
    $('.video-upload-error').append "<p> Failed to upload video, please try again</p>"
    $(".survey-video-upload").on 'click', ->
      $('.video-upload-error').find('p').remove()


bindDocumentUploads = ->

  $('.survey-document-upload').on 'click', ->
    $('.document-column .progress').removeClass('hidden')
    # progress bar
    $('.cloudinary-fileupload.survey-document-upload').bind 'fileuploadprogress', (e, data) ->
      # implement progress indicator
      $('.document-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')


  # ***** DOCUMENTS *****
  docIdx = 0
  $('.cloudinary-fileupload.survey-document-upload').bind 'cloudinarydone', (e, data) ->
    callback = ->
      $('.document-progress-bar').removeAttr("style")
      $('.document-column .progress').addClass('hidden')
    setTimeout callback, 1000

    publicId = data.result.public_id
    # need to wrap this .append in a div class=photo-preview-container
    $('.document-preview-container').append "<div class='document-preview'>" + $.cloudinary.image(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350).prop('outerHTML') + "</div>"
    addTexareaForUpload("document", data, docIdx)
    $('.document-preview img:last').attr('src', '/images/file-icon.png')
    docIdx += 1
  # handles errors
  $('.cloudinary-fileupload.survey-document-upload').bind 'fileuploadfail', (e, data) ->
    $('.document-upload-error').append "<p> Failed to upload document, please try again</p>"
    $(".survey-document-upload").on 'click', ->
      $('.document-upload-error').find('p').remove()




#  these fuctions are remove unnecessary hidden inputs placed in the dome by "=fff.cl_image_tag" and "=fff.cl_image_tag" on edit mode
removePhotoHiddenInput = ->
  photosRegex = /survey\[observations_attributes]\[\d+]\[observation_photos_attributes]\[\d+]\[id]/
  photoInputs = $($($('.file-upload')).find('input[type=hidden]')).filter (i, o) ->
    name = $(o).attr('name')
    name.match(photosRegex) != null
  photoInputs[0].remove()

removeVideoHiddenInput = ->
  videosRegex = /survey\[observations_attributes]\[\d+]\[observation_videos_attributes]\[\d+]\[id]/
  videoInputs = $($($('.file-upload')).find('input[type=hidden]')).filter (i, o) ->
    name = $(o).attr('name')
    name.match(videosRegex) != null
  videoInputs[0].remove()

removeDocumentHiddenInput = ->
  documentsRegex = /survey\[observations_attributes]\[\d+]\[observation_documents_attributes]\[\d+]\[id]/
  documentInputs = $($($('.file-upload')).find('input[type=hidden]')).filter (i, o) ->
    name = $(o).attr('name')
    name.match(documentsRegex) != null
  documentInputs[0].remove()


$ ->
  $('.delete-saved-file').on 'click', ->
    $($(@).closest('.delete-box').find(".delete-checkbox")).prop( "checked", true )
    $(@).closest('.delete-box').closest('.upload-view-mode').hide()
    console.log $($(@).closest('.delete-box').find(".delete-checkbox"))


  if $('.edit-mode-file').length > 0
    removePhotoHiddenInput()
    removeVideoHiddenInput()
    removeDocumentHiddenInput()
    $('input[type=submit]').on 'click',(e) ->
      # e.preventDefault()
      $('.document-upload').each (i, obj) ->
        # this loop checks for documents that are flaged for delete. if it files all of them flag for delete then we validate input

        if $($('.video-upload')[i]).closest('.video-column').find('.upload-view-mode').length == 0
          emptyDocumentContainer = true
        else
          emptyDocumentContainer = true
          $($('.document-upload')[i]).closest('.document-column').find('.upload-view-mode').each (i, obj) ->
            if $(obj).is(':visible')
              emptyDocumentContainer = false

        if !emptyDocumentContainer || $($('.document-upload')[i]).closest('.document-column').find('.document-preview-container').html() != ""
          $($('.document-upload')[i]).removeAttr('data-parsley-required')

      #  check for **VIDEO** empty contianer
      $('.video-upload').each (i, obj) ->
        if $($('.video-upload')[i]).closest('.video-column').find('.upload-view-mode').length == 0
          emptyVideoContainer = true
        else
          emptyVideoContainer = true
          $($('.video-upload')[i]).closest('.video-column').find('.upload-view-mode').each (i, obj) ->
            if $(obj).is(':visible')
              emptyVideoContainer = false

        if !emptyVideoContainer || $($('.video-upload')[i]).closest('.video-column').find('.video-preview-container').html() != ""
          $($('.video-upload')[i]).removeAttr('data-parsley-required')


      $('.photo-upload').each (i, obj) ->
        if $($('.photo-upload')[i]).closest('.photo-column').find('.upload-view-mode').length == 0
          emptyPhotoContainer = true
        else
          emptyPhotoContainer = true
          $($('.video-upload')[i]).closest('.video-column').find('.upload-view-mode').each (i, obj) ->
            if $(obj).is(':visible')
              emptyPhotoContainer = false

        if !emptyPhotoContainer || $($('.photo-upload')[i]).closest('.photo-column').find('.photo-preview-container').html() != ""
          $($('.photo-upload')[i]).removeAttr('data-parsley-required')


  # removes deleted files on survey new.
  $('.file-upload').on 'click', '.remove-upload', ->
    file = $(@).attr('id')
    containerClass = "."+file+"-preview"
    $(@).closest(containerClass).remove()


  # instantiate cloudinary file upload (direct upload)
  if $.fn.cloudinary_fileupload != undefined
    $('input.cloudinary-fileupload[type=file]').cloudinary_fileupload()

  bindPhotoUploads()
  bindVideoUploads()
  bindDocumentUploads()
