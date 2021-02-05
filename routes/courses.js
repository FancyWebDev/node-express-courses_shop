const {Router} = require('express')
const Course = require('../models/course')

const router = Router()

router.get('/', async (req, res) => {
  try{
    const courses = await Course.find().lean().populate('userId', 'email name')
    console.log(courses)

    res.render('courses', {
      title: 'Courses',
      isCourses: true,
      courses
    })
  } catch(e) {
    console.log(e)
  }
})

router.get('/:id', async(req, res) => {
  try{
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

router.get('/:id/edit', async(req, res) => {
  try{
    if(!req.query.allow) 
    return res.redirect('/')

    const course = await Course.findById(req.params.id).lean()

    res.render('course-edit', {
      title: `Edit course ${course.title}`,
      course
    })
  } catch(e) {
    console.log(e)
  }
})

router.post('/edit', async (req, res) => {
  try{
    await Course.findByIdAndUpdate(req.body._id, req.body)
    res.redirect('/courses')
  } catch(e) {
    console.log(e)
  }
})

router.post('/remove', async(req, res) => {
  try {
    await Course.deleteOne({_id: req.body._id})
    res.redirect('/courses')
  } catch(e) {
    console.log(e);
  }
})

module.exports = router