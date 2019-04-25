const moment = require('moment');
moment.locale('fr');

const languagesMap = {
  java: 'Java',
  js: 'JavaScript',
  php: 'PHP'
};

const formatPromo = code => {
  const [monthYear, langCode] = code.split('-');
  const language = languagesMap[langCode];
  const matches = monthYear.match(/(\d{2})(\d{2})/);
  if (!matches || matches.length < 3) {
    return 'Erreur de format'
  }
  const [whole, month, year] = matches;
  const date = `20${year}-${month}-01`;

  const formatted = moment(date).format('MMMM YYYY');
  const value = formatted[0].toUpperCase() + formatted.substr(1);
  return { key: code, value };
};

module.exports = formatPromo;
