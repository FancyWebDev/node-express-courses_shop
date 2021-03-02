const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()
const {validationResult} = require('express-validator/check')
const {courseValidators} = require('../utils/validators')

router.get('/', auth, (req, res) => {
  res.render('add-course', {
    title: 'Add course',  
    isAddCourse: true,
  })
})

router.post('/', auth, courseValidators, async (req, res) => {
  try {
    const errors = validationResult(req)
    const { title, price, img } = req.body

    if(!errors.isEmpty()) {
      return res.status(422).render('add-course', {
        title: 'Add course',
        isAddCourse: true,
        courseError: errors.array()[0].msg,
        data: {
          title, price, img
        }
      })
    }
    
    const userId = req.user
    const course = new Course({ title, price, img, userId })

    await course.save()
    res.redirect('/courses')
  } catch(e) {
    console.log(e)
  }
})

module.exports = router