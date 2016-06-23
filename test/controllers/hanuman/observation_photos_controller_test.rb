require 'test_helper'

module Hanuman
  class ObservationPhotosControllerTest < ActionController::TestCase
    setup do
      @observation_photo = observation_photos(:one)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:observation_photos)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create observation_photo" do
      assert_difference('ObservationPhoto.count') do
        post :create, observation_photo: { description: @observation_photo.description, latitude: @observation_photo.latitude, longitude: @observation_photo.longitude, photo: @observation_photo.photo, references: @observation_photo.references }
      end

      assert_redirected_to observation_photo_path(assigns(:observation_photo))
    end

    test "should show observation_photo" do
      get :show, id: @observation_photo
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @observation_photo
      assert_response :success
    end

    test "should update observation_photo" do
      patch :update, id: @observation_photo, observation_photo: { description: @observation_photo.description, latitude: @observation_photo.latitude, longitude: @observation_photo.longitude, photo: @observation_photo.photo, references: @observation_photo.references }
      assert_redirected_to observation_photo_path(assigns(:observation_photo))
    end

    test "should destroy observation_photo" do
      assert_difference('ObservationPhoto.count', -1) do
        delete :destroy, id: @observation_photo
      end

      assert_redirected_to observation_photos_path
    end
  end
end
