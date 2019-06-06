class SetMediaAccessModeWorker
  include Sidekiq::Worker

  def perform(media_id, media_type)
    case media_type
    when "photo"
      media = Hanuman::ObservationPhoto.find media_id
      unless media.photo.blank?
        Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.photo.my_public_id)
      end
    when "video"
      media = Hanuman::ObservationVideo.find media_id
      unless media.video.blank?
        Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.video.my_public_id, :resource_type => :video)
      end
    when "document"
      media = Hanuman::ObservationDocument.find media_id
      unless media.document.blank?
        e = Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.document.my_public_id)
        if e['failed'] != nil
          Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.document.filename.split('/')[1], :resource_type => :raw)
        end
      end
    when "signature"
      media = Hanuman::ObservationSignature.find media_id
      unless media.signature.blank?
        Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.signature.my_public_id)
      end
    when "project_document"
      media = ProjectDocument.find media_id
      unless media.document.blank?
        e = Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.document.my_public_id)
        if e['failed'] != nil
          Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', media.document.filename.split('/')[1], :resource_type => :raw)
        end
      end
    else
      media = nil
    end

  end
end
