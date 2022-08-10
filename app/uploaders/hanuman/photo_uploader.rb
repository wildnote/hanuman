# encoding: utf-8
module Hanuman
  class PhotoUploader < CarrierWave::Uploader::Base

    include Cloudinary::CarrierWave

    def extension_white_list
      %w(jpg png gif jpeg heic)
    end

    # overriding method so that we don't delete files on cloudinary when they are deleted on rails app
    # doing this to handle situation where the we have a duplicate survey because initial sync didn't return back to native app successful create of a survey,
    # so then the user creates another copy of the survey by syncing. the photos are shared across both surveys and we don't want to delete those photos when
    # the duplicated on is deleted.-kdh
    # adding back delete photo on cloudinary when deleted on Wildnote now that we don't see issues with photos as much. Need this to decrease our storage and our
    # data integrity after a user cancels all data should be deleted
    def delete_remote?
      false
    end

    # Choose what kind of storage to use for this uploader:
    # storage :file
    # storage :fog

    # Override the directory where uploaded files will be stored.
    # This is a sensible default for uploaders that are meant to be mounted:
    # def store_dir
    #   "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    # end

    # Provide a default URL as a default if there hasn't been a file uploaded:
    # def default_url
    #   # For Rails 3.1+ asset pipeline compatibility:
    #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
    #
    #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
    # end

    # Process files as they are uploaded:
    # process :scale => [200, 300]
    #
    # def scale(width, height)
    #   # do something
    # end

    # Create different versions of your uploaded files:
    # version :thumb do
    #   process :resize_to_fit => [50, 50]
    # end

    # Add a white list of extensions which are allowed to be uploaded.
    # For images you might use something like this:
    # def extension_white_list
    #   %w(jpg jpeg gif png)
    # end

    # Override the filename of the uploaded files:
    # Avoid using model.id or version_name here, see uploader/store.rb for details.
    # def filename
    #   "something.jpg" if original_filename
    # end

  end
end
