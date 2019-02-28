const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Carregando input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Carregando User Model
const User = require('../../models/user');
const keys = require('../../config/keys');

// @route   GET api/users/test
// @desc    Tests users router
// @access  public
router.get('/test', (req, res) => res.json({ msg: 'Trabalhando com users' }));

// @route   GET api/users/test
// @desc    Tests users router
// @access  public
router.get('/all', (req, res) => {
  const errors = {};

  User.find({}, 'name email avatar')
    .then(users => {
      if (!users) {
        errors.nouser = 'Não há usuários cadastrados!';
        return res.status(404).json(errors);
      }
      res.json(users);
    })
    .catch(err =>
      res.status(404).json({ user: 'Não há usuários cadastrados!' })
    );
});

// @route   POST api/users/register
// @desc    Register user
// @access  public
router.post('/register', (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name, email, password } = req.body;
  User.findOne({ email }).then(user => {
    if (user) {
      errors.email = 'Email já cadastrado!';
      return res.status(400).json(errors);
    } else {
      const avatar = gravatar.url(email, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm' // Default
      });

      const newUser = new User({
        name,
        email,
        avatar,
        password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route   POST api/users/login
// @desc    Login user / Return JWT token
// @access  public
router.post('/login', (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;
  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      errors.email = 'Usuário não encontrado!';
      return res.status(404).json(errors);
    }
    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched

        // Create  JWT payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOnKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({ success: true, token: 'Bearer ' + token });
          }
        );
      } else {
        errors.password = 'Senha incorreta!';
        res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  private
router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { id, name, email } = req.user;
    res.json({ id, name, email });
  }
);

module.exports = router;
