const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Nome deve ter entre 2 e 30 caracteres!';
  }

  if (validator.isEmpty(data.name)) {
    errors.name = 'O campo Nome é obrigatório!';
  }

  if (!validator.isEmail(data.email)) {
    errors.email = 'Email inválido!';
  }

  if (validator.isEmpty(data.email)) {
    errors.email = 'O campo Email é obrigatório!';
  }

  if (!validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'A Senha deve ter entre 6 e 30 caracteres!';
  }

  if (validator.isEmpty(data.password)) {
    errors.password = 'O campo Senha é obrigatório!';
  }

  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = 'Senhas não conferem!';
  }

  if (validator.isEmpty(data.password2)) {
    errors.password2 = 'Confirme a senha!';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
