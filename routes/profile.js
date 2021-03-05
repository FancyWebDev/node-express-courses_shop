const {Router} = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = Router()

router.get('/', auth, async (req, res) => {
  res.render('profile', {
    title: 'Profile', 
    isProfile: true,
    user: req.user.toObject()
  })
})

router.post('/', auth, async (req, res) => {
  try {
    // const {file, user: {_id}, body: {name}} = req
    const user = await User.findById(req.user._id)
    const updates = {name: req.body.name}

    if(req.file) {
      updates.avatarUrl = req.file.path
    }

    Object.assign(user, updates)
    await user.save()
    res.redirect('/profile')
  } catch(e) {
    console.log(e)
  }
})

module.exports = router