require('dotenv').config()
const express = require('express')
const nunjucks = require('nunjucks')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const LocalStrategy = require('passport-local').Strategy
const passwordHandler = require('password-hash-and-salt')
const protectRoute = require('connect-ensure-login')
const multiparty = require('multiparty')
const cloudinary = require('cloudinary')
const Media = require('./models/media')
const User = require('./models/user')
const logger = require('morgan')(process.env.MODE == "production" ? 'combined' : 'dev')
const app = express()

mongoose.connect(process.env.DATABASE)

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("Connected to mongo atlas")
})

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err) }
      if (!user) { return done(null, false) }
      passwordHandler(password).verifyAgainst(user.password, function (error, verified) {
        console.log(error, verified)
        if (error) { return done(err) }
        if (!verified) {
          done(null, false)
        } else {
          done(null, user)
        }
      })
    })
  }
))

passport.serializeUser(function(user, callback) {
  callback(null, user.id)
})

passport.deserializeUser(function(id, callback) {
  User.findById(id, function (err, user) {
    if (err) { return callback(err) }
    callback(null, user)
  })
})

app.use(logger);
app.use(require('cookie-parser')())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(require('express-session')({ secret: process.env.SECRET, resave: false, saveUninitialized: false }))

app.use(express.static('public'))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => res.render('index.html'))
app.get('/about', (req, res) => res.render('about.html'))
app.get('/discography', (req, res) => res.render('discography.html'))
app.get('/gear', (req, res) => res.render('gear.html'))
app.get('/road', (req, res) => res.render('road.html'))
app.get('/blog', (req, res) => res.render('blog.html'))
app.get('/media', (req, res) => res.render('media.html'))
app.get('/contact', (req, res) => res.render('contact.html'))
app.get('/login', (req, res) => res.render('admin/login.html'))
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => res.redirect('/admin/'))
app.get('/admin/', protectRoute.ensureLoggedIn(), (req, res) => res.render('admin/index.html', { user: req.user }))
app.get('/logout',
  (req, res) => {
    req.logout()
    res.redirect('/')
  }
)

app.get("/api/media", (req, res) => {
  Media.find({}, (error, data) => {
    if (error) {
      throw new Error(error)
    }

    res.send(data)
  })
})

app.post("/api/upload", (req, res) => {
  var form = new multiparty.Form({
    uploadDir: '/tmp'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      return res.status(400)
    }

    
    cloudinary.v2.uploader.upload(files.file[0].path, function (error, result) {
      console.log(error)
      console.log(result)
    })

    res.status(200)
    res.write('<a style="font-family: Helvetica; padding: 250px;" href="/admin/#/media">Go back</a>')
    return res.send()
  })
})

function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler (req, res, next) {
  res.status(404)
  res.render('not_found.html')
}

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

app.listen(process.env.MODE == "production" ? 80 : 8000, () => console.log('Running server'))