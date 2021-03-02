const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()
const {validationResult} = require('express-validator')
const {courseValidators} = require('../utils/validators')

function parseBool(str) {
  return !(/^(false|0)$/i).test(str) && !!str;
}

function isOWner(course, req) {
  return course.userId.toString() === req.user._id.toString()
}

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().lean().populate('userId', 'email name')
    
    res.render('courses', {
      title: 'Courses',
      isCourses: true,
      userId: req.user ? req.user._id : null,
      courses
    })
  } catch(e) {
    console.log(e)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean()
    res.render('course', {
      layout: 'empty',
      title: `Course ${course.title}`,
      course
    })
  } catch(e) {
    console.log(e)
  }
})

router.get('/:id/edit', auth, async (req, res) => {
  try {
    if(parseBool(req.query.allow) === false) 
      return res.redirect('/')
  
    const course = await Course.findById(req.params.id).lean()

    if(isOWner(course, req) === false) 
      return res.redirect('/courses')

    res.render('course-edit', {
      title: `Edit course ${course.title}`,
      course,
      courseEditError: req.flash('courseEditError')
    })

  } catch(e) {
    console.log(e)
  }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
  try {
    const errors = validationResult(req)
    const { title, price, img, _id } = req.body

    if(!errors.isEmpty()) {
      req.flash('courseEditError', errors.array()[0].msg)
      return res.status(422).redirect(`/courses/${_id}/edit?allow=true`)
    }

    const course = await Course.findById(_id)

    if(isOWner(course, req) === false) 
      return res.redirect('/courses')

    await Course.findByIdAndUpdate(_id, req.body)
    res.redirect('/courses')
  } catch(e) {
    console.log(e)
  }
})

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body._id,
      userId: req.user._id
    })
    res.redirect('/courses')
  } catch(e) {
    console.log(e);
  }
})

module.exports = router