const express = require('express')
const path = require('path')
const expressHandlebars = require('express-handlebars')
const homeRoute = require('./routes/home')
const cardRoute = require('./routes/card')
const addCourseRoute = require('./routes/add-course')
const coursesRoute = require('./routes/courses')
const ordersRoute = require('./routes/orders')
const mongoose = require('mongoose')
const User = require('./models/user')
const app = express()

const handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  extname: 'hbs',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
})

app.engine('hbs', handlebars.engine)

app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(async(req, res, next) => {
  try{
    const user = await User.findById('601274315e1abe22045d4705')
    req.user = user
    next()
  } catch(e) {
    console.log(e)
  }
})
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use('/', homeRoute)
app.use('/courses', coursesRoute)
app.use('/add%20course', addCourseRoute)
app.use('/card', cardRoute)
app.use('/orders', ordersRoute)

const start = async() => {
  const uri = "mongodb+srv://janbolot:m5duGAHR5LoKOTms@cluster0.7jfrq.mongodb.net/shop?retryWrites=true&w=majority"
  
  try{
    await mongoose.connect(uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useFindAndModify: false
    }, 
    err => {
      console.log('mongodb connected')
    })
    const user = await User.findOne()
    
    if(!user) {
      const user = new User({
        email: 'sj@gmail.com',
        name: 'Janbolot',
        cart: {
          items: []
        }
      })
    
      await user.save()
    }

    app.listen(5000, () => {
      console.log(`server is running on 5000 port`)
    })
  } catch(e) {
    console.log(e)
  }
}

start()