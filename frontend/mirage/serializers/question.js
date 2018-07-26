import BaseSerializer from './application';
import { isPresent } from '@ember/utils';

export default BaseSerializer.extend({
  embed: true,
  include: ['answerChoices', 'rule']
});
