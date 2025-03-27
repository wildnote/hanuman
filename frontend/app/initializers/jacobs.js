if (!window.jacobs) {
  window.jacobs = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const hideAnnouncementEl = document.querySelector('.hide_announcement');
  if (hideAnnouncementEl) {
    hideAnnouncementEl.addEventListener('click', () => {
      const announcementCloseEl = document.querySelector('.hide_announcement.announcement-close');
      const announcementId = announcementCloseEl ? announcementCloseEl.getAttribute('data-announcementid') : null;
      const announceEl = document.querySelector('announce');
      if (announceEl) {
        announceEl.style.display = 'none';
      }

      fetch('/users/read_latest_terms/', {
        method: 'GET'
      }).catch(() => {
        // Handle error silently
      });
    });
  }
});

export function initialize(application) {
  application.register('global:jacobs', window.jacobs, { instantiate: false });
  application.inject('route', 'isJacobs', 'global:jacobs');
  application.inject('controller', 'isJacobs', 'global:jacobs');
  application.inject('component', 'isJacobs', 'global:jacobs');
}

export default {
  name: 'isJacobs',
  initialize
};
