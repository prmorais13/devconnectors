const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateExperienceInput(data) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : '';
  data.company = !isEmpty(data.company) ? data.company : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if (validator.isEmpty(data.title)) {
    errors.title = 'O campo Título é obrigatório!';
  }

  if (validator.isEmpty(data.company)) {
    errors.company = 'O campo Companhia é obrigatório!';
  }

  if (validator.isEmpty(data.from)) {
    errors.from = 'O campo Data de é obrigatório!';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
