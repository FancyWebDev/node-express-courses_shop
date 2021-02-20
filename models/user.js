const {Schema, model} = require('mongoose')

const user = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [{
      count: {
        type: Number,
        required: true,
        default: 1
      },
      courseId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
      }
    }]
  }
})

user.methods.addToCart = function(course) {
  const items = [...this.cart.items]
  const index = items.findIndex(current => current.courseId.toString() === course._id.toString())

  if (index >= 0) {
    items[index].count += 1
  } else {
    items.push({
      count: 1,
      courseId: course._id
    })
  }

  this.cart = { items }
  return this.save()
}

user.methods.removeFromCart = function(id) {
  let items = [...this.cart.items]
  const index = items.findIndex(current => current.courseId.toString() === id.toString())

  if(items[index].count === 1) 
    items = items.filter(course => course.courseId.toString() !== id)
  else
    items[index].count--

  this.cart = {items}
  return this.save()
}

user.methods.clearCart = function() {
  this.cart = {items: []}
  return this.save()
}

module.exports = model('User', user)