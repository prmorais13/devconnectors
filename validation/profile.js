const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.handle = !isEmpty(data.handle) ? data.handle : '';
  data.status = !isEmpty(data.status) ? data.status : '';
  data.skills = !isEmpty(data.skills) ? data.skills : '';

  if (!validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = 'O identificador deve ter entre 2 e 40 caracteres!';
  }

  if (validator.isEmpty(data.handle)) {
    errors.handle = 'O campo Handle é obrigatório!';
  }

  if (validator.isEmpty(data.status)) {
    errors.status = 'O campo Status é obrigatório!';
  }

  if (validator.isEmpty(data.skills)) {
    errors.skills = 'O campo Skills é obrigatório!';
  }

  if (!isEmpty(data.website)) {
    if (!validator.isURL(data.website)) {
      errors.website = 'URL inválida!';
    }
  }

  if (!isEmpty(data.youtube)) {
    if (!validator.isURL(data.youtube)) {
      errors.youtube = 'URL inválida!';
    }
  }

  if (!isEmpty(data.twitter)) {
    if (!validator.isURL(data.twitter)) {
      errors.twitter = 'URL inválida!';
    }
  }

  if (!isEmpty(data.facebook)) {
    if (!validator.isURL(data.facebook)) {
      errors.facebook = 'URL inválida!';
    }
  }

  if (!isEmpty(data.linkedin)) {
    if (!validator.isURL(data.linkedin)) {
      errors.linkedin = 'URL inválida!';
    }
  }

  if (!isEmpty(data.instagram)) {
    if (!validator.isURL(data.instagram)) {
      errors.instagram = 'URL inválida!';
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
