const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';

  if (!validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = 'O Post deve conter entre 10 e 300 caracteres!';
  }

  if (validator.isEmpty(data.text)) {
    errors.text = 'O campo Texto é obrigatório!';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
