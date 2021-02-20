const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', auth, (req, res) => {
  res.render('add-course', {
    title: 'Add course',
    isAddCourse: true
  })
})

router.post('/', auth, async (req, res) => {
  try {
    const { title, price, img } = req.body
    const userId = req.user
    const course = new Course({ title, price, img, userId })

    await course.save()
    res.redirect('/courses')
  } catch(e) {
    console.log(e)
  }
})

module.exports = router