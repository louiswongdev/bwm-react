const User = require('../models/user');
const { normalizeErrors } = require('../helpers/mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/dev');

exports.auth = (req, res) => {
  const { email, password} = req.body;

  if (!password || !email) {
    return res.status(422).send({
      errors: [{
          title: 'Data missing!',
          details: 'Please provide email and password!'
        }]
    });
  }

  User.findOne({email}, (err, user) => {
    if (err) {
      return res.status(422).send({errors: normalizeErrors(err.errors)});
    }

    if (!user) {
      return res.status(422).send({
        errors: [{
            title: 'Invalid User',
            details: 'User does not exist'
          }]
      }); 
    }

    if (user.hasSamePassword(password)) {
      const token = jwt.sign({
        userId: user.id,
        username: user.username
      }, config.SECRET, { expiresIn: '1h' });
      
      return res.json(token);
      
    } else {
      return res.status(422).send({
        errors: [{
            title: 'Wrong Data',
            details: 'Wrong email or password'
          }]
      });
    }
  })
};

exports.register = (req, res) => {
  const { username, email, password, passwordConfirmation } = req.body;

  if (!username || !email) {
    return res.status(422).send({
      errors: [{
          title: 'Data missing!',
          details: 'Please provide email and password!'
        }]
    });
  }

  if (password !== passwordConfirmation) {
    return res.status(422).send({
      errors: [{
          title: 'Invalid password!',
          details: 'Password is not the same as confirmation password'
        }]
    });
  }

  User.findOne({email}, (err, existingUser) => {
    if (err) {
      return res.status(422).send({errors: normalizeErrors(err.errors)});
    }

    if (existingUser) {
      return res.status(422).send({
        errors: [{
            title: 'Invalid email!',
            details: 'Email has already been registered'
          }]
      });
    }

    const user = new User({
      username,
      email,
      password
    });

    user.save((err) => {
      if (err) {
        return res.status(422).send({errors: normalizeErrors(err.errors)});
      }

      return res.json({'registered': true});
    });
  });
};
