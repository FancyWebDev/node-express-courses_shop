const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()

const mapCartItems = (cart) => {
  return cart.items.map(({ courseId, count }) => ({
    ...courseId._doc,
    count
  }))
} 

const computeTotalPrice = (courses) => {
  return courses.reduce((total, { price, count }) => {
    return total += price * count
  }, 0)
}

router.post('/add%20course%20to%20card', auth, async(req, res) => {
  const course = await Course.findById(req.body._id)
  await req.user.addToCart(course)
  res.redirect('/card')
})

router.delete('/remove/:id', auth, async(req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user.populate('cart.items.courseId').execPopulate()
  const courses = mapCartItems(user.cart) 
  const cart = {
    courses,
    totalPrice: computeTotalPrice(courses)
  }

  res.json(cart)
})

router.get('/', auth, async(req, res) => {
  const user = await req.user.populate('cart.items.courseId').execPopulate()
  const courses = mapCartItems(user.cart)

  res.render('card', {
    title: 'Card',
    isCard: true,
    courses,
    totalPrice: computeTotalPrice(courses)
  })
})

module.exports = router