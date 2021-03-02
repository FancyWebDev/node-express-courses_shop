const {body} = require('express-validator/check')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

exports.signupValidators = [
  body('email').isEmail().withMessage('Enter correct email').custom(async (val) => {
    try {
      const user = await User.findOne({ email: val })

      if(user) {
        return Promise.reject('User with the same email already exists')
      }
    } catch(e) {
      console.log(e)
    }
  }).trim(),
  body('password', 'incorrect password (must be min 6, max 32 characters)')
    .isLength({min: 6, max: 32})
    .isAlphanumeric()
    .trim(),
  body('confirm_password', 'Password mismatch').custom((val, {req}) => {
    if(val !== req.body.password) {
      throw new Error('Passwords must match')
    }
    return true
  }).trim(),
  body('name', 'The name must be at least 3 characters and no more 32')
    .isLength({min: 3, max: 32})
    .trim()
]

exports.loginValidators = [
  body('email', 'Wrong email').isEmail().trim().custom(async (value) => {
    try {
      const user = await User.findOne({ email: value })

      if(!user) {
        return Promise.reject('No such user exists')
      }
    } catch(e) {
      console.log(e)
    }
  }),
  body('password', 'Wrong password (must be min 6, max 32 characters)')
    .isLength({min: 6, max: 32})
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({ email: req.body.email })
        
        if(user) {
          const isSame = await bcrypt.compare(value, user.password)

          if(!isSame) {
            return Promise.reject('Incorrect password')
          }
        }
      } catch(e) {
        console.log(e)
      }
    })
]

exports.resetValidators = [
  body('password', 'Wrong password (must be min 6, max 32 characters)')
    .isLength({min: 6, max: 32}).trim()
]

exports.courseValidators = [
  body('title', 'Wrong title (the title must be at least 3 characters and no more 120)')
    .isLength({min: 3, max: 120}).trim(),
  body('price', 'Wrong price').isNumeric().trim(),
  body('img', 'Wrong picture link').isURL().trim()
]