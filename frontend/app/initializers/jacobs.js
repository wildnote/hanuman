if (!window.jacobs) {
  window.jacobs = false;
}
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
