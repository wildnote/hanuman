import $ from 'jquery';

if (!window.jacobs) {
  window.jacobs = false;
}

$('.hide_announcement').click(function() {
  $('announce')
    .first()
    .slideUp();

  $.ajax({
    url: '/users/read_latest_terms/',
    type: 'GET',
    error: function(_error) {
      // console.log(error);
    }
  });
});

export function initialize(application) {
  application.register('global:jacobs', window.jacobs, { instantiate: false });
  application.inject('route', 'isJacobs', 'global:jacobs');
  application.inject('controller', 'isJacobs', 'global:jacobs');
  application.inject('component', 'isJacobs', 'global:jacobs');
}

export default {
  name: 'jacobs',
  initialize() {
    const _aid = $('.announcement-wrapper').attr('data-announcementid'); // Added underscore to mark as unused

    $('.announcement-wrapper')
      .first()
      .fadeOut();

    $.ajax({
      url: '/users/read_latest_terms/',
      type: 'GET',
      success() {
        // eslint-disable-next-line no-console
        // console.log('success');
      }
    });
  }
};
