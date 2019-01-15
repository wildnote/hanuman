class SetMediaAccessModeWorker
  include Sidekiq::Worker

  def perform(media_id, media_type)
    case media_id
    when "photo"
      media = Hanuman::ObservationPhoto.find media_id
      data = media.try(:photo)
    when "video"
      media = Hanuman::ObservationVideo.find media_id
      data = media.try(:video)
    when "document"
      media = Hanuman::ObservationDocument.find media_id
      data = media.try(:document)
    when "signature"
      media = Hanuman::ObservationSignature.find media_id
      data = media.try(:signature)
    when "project_document"
      media = ProjectDocument.find media_id
      data = media.try(:document)
    else
      media = nil
    end
    unless media.blank?
      Cloudinary::Api.update_resources_access_mode_by_ids('authenticated', data.my_public_id)
    end
  end
end
