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
const Post = require('./models/post')
const TourDate = require('./models/tour_date')
const logger = require('morgan')(process.env.MODE == "production" ? 'combined' : 'dev')
const app = express()

mongoose.set('debug', process.env.MODE == 'development', true)
mongoose.connect(process.env.DATABASE)

const db = mongoose.connection

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
})

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

app.use(logger)
app.use(require('cookie-parser')())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(require('express-session')({ secret: process.env.SECRET, resave: false, saveUninitialized: false }))

app.use(express.static('public'))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  Media.find({ carousel: true }, (error, data) => {
    if (error) {
      throw new Error(error.message)
    }

    var carousel = data

    if (data.length > 0) {
      carousel = data.map(function(media) {
        media = media.toObject()
        media.file = JSON.parse(media.file)
        return media
      })
    }

    var context = { carousel: carousel }
    res.render('index.html', context)
  })
})
app.get('/about', (req, res) => res.render('about.html'))
app.get('/discography', (req, res) => res.render('discography.html'))
app.get('/gear', (req, res) => res.render('gear.html'))

app.get('/road', (req, res) => { 
  var context = {}
  TourDate.find({}).populate('flyer').exec((err, dates) => {
    if (err) {
      throw new Error(err.message)
    }

    context.new_dates = dates.filter(date => date.date > Date.now())
    context.new_dates.sort(function (a, b) {
      var key1 = new Date(a.date)
      var key2 = new Date(b.date)
  
      if (key1 > key2) {
          return -1
      } else if (key1 == key2) {
          return 0
      } else {
          return 1
      }
    })

    context.past_dates = dates.filter(date => date.date < Date.now())
    context.past_dates.sort(function (a, b) {
      var key1 = new Date(a.date)
      var key2 = new Date(b.date)
  
      if (key1 < key2) {
          return -1
      } else if (key1 == key2) {
          return 0
      } else {
          return 1
      }
    })

    res.render('road.html', context)
  })
})
app.get('/blog', (req, res) => {
  Post.find({}, function (error, posts) {
    if (error) {
      throw new Error(error.message)
    }

    context = { posts: posts }

    res.render('blog.html', context)
  })
})

app.get('/media', (req, res) => {
  res.render('media.html')
})
app.get('/contact', (req, res) => res.render('contact.html'))

app.get('/login', (req, res) => {
  res.render('admin/login.html')
})

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

    data.map(record => {
      record.file = JSON.parse(record.file)
    })

    res.send(data)
  })
})
app.get("/api/media/:id", (req, res) => {
  Media.findById(req.params.id, (error, data) => {
    if (error) {
      return res.send({ error: error.message })
    }

    if (!data) {
      return res.status(404).send({ error: "Archivo no encontrado" })
    }

    res.send(data)
  })
})
app.put("/api/media", (req, res) => {
  var newData = req.body

  newData.file = JSON.stringify(newData.file)

  Media.findByIdAndUpdate(newData._id, newData, (error, data) => {
    if (error) {
      return res.send({ error: error.message })
    }
    res.send(data)
  })
})
app.delete("/api/media/:id", (req, res) => {
  Media.findByIdAndRemove(req.params.id, (error) => {
    if (error) {
      return res.send({ error: error.message })
    }

    res.send({ message: 'Eliminado exitosamente' })
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

    Object.keys(fields).map(function (key) {
      if (fields[key] == 'on') {
        fields[key] = true
        return
      } 
      if (fields[key] == 'off') {
        fields[key] = false
        return
      }

      fields[key] = fields[key]
    })
    
    var options = {}
    
    if (fields.type == "video") {
      options = { resource_type: "video" }
    }

    cloudinary.v2.uploader.upload(files.file[0].path, options, function (error, result) {
      fields.file = JSON.stringify(result)
      var media = new Media(fields)
      media.save(function (error, data) {
        if (error) {
          return res.send({ error: error.message })
        }

        res.send(data)
      })
    })
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