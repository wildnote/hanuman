import Application from './application';

export default Application.extend({
  coalesceFindRequests: true,

  groupRecordsForFindMany() {
    let groups = this._super(...arguments);
    let maxLength = 100;

    return groups.reduce((previousValue, currentValue) => {
      while (currentValue.length > maxLength) {
        previousValue.push(currentValue.splice(0, maxLength));
      }
      previousValue.push(currentValue);
      return previousValue;
    }, []);
  }
});
