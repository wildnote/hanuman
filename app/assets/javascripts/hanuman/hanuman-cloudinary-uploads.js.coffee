
addTexareaForUpload = (file, data, idx, $previewContainer) ->

  # this code is seting the attr values for the hidden fields for the uploaded images.
  dataObj = JSON.parse(data._response.jqXHR.responseText);
  fileValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+"."+dataObj.format+"#"+dataObj.signature
  if file == "photo"
    regex = /\[observation_photos_attributes]\[\d+]\[photo]/
    nameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][description]")
    orderNameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][sort_order]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][photo]")
  else if file == "document"
    regex = /\[observation_documents_attributes]\[\d+]\[document]/
    nameAttr = data.cloudinaryField.replace(/\[observation_documents_attributes]\[\d+]\[document]/, "[observation_documents_attributes][" + idx + "][description]")
    orderNameAttr = data.cloudinaryField.replace(/\[observation_documents_attributes]\[\d+]\[document]/, "[observation_documents_attributes][" + idx + "][sort_order]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_documents_attributes]\[\d+]\[document]/, "[observation_documents_attributes][" + idx + "][document]")
    # if document then overwrite  the filevalue
    if data.result.format == "pdf"
      fileValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+".pdf"+"#"+dataObj.signature
    else
      fileValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+"#"+dataObj.signature
  else if file == "video"
    regex = /\[observation_videos_attributes]\[\d+]\[video]/
    nameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][description]")
    orderNameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][sort_order]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][video]")

  # this is simply appending the textarea and the hidden input. I am adding the hidden input right next to the img video-preview
  if data.result.format == undefined
    file_id = data.result.public_id
  else
    file_id = data.result.public_id+"."+data.result.format

  $previewContainer.find("."+file+"-preview").last().append "<p>"+file_id+"</p>"
  $previewContainer.find("."+file+"-preview").last().append "<label>Description</label><br>"
  $previewContainer.find("."+file+"-preview").last().append "<textarea rows=2 cols=55 style='margin:0px 0 20px 0;' placeholder='Add "+file+" description here...' name="+nameAttr+"></textarea><br>"
  $previewContainer.find("."+file+"-preview").last().append "<label>Sort Order</label>"
  $previewContainer.find("."+file+"-preview").last().append "<p><input class='upload-sort-order' type='number' value='' name="+orderNameAttr+"></input></p>"
  $previewContainer.find("."+file+"-preview").last().append "<p><a id="+file+" class='remove-upload' href='#'>Remove "+file+"</a></p>"
  $previewContainer.find("."+file+"-preview").last().append "<input class='"+file+"-hidden-input' value="+fileValue+" type='hidden'  name="+hiddenNameAttr+">"
  $previewContainer.find("."+file+"-preview").last().append "<br>"
  $previewContainer.find("."+file+"-preview").last().append "<hr>"

  # this code is setting the sort_order every time we upload. It takes care of both scenearios, survey new ands survey edit
  $($previewContainer).closest('.file-upload-input-button').find("."+file+"-preview, .upload-view-mode:visible").each (idx, element) ->
    $(element).find('.upload-sort-order').val(idx+1)

  # this is finding the hidden field that was placed on the dom with mismatched name attributes and removing them because I already placed the correct hidden input next to preview
  fileHiddenFields = $('form input[type=hidden]')
  fileHiddenFields.each (i, obj) ->
    name = $(obj).attr('name')
    className = $(obj).attr('class')
    if name.match(regex) != null && className !=  file+"-hidden-input"
      $(obj).remove()

