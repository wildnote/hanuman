
addTexareaForUpload = (file, data, idx, $previewContainer) ->

  # this code is seting the attr values for the hidden fields for the uploaded images.
  dataObj = JSON.parse(data._response.jqXHR.responseText);
  sortOrder = idx + 1
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
    fileValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+"#"+dataObj.signature
  else if file == "video"
    regex = /\[observation_videos_attributes]\[\d+]\[video]/
    nameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][description]")
    orderNameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][sort_order]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_videos_attributes]\[\d+]\[video]/, "[observation_videos_attributes][" + idx + "][video]")

  # this is simply appending the textarea and the hidden input. I am adding the hidden input right next to the img video-preview
  $previewContainer.find("."+file+"-preview").last().append "<p>"+data.result.public_id+"</p>"
  $previewContainer.find("."+file+"-preview").last().append "<textarea rows=2 cols=55 style='margin:20px 0 20px 0;' placeholder='Add "+file+" description here...' name="+nameAttr+"></textarea>"
  $previewContainer.find("."+file+"-preview").last().append "<p><input type='number' value='"+sortOrder+"' name="+orderNameAttr+"></input></p>"
  $previewContainer.find("."+file+"-preview").last().append "<p><a id="+file+" class='remove-upload' href='#'>Remove "+file+"</a></p>"
  $previewContainer.find("."+file+"-preview").last().append "<input class='"+file+"-hidden-input' value="+fileValue+" type='hidden'  name="+hiddenNameAttr+">"
  $previewContainer.find("."+file+"-preview").last().append "<br>"
  $previewContainer.find("."+file+"-preview").last().append "<hr>"



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

  photoIdx = 0
  $('.cloudinary-fileupload.survey-photo-upload').bind 'cloudinarydone', (e, data) ->
    #callback = ->
    $(e.target).siblings('.progress').find('.photo-progress-bar').removeAttr("style")
    $(e.target).siblings('.progress').addClass('hidden')
    #setTimeout callback, 1000

    $photoPreviewContainer = $(e.target).siblings('.photo-preview-container')
    $photoPreviewContainer.append "<div class='photo-preview'>" + $.cloudinary.image(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350).prop('outerHTML') + "</div>"
    addTexareaForUpload("photo", data, photoIdx, $photoPreviewContainer)

    photoIdx += 1

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

  videoIdx = 0
  $('.cloudinary-fileupload.survey-video-upload').bind 'cloudinarydone', (e, data) ->
    #callback = ->
    $(e.target).siblings('.progress').find('.video-progress-bar').removeAttr("style")
    $(e.target).siblings('.progress').addClass('hidden')
    #setTimeout callback, 1000

    $videoPreviewContainer = $(e.target).siblings('.video-preview-container')
    $videoPreviewContainer.append "<div class='video-preview'>" + $.cloudinary.video(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350) + "</div>"
    addTexareaForUpload("video", data, videoIdx, $videoPreviewContainer)
    poster = $(e.target).closest(".video-column").find('.video-preview:last').find("video").attr("poster")
    $(e.target).closest(".video-column").find('.video-preview:last').find("video").attr("poster", poster.replace(/$|.mp4|.mov/, ".jpg"))
    videoIdx += 1

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

  docIdx = 0
  $('.cloudinary-fileupload.survey-document-upload').bind 'cloudinarydone', (e, data) ->
    #callback = ->
    $(e.target).siblings('.progress').find('.document-progress-bar').removeAttr("style")
    $(e.target).siblings('.progress').addClass('hidden')
    #setTimeout callback, 1000

    publicId = data.result.public_id

    $documentPreviewContainer = $(e.target).siblings('.document-preview-container')
    $documentPreviewContainer.append "<div class='document-preview'>" + $.cloudinary.image(data.result.public_id, format: data.result.format, version: data.result.version, crop: 'fill', width: 350).prop('outerHTML') + "</div>"
    addTexareaForUpload("document", data, docIdx, $documentPreviewContainer)
    if data.result.format != "jpg" && data.result.format != "png"
      $('.document-preview img:last').attr('src', '/images/file-icon.png')
    docIdx += 1

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
  $('.delete-saved-file').on 'click', ->
    $($(@).closest('.delete-box').find(".delete-checkbox")).prop( "checked", true )
    $(@).closest('.delete-box').closest('.upload-view-mode').hide()
    console.log $($(@).closest('.delete-box').find(".delete-checkbox"))


  if $('.edit-mode-file').length > 0
    removeFileHiddenInput()
    $('input[type=submit]').on 'click',(e) ->
      # e.preventDefault()
      $('.document-upload').each (i, obj) ->
        # this loop checks for documents that are flagged for delete

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
