const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : '';
  data.degree = !isEmpty(data.degree) ? data.degree : '';
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
  data.from = !isEmpty(data.from) ? data.from : '';

  if (validator.isEmpty(data.school)) {
    errors.school = 'O campo Escola é obrigatório!';
  }

  if (validator.isEmpty(data.degree)) {
    errors.degree = 'O campo Grau é obrigatório!';
  }

  if (validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = 'O campo Área de Estudo é obrigatório!';
  }

  if (validator.isEmpty(data.from)) {
    errors.from = 'O campo Data de é obrigatório!';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
