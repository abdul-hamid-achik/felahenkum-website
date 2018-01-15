require('dotenv').config()
const express = require('express')
const moment = require('moment')
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
  admin_key: process.env.CLOUDINARY_admin_KEY, 
  admin_secret: process.env.CLOUDINARY_admin_SECRET 
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

app.get('/tourdates', (req, res) => { 
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

    res.render('tourdates.html', context)
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
app.get("/admin/tourdates", protectRoute.ensureLoggedIn(), (req, res) => {
  var template = 'admin/tourdates/main.html'
  TourDate.find({}).sort({date: -1}).populate('flyer').lean().exec((error, data) => {
    if (error) {
      throw new Error(error)
    }

    data.map(record => {
      record.flyer.file = JSON.parse(record.flyer.file)
    })
    var context = { dates: data }
    res.render(template, context)
  })
})

app.get("/admin/tourdates/new", (req, res) => {
  var template = 'admin/tourdates/new.html'
  var context = {}
  res.render(template, context)
})

app.get("/admin/tourdates/:id", protectRoute.ensureLoggedIn(), (req, res) => {
  var template = 'admin/tourdates/update.html'
  TourDate.findById(req.params.id).populate('flyer').lean().exec((error, data) => {
    if (error) {
      return res.render(template, { error: error.message })
    }
    if (data.flyer) {
      data.flyer.file = JSON.parse(data.flyer.file)
    }
    data.date = moment(data.date).format("YYYY-MM-DD")
    var context = { tourdate: data }
    res.render(template, context)
  })
})

app.put("/admin/tourdates", protectRoute.ensureLoggedIn(), (req, res) => {
  var newData = req.body

  newData.file = JSON.stringify(newData.file)

  TourDate.findByIdAndUpdate(newData._id, newData, (error, data) => {
    if (error) {
      return res.send({ error: error.message })
    }
    res.send(data)
  })
})
app.delete("/admin/tourdates/:id", protectRoute.ensureLoggedIn(), (req, res) => {
  TourDate.findByIdAndRemove(req.params.id, (error) => {
    if (error) {
      return res.send({ error: error.message })
    }

    res.send({ message: 'Eliminado exitosamente' })
  })
})

app.post("/admin/tourdates", protectRoute.ensureLoggedIn(), (req, res) => {
  var newData = req.body
  var template = 'admin/main.html'
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
      var context = null
      media.save(function (error, data) {
        if (error) {
          context = { error: error.message }
          return res.render(template, context)
        }

        var tourdate = TourDate(newData)
        tourdate.save(function(error, data) {
          if (error) {
            context = { error: error.message }
            return res.render(template, context)
          }
          
          context = { message: 'Fecha creada correctamente!'}
          return res.render(template, context)
        })
      })
    })
  })
})
app.get("/admin/blog", protectRoute.ensureLoggedIn(), (req, res) => {
  var template = 'admin/blog/main.html'
  Post.find({}).sort({created_at: -1}).lean().exec((error, data) => {
    if (error) {
      throw new Error(error)
    }

    var context = { dates: data }
    res.render(template, context)
  })
})

app.get("/admin/blog/new", (req, res) => {
  var template = 'admin/blog/new.html'
  var context = {}
  res.render(template, context)
})

app.get("/admin/blog/:id", protectRoute.ensureLoggedIn(), (req, res) => {
  TourDate.findById(req.params.id).populate('flyer').lean().exec((error, data) => {
    if (error) {
      return res.send({ error: error.message })
    }

    if (!data) {
      return res.status(404).send({ error: "Archivo no encontrado" })
    }

    res.send(data)
  })
})

app.put("/admin/blog", protectRoute.ensureLoggedIn(), (req, res) => {
  var newData = req.body

  newData.file = JSON.stringify(newData.file)

  TourDate.findByIdAndUpdate(newData._id, newData, (error, data) => {
    if (error) {
      return res.send({ error: error.message })
    }
    res.send(data)
  })
})
app.delete("/admin/blog/:id", protectRoute.ensureLoggedIn(), (req, res) => {
  TourDate.findByIdAndRemove(req.params.id, (error) => {
    if (error) {
      return res.send({ error: error.message })
    }

    res.send({ message: 'Eliminado exitosamente' })
  })
})

app.post("/admin/blog", protectRoute.ensureLoggedIn(), (req, res) => {
  var newData = req.body
  var template = 'admin/main.html'
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
      var context = null
      media.save(function (error, data) {
        if (error) {
          context = { error: error.message }
          return res.render(template, context)
        }

        var tourdate = TourDate(newData)
        tourdate.save(function(error, data) {
          if (error) {
            context = { error: error.message }
            return res.render(template, context)
          }
          
          context = { message: 'Fecha creada correctamente!'}
          return res.render(template, context)
        })
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