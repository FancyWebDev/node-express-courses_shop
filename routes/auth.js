const {Router} = require('express')
const User = require('../models/user')
const keys = require('../keys')
const registrationEmail = require('../emails/registration')
const resetPassword = require('../emails/reset-pass')
const {signupValidators, loginValidators, resetValidators} = require('../utils/validators')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const {validationResult} = require('express-validator/check')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')

const router = Router()
const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SEND_GRID_API_KEY}
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Log in',
    isLogin: true,
    signupError: req.flash('signupError'),
    loginError: req.flash('loginError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
})

router.get('/reset', (req, res) => {
  res.render('auth/reset-pass', {
    title: 'Forgot your password?',
    resetError: req.flash('error'),
  })
})

router.get('/new-password/:token', async (req, res) => {
  const token = req.params.token
  if(!token) {
    return res.redirect('auth/login')
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: {$gt: Date.now()}
    })

    if(!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/new-password', {
        title: 'Set new password',
        userId: user._id.toString(),
        resetPassError: req.flash('resetPassError'),
        token
      })
    }
  } catch(e) {
    console.log(e)
  }
})

router.post('/login', loginValidators, async (req, res) => {
  try {
    const {email} = req.body
    const user = await User.findOne({ email })
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      req.flash('loginError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#login')
    }

    req.session.user = user     
    req.session.isAuthenticated = true
    req.session.save((err) => {
      if(err) throw err
      res.redirect('/')
    })
  } catch(e) {
    console.log(e)
  }
})

router.post('/signup', signupValidators, async (req, res) => {
  try {
    const { email, password, name, confirmPass } = req.body
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      req.flash('signupError', errors.array()[0].msg)
      return res.redirect('/auth/login#signup')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email, name, password: hashPassword, cart: {items: []}
    })

    await user.save()
    res.redirect('/auth/login#login')
    await transporter.sendMail(registrationEmail(email))
  } catch(e) {
    console.log(e)
  }
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if(err) {
        req.flash('error', 'Something went wrong, please try again later')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      const user = await User.findOne({email: req.body.email})

      if(user) {
        user.resetToken = token
        // expires in 1 hour
        user.resetTokenExp = Date.now() + 3600 * 1000
        await user.save()
        await transporter.sendMail(resetPassword(user.email, token))
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'There is no such email')
        res.redirect('/auth/reset')
      }
    })
  } catch(e) {
    console.log(e)
  }
})

router.post('/new-password', resetValidators, async (req, res) => {
  try {
    const { userId, token, password } = req.body
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExp: {$gt: Date.now()}
    })
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      req.flash('resetPassError', errors.array()[0].msg)
      return res.status(422).redirect(`/auth/new-password/${token}`)
    }

    if(!user) {
      res.redirect('/auth/login')
    } else {
      user.password = await bcrypt.hash(password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined

      await user.save()
      res.redirect('/auth/login')
    }
  } catch(e) {
    console.log(e)
  }
})

module.exports = router