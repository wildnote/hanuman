$ ->
  # instantiate cloudinary file upload (direct upload)
  if $.fn.cloudinary_fileupload != undefined
    $('input.cloudinary-fileupload[type=file]').cloudinary_fileupload()

  # ***** PHOTOS *****
  $('.cloudinary-fileupload.survey-photo-upload').bind 'cloudinarydone', (e, data) ->
    console.log data
    # need to wrap this .append in a div class=photo-preview-container
    $('.photo-preview').append $.cloudinary.image(data.result.public_id,
      format: data.result.format
      version: data.result.version
      crop: 'fill'
      width: 350)
    # need to add textarea for caption for each photo, attach photo identifier to text area so we can come back and rename apprpriately

    # loop through the hidden fields, match the photo and description textarea with the hidden input and name text area apprpriately

    # rename the hidden fields as they have

  $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadfail', (e, data) ->
    # append error message
    console.log data
    console.log "fileuploadfail"

  $('.cloudinary-fileupload.survey-photo-upload').bind 'fileuploadprogress', (e, data) ->
    # implement progress indicator
    console.log data
    console.log "fileuploadprogress"
    $('.photo-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')

  # ***** VIDEOS *****
  $('.cloudinary-fileupload.survey-video-upload').bind 'cloudinarydone', (e, data) ->
    console.log data
    # need to wrap this .append in a div class=photo-preview-container
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
    console.log data
    console.log "fileuploadfail"

  $('.cloudinary-fileupload.survey-video-upload').bind 'fileuploadprogress', (e, data) ->
    # implement progress indicator
    console.log data
    console.log "fileuploadprogress"
    $('.video-progress-bar').css('width', Math.round((data.loaded * 100.0) / data.total) + '%')
