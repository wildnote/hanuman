import BaseSerializer from './application';
export default BaseSerializer.extend({
  include: ['answerChoices','surveyStep']
});