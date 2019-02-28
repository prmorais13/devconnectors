const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (!validator.isEmail(data.email)) {
    errors.email = 'Email inválido!';
  }

  if (validator.isEmpty(data.email)) {
    errors.email = 'O campo Email é obrigatório!';
  }

  if (validator.isEmpty(data.password)) {
    errors.password = 'O campo Senha é obrigatório!';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
