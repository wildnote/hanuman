$ ->
  if $.fn.cloudinary_fileupload != undefined
    $('input.cloudinary-fileupload[type=file]').cloudinary_fileupload()

  $('.cloudinary-fileupload').bind 'cloudinarydone', (e, data) ->
    $('.preview').html $.cloudinary.image(data.result.public_id,
      format: data.result.format
      version: data.result.version
      crop: 'fill'
      width: 150
      height: 100)
    $('.image_public_id').val data.result.public_id

  $('.cloudinary-fileupload').bind 'fileuploadfail', (e, data) ->
    console.log "in fail"