# ***** PHOTOS *****
@bindPhotoUploads = ->
  $('.survey-photo-upload').on 'click', (e, data) ->
    $(e.target).siblings('.progress').removeClass('hidden')
    # progress bar
    $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadprogress', (e, data) ->
      # implement progress indicator
      $(e.target).siblings('.progress').find(".photo-progress-bar").css('width', Math.round((data.loaded * 100.0) / data.total) + '%')

  $('.cloudinary-fileupload.survey-photo-upload').bind 'cloudinarydone', (e, data) ->
    # Im setting the upload's index based on the count of existing attachements
    imgCount = $(e.target).closest('.file-upload-input-button').find("img").length
    if imgCount == 0
      photoIdx = 1
    else
      photoIdx = imgCount + 1

    $(e.target).siblings('.progress').find('.photo-progress-bar').removeAttr("style")
    $(e.target).siblings('.progress').addClass('hidden')

    $photoPreviewContainer = $(e.target).siblings('.photo-preview-container')
    $photoPreviewContainer.append "<div class='photo-preview'>" + $.cloudinary.image(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350).prop('outerHTML') + "</div>"
    addTexareaForUpload("photo", data, photoIdx, $photoPreviewContainer)

  # handle errors
  $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadfail', (e, data) ->
    # append error message
    $(e.target).siblings('.photo-upload-error').append "<p> Failed to upload photo, please try again</p>"
    $(".survey-photo-upload").on 'click', (e, data) ->
      $(e.target).siblings('.photo-upload-error').find('p').remove()

# ***** VIDEOS *****
@bindVideoUploads = ->
  $('.survey-video-upload').on 'click', (e, data) ->
    $(e.target).siblings('.progress').removeClass('hidden')
    # progress bar
    $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadprogress', (e, data) ->
      # implement progress indicator
      $(e.target).siblings('.progress').find(".video-progress-bar").css('width', Math.round((data.loaded * 100.0) / data.total) + '%')

  $('.cloudinary-fileupload.survey-video-upload').bind 'cloudinarydone', (e, data) ->
    #  Im setting the upload's index based on the count of existing attachements
    vidCount = $(e.target).closest('.file-upload-input-button').find(".video-preview, .upload-view-mode").length
    if vidCount == 0
      videoIdx = 1
    else
      videoIdx = vidCount + 1

    $(e.target).siblings('.progress').find('.video-progress-bar').removeAttr("style")
    $(e.target).siblings('.progress').addClass('hidden')

    $videoPreviewContainer = $(e.target).siblings('.video-preview-container')
    $videoPreviewContainer.append "<div class='video-preview'>" + $.cloudinary.video(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350) + "</div>"
    addTexareaForUpload("video", data, videoIdx, $videoPreviewContainer)
    poster = $(e.target).closest(".video-column").find('.video-preview:last').find("video").attr("poster")

    if data.result.format != "mov" && data.result.format != "mp4"
      $(e.target).siblings('.video-upload-error').append "<p style='color:#d6193d;'> Only MP4 and MOV formats supported</p>"
      $(e.target).closest(".video-column").find('.video-preview').last().find('a.remove-upload').click()
      $(".survey-video-upload").on 'click', (e, data) ->
        $(e.target).siblings('.video-upload-error').find('p').remove()

  # handle errors
  $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadfail', (e, data) ->
    $(e.target).siblings('.video-upload-error').append "<p> Failed to upload video, please try again</p>"
    $(".survey-video-upload").on 'click', ->
      $(e.target).siblings('.video-upload-error').find('p').remove()

