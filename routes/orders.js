const {Router} = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = Router()

router.get('/', auth, async(req, res) => {
  try{
    const orders = await Order.find({'user.userId': req.user._id}).populate('user.userId', {})

    res.render('orders', {
      title: 'Orders',
      isOrders: true,
      orders: orders.map(order => {
        return {
          ...order._doc,
          price: order.courses.reduce((totalPrice, current) => {
            return totalPrice += current.count * current.course.price
          }, 0)
        }
      })
    })
  } catch(e) {
    console.log(e)
  }
})

router.post('/', auth, async(req, res) => {
  try{
    const user = await req.user.populate('cart.items.courseId').execPopulate()
    const courses = user.cart.items.map(({ count, courseId }) => ({
      course: {...courseId._doc},
      count
    }))
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses
    })

    await order.save()
    await req.user.clearCart()
    res.redirect('/orders')
  } catch(e) {
    console.log(e)
  }
})

module.exports = router