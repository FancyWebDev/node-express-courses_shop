const {Router} = require('express')
const User = require('../models/user')
const keys = require('../keys')
const registrationEmail = require('../emails/registration')
const resetPassword = require('../emails/reset-pass')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')

const router = Router()
const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SEND_GRID_API_KEY}
}))

router.get('/login', async(req, res) => {
  res.render('auth/login', {
    title: 'Log in',
    isLogin: true,
    signupError: req.flash('signupError'),
    loginError: req.flash('loginError')
  })
})

router.get('/logout', async(req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
})

router.post('/login', async(req, res) => {
  try {
    const {email, password} = req.body
    const user = await User.findOne({ email })

    if(user) {
      const isSame = await bcrypt.compare(password, user.password)

      if(isSame) {        
        req.session.user = user     
        req.session.isAuthenticated = true
        req.session.save((err) => {
          if(err) throw err
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Wrong password')
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', 'No such user exists')
      res.redirect('/auth/login#login')
    }
  } catch(e) {
    console.log(e)
  }
})

router.post('/signup', async(req, res) => {
  try {
    const { email, password, name, confirm_password: confirmPassword } = req.body
    const user = await User.findOne({ email })
    if(user) {
      req.flash('signupError', 'User with the same email already exists')
      res.redirect('/auth/login#signup')
    } else {
      const hashPassword = await bcrypt.hash(password, 10)
      const user = new User({
        email, name, password: hashPassword, cart: {items: []}
      })

      await user.save()
      res.redirect('/auth/login#login')
      await transporter.sendMail(registrationEmail(email))
    }
  } catch(e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset-pass', {
    title: 'Forgot your password?',
    resetPassError: req.flash('error')
  })
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async(err, buffer) => {
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

module.exports = router