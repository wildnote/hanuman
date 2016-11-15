export function initialize(application) {
  application.register('global:superUser', window.superUser, {instantiate: false});
  application.inject('route', 'isSuperUser', 'global:superUser');
  application.inject('controller', 'isSuperUser', 'global:superUser');
  application.inject('component', 'isSuperUser', 'global:superUser');
}

export default {
  name: 'isSuperUser',
  initialize
};