# ***** DOCUMENTS *****
@bindDocumentUploads = ->
  $('.survey-document-upload').on 'click', (e, data) ->
    $(e.target).siblings('.progress').removeClass('hidden')
     # progress bar
    $('.cloudinary-fileupload.survey-document-upload').bind 'fileuploadprogress', (e, data) ->
      # implement progress indicator
      $(e.target).siblings('.progress').find('.document-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')

  $('.cloudinary-fileupload.survey-document-upload').bind 'cloudinarydone', (e, data) ->
    # Im setting the upload's index based on the count of existing attachements
    docCount = $(e.target).closest('.file-upload-input-button').find(".document-preview, .upload-view-mode").length
    if docCount == 0
      docIdx = 1
    else
      docIdx = docCount + 1

    $(e.target).siblings('.progress').find('.document-progress-bar').removeAttr("style")
    $(e.target).siblings('.progress').addClass('hidden')

    # this if statement sets the pdf file's extension to png for a preview in upload
    # publicId = data.result.public_id
    if data.result.format == "pdf"
      file_format ="png"
    else
      file_format = data.result.format

    $documentPreviewContainer = $(e.target).siblings('.document-preview-container')
    $documentPreviewContainer.append "<div class='document-preview'>" + $.cloudinary.image(data.result.public_id, format: file_format, version: data.result.version, crop: 'fill', width: 350).prop('outerHTML') + "</div>"
    addTexareaForUpload("document", data, docIdx, $documentPreviewContainer)
    if data.result.format != "pdf" && data.result.format != "png" && data.result.format != "jpg"
      $('.document-preview img:last').attr('src', '/assets/file-icon.png')

  # validating upload format. If fomat to supported then handle error
    if data.result.format != undefined
      uploadFormat = "."+data.result.format
    else
      uploadFormat = data.result.public_id.match(/\.[0-9a-z]+$/i)[0]
    permittenFormats = [".jpg", ".png", ".gif", ".jpeg", ".xls", ".xlsx", ".pdf", ".doc", ".docx", ".txt", ".tif", ".tiff", ".zip", ".eml", ".kmz", ".ppt", ".pptx"]
    permited  = permittenFormats.find (f) ->
                 f == uploadFormat
    if permited == undefined
      $(e.target).siblings('.document-upload-error').append "<p style='color:#d6193d;'> document format NOT supported</p>"
      $(e.target).closest(".document-column").find('.document-preview').last().find('a.remove-upload').click()
      $(".survey-document-upload").on 'click', ->
        $(e.target).siblings('.document-upload-error').find('p').remove()

  # handles errors
  $('.cloudinary-fileupload.survey-document-upload').bind 'fileuploadfail', (e, data) ->
    $(e.target).siblings('.document-upload-error').append "<p> Failed to upload document, please try again</p>"
    $(".survey-document-upload").on 'click', ->
      $(e.target).siblings('.document-upload-error').find('p').remove()




#  this fuction removes unnecessary inputs type hidden placed on the dom by "=fff.cl_image_tag" and "=fff.cl_image_tag" on edit mode
removeFileHiddenInput = ->
  $(".file-upload-input-button").each (i, e) ->
    name = $(e).attr('name')
    if $(e).find("input[type='hidden']:first").length > 0
      console.log $(e).find("input[type='hidden']:first")
      $(e).find("input[type='hidden']:first").remove()

$ ->
  # when a user removes an upload in edit, we are resetting the sortorder
  $('.delete-saved-file').on 'click', ->
    $($(@).closest('.delete-box').find(".delete-checkbox")).prop( "checked", true )
    $(@).closest('.delete-box').closest('.upload-view-mode').hide()
    if $(@).closest(".file-upload-input-button").hasClass('photo-column')
      file = "photo"
    else if $(@).closest(".file-upload-input-button").hasClass('video-column')
      file = "video"
    else if $(@).closest(".file-upload-input-button").hasClass('document-column')
      file = "document"

    $(@).closest('.file-upload-input-button').find("."+file+"-preview, .upload-view-mode:visible").each (idx, element) ->
      $(element).find('.upload-sort-order').val(idx+1)

  # on click removes uploaded files on survey new.
  $('.file-upload').on 'click', '.remove-upload', ->
    file = $(@).attr('id')
    containerClass = "."+file+"-preview"
    fileToDelete = $(@).closest(".file-upload-input-button")
    $(@).closest(containerClass).remove()
    $(fileToDelete).find("."+file+"-preview, .upload-view-mode:visible").each (idx, element) ->
      $(element).find('.upload-sort-order').val(idx+1)

  if $('.edit-mode-file').length > 0
    removeFileHiddenInput()
    $('input[type=submit]').on 'click',(e) ->

      # this loop checks for documents that are flagged for delete
      $('.document-upload').each (i, obj) ->

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

      #  check for **PHOTO** empty contianer
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

  # unbind
  $.cleanData( $('input.cloudinary-fileupload[type=file]') )

  # rebind cloudinary
  if $.fn.cloudinary_fileupload != undefined
    $('input.cloudinary-fileupload[type=file]').cloudinary_fileupload()

  # rebind our custom code
  bindPhotoUploads()
  bindVideoUploads()
  bindDocumentUploads()
