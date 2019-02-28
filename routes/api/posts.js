const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Carregando models
const Post = require('../../models/post');
const Profle = require('../../models/profile');

// Carregando input validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find({})
    .sort({ date: -1 })
    .then(posts => {
      if (posts.length <= 0) {
        res.status(404).json({ nopostfound: 'Nenhum post encontrado !' });
      }

      res.json(posts);
    })
    .catch(() =>
      res.status(404).json({ nopostfound: 'Nenhum post encontrado !' })
    );
});

// @route   GET api/posts/:id
// @desc    Get posts by ID
// @access  Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        res
          .status(404)
          .json({ nopostfound: 'Nenhum post encontrado para o ID informado!' });
      }

      res.json(post);
    })
    .catch(() =>
      res
        .status(404)
        .json({ nopostfound: 'Nenhum post encontrado para o ID informado!' })
    );
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { text, name, avatar } = req.body;
    const newPost = new Post({
      // text: req.body.text,
      // name: req.body.name,
      // avatar: req.body.avatar,
      // user: req.user.id
      text,
      name,
      avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route   DELETE api/posts/:id
// @desc    Delete posts
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profle.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Checa se o post é do usuário corrente
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ noauthorized: 'Usuário não autorizado!' });
          }

          // Delete
          Post.remove().then(() => res.json({ success: true }));
        })
        .catch(() =>
          res.status(404).json({ postnotfound: 'Post não encontrado!' })
        );
    });
  }
);

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profle.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'Esse usuário já curtiu esse post!' });
          }

          // Adiciona o ID do usuário no array de likes
          post.likes.unshift({ user: req.user.id });

          // Salva o post
          post.save().then(post => res.json(post));
        })
        .catch(() =>
          res.status(404).json({ postnotfound: 'Post não encontrado!' })
        );
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.delete(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profle.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'Você ainda não curtiu esse post!' });
          }

          // Busca index para remover like
          const removeIndex = post.likes
            .map(item => item.user.id.toString())
            .indexOf(req.user.id);

          // Retira o like do array
          post.likes.splice(removeIndex, 1);

          // Salva o post
          post.save().then(post => res.json(post));
        })
        .catch(() =>
          res.status(404).json({ postnotfound: 'Post não encontrado!' })
        );
    });
  }
);

// @route   POST api/posts/comment/:id
// @desc    Comment post
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const { text, name, avatar } = req.body;
        const newComment = {
          text,
          name,
          avatar,
          user: req.user.id
        };

        // Adiciona o ID do usuário no array de comments
        post.comments.unshift(newComment);

        // Salva o post
        post.save().then(post => res.json(post));
      })
      .catch(() =>
        res.status(404).json({ postnotfound: 'Post não encontrado!' })
      );
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          // Checa se o comentário já existe
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comentário não encontrado!' });
        }

        // Busca index para remover comentário
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Retira o comentário do array
        post.comments.splice(removeIndex, 1);

        // Salva o post
        post.save().then(post => res.json(post));
      })
      .catch(() =>
        res.status(404).json({ postnotfound: 'Post não encontrado!' })
      );
  }
);

module.exports = router;
