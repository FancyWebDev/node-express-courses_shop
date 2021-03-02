const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const expressHandlebars = require('express-handlebars')
const homeRoute = require('./routes/home')
const cardRoute = require('./routes/card')
const addCourseRoute = require('./routes/add-course')
const coursesRoute = require('./routes/courses')
const ordersRoute = require('./routes/orders')
const mongoose = require('mongoose')
const keys = require('./keys')
const authRoute = require('./routes/auth')
const session = require('express-session')
const varMiddleware = require('./middleware/vars')
const MongoStore = require('connect-mongodb-session')(session)
const userMiddleware = require('./middleware/user')
const errorHendler = require('./middleware/404')
const hbsHelpers = require('./utils/hbs-helpers')

const app = express()
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGO_DB_URI
})

const handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: hbsHelpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  }
})

app.engine('hbs', handlebars.engine)

app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: 'some secret value',
  resave: false,
  saveUninitialized: false,
  store
}))
app.use(csrf())
app.use(flash())
app.use(varMiddleware)
app.use(userMiddleware)
app.use('/', homeRoute)
app.use('/courses', coursesRoute)
app.use('/add%20course', addCourseRoute)
app.use('/card', cardRoute)
app.use('/orders', ordersRoute)
app.use('/auth', authRoute)

app.use(errorHendler)

const start = async () => {
  try{
    await mongoose.connect(keys.MONGO_DB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      useFindAndModify: false
    }, 
    err => {
      if(err) throw err
      console.log('mongodb connected')
    })

    app.listen(5000, () => {
      console.log(`server is running on 5000 port`)
    })
  } catch(e) {
    console.log(e)
  }
}

start()