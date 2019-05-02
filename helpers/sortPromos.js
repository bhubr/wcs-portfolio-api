const moment = require('moment');

const keyToDate = key => {
  const month = key.substr(0, 2);
  const year = key.substr(2, 2);
  return `20${year}-${month}-01`;
}
const sortPromos = (p1, p2) => {
  const date1 = keyToDate(p1.key);
  const date2 = keyToDate(p2.key);
  if (moment(date1).isBefore(date2)) {
    return -1;
  }
  if (moment(date1).isAfter(date2)) {
    return 1;
  }
  return 0;
}

module.exports = sortPromos;