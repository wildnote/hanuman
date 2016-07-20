$ ->
  # instantiate cloudinary file upload (direct upload)
  if $.fn.cloudinary_fileupload != undefined
    $('input.cloudinary-fileupload[type=file]').cloudinary_fileupload()

  # ***** PHOTOS *****
  idx = 0
  $('.cloudinary-fileupload.survey-photo-upload').bind 'cloudinarydone', (e, data) ->
    # need to wrap this .append in a div class=photo-preview-container
    $('.photo-preview').append $.cloudinary.image(data.result.public_id,
      format: data.result.format
      version: data.result.version
      crop: 'fill'
      width: 350)

    # this code is seting the value of the hidden fields for the uploaded images.
    dataObj = JSON.parse(data._response.jqXHR.responseText);
    imgValue = dataObj.resource_type+"/"+dataObj.type+"/"+"v"+dataObj.version+"/"+dataObj.public_id+"."+dataObj.format+"#"+dataObj.signature
    nameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][description]")
    hiddenNameAttr = data.cloudinaryField.replace(/\[observation_photos_attributes]\[\d+]\[photo]/, "[observation_photos_attributes][" + idx + "][photo]")

    # this is simply appending the textarea and the hidden input. I am adding the hidden input right next to the img photo-preview
    $('.photo-preview').append "<br>"
    $('.photo-preview').append "<textarea rows=2 cols=55 style='margin:20px 0 20px 0;' placeholder='Add image caption here...' name="+nameAttr+"></textarea>"
    $('.photo-preview').append "<input class='photo-hidden-input' value="+imgValue+" type='hidden'  name="+hiddenNameAttr+">"
    $('.photo-preview').append "<br>"


    #  this is finding the hidden field that was placed on the dom with mismatched name attributes and removing them because I already placed the correct hidden input next to preview
    photoHiddenFields = $('form input[type=hidden]')
    photoHiddenFields.each (i, obj) ->
      name = $(obj).attr('name')
      className = $(obj).attr('class')
      if name.match(/\[observation_photos_attributes]\[\d+]\[photo]/) != null && className !=  "photo-hidden-input"
        $(obj).remove()

    idx = idx + 1


  $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadfail', (e, data) ->
    # append error message
    $('.photo-upload-error').append "<p> Failed to upload photo, please try again</p>"
    $(".survey-photo-upload").on 'click', ->
      $('.photo-upload-error').find('p').remove()
  $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadprogress', (e, data) ->
    # implement progress indicator
    $('.photo-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')



  # ***** VIDEOS *****
  $('.cloudinary-fileupload.survey-video-upload').bind 'cloudinarydone', (e, data) ->
    $('.video-preview').append $.cloudinary.video(data.result.public_id,
      format: data.result.format
      version: data.result.version
      crop: 'fill'
      width: 350)
    # need to add textarea for caption for each photo, attach photo identifier to text area so we can come back and rename apprpriately

    # loop through the hidden fields, match the photo and description textarea with the hidden input and name text area apprpriately

    # rename the hidden fields as they have

  $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadfail', (e, data) ->
    # append error message
    $('.video-upload-error').append "<p> Failed to upload video, please try again</p>"
    $(".survey-video-upload").on 'click', ->
      $('.video-upload-error').find('p').remove()

  $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadprogress', (e, data) ->
    # implement progress indicator
    $('.video-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')



# ***** DOCUMENTS *****
$('.cloudinary-fileupload.survey-document-upload').bind 'cloudinarydone', (e, data) ->
  # need to wrap this .append in a div class=photo-preview-container
  $('.document-preview').append $.cloudinary.image(data.result.public_id,
    format: data.result.format
    version: data.result.version
    crop: 'fill'
    width: 350)
  # need to add textarea for caption for each photo, attach photo identifier to text area so we can come back and rename apprpriately

  # loop through the hidden fields, match the photo and description textarea with the hidden input and name text area apprpriately

  # rename the hidden fields as they have

$('.cloudinary-fileupload.survey-document-upload').bind 'fileuploadfail', (e, data) ->
  # append error message
  $('.document-upload-error').append "<p> Failed to upload document, please try again</p>"

  $(".survey-document-upload").on 'click', ->
    $('.document-upload-error').find('p').remove()

$('.cloudinary-fileupload.survey-document-upload').bind 'fileuploadprogress', (e, data) ->
  # implement progress indicator
  $('.document-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')
