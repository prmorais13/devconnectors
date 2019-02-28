const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load validation
const validateProfileInput = require('../../validation/profile');
const validateExpecienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Carregando Profile Model
const Profile = require('../../models/profile');

// Carregando User Model
const User = require('../../models/user');

// @route   GET api/profile/test
// @desc    Tests profile router
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Trabalhando com profile' }));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate('user', 'name avatar')
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'Não há perfil para esse usuário!';
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', 'name avatar')
    .then(profile => {
      if (!profile) {
        errors.noprofile = `Não há perfil para o usuário com ID ${
          req.params.user_id
        }!`;
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({
        profile: `Não há perfil para o usuário com ID ${req.params.user_id}!`
      })
    );
});

// @route   GET api/profile/all
// @desc    Get all profile
// @access  Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find({})
    .populate('user', 'name avatar')
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'Não há perfis de usuários!';
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: 'Não há perfis de usuários!' })
    );
});

// @route   GET api/profile/handle:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', 'name avatar')
    .then(profile => {
      if (!profile) {
        errors.noprofile = `Não há perfil para o usuário com identificador ${
          req.params.handle
        }!`;
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   POST api/profile
// @desc    Create or Edit user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check validation
    if (!isValid) {
      // Retorna todos os erros com status 400
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};

    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    // Skills - Split to array
    if (typeof req.body.skills !== undefined) {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'Esse identificador já existe!';
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => {
            res.json(profile);
          });
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExpecienceInput(req.body);

    //Check validation
    if (!isValid) {
      // Retorna todos os erros com status 400
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = ({
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body);

      // Add to exp array
      profile.experience.unshift(newExp);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    //Check validation
    if (!isValid) {
      // Retorna todos os erros com status 400
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEduc = ({
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body);

      // Add to exp array
      profile.education.unshift(newEduc);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience to profile
// @access  Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        if (removeIndex > -1) {
          // Splice out of array
          profile.experience.splice(removeIndex, 1);
          profile.save().then(profile => res.json(profile));
        } else {
          res.status(404).json({ experience: 'Não há dados para excluir!' });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile/education/:educ_id
// @desc    Delete education to profile
// @access  Private
router.delete(
  '/education/:educ_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.educ_id);

        if (removeIndex > -1) {
          // Splice out of array
          profile.education.splice(removeIndex, 1);
          profile.save().then(profile => res.json(profile));
        } else {
          res.json({ experience: 'Não há dados para excluir!' });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() => {
          res.json({ success: true });
        });
      })
      .catch(err =>
        res.status(404).json({ profile: 'Não há perfis de usuários!' })
      );
  }
);
module.exports = router;
