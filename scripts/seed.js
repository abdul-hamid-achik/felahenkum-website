const mongoose = require('mongoose')
var User = require('../models/user')
var Post = require('../models/post')
var password = require('password-hash-and-salt')
var data = require('../public/data.json')

mongoose.connect(process.env.DATABASE)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    // we're connected!
    console.log('Connected to database')
    User.find({}, function(error, users) {
        if (users.length == 0) {
            console.log('Adding seed user')
            password(process.env.FELAHENKUM_ADMIN_PASSWORD).hash(function(error, hash) {
                var newUser = User({
                    name: 'Abdul Hamid',
                    email: 'abdulachik@gmail.com',
                    password: hash,
                    admin: true,
                    location: 'Guadalajara, Jalisco',
                    notification: true,
                    meta: {
                        age: 24,
                        website: "abdulachik.com"
                    },
                    created_at: Date.now(),
                    updated_at: Date.now()
                })

                newUser.save()
            })
        } else {
            console.log("Seed user is already installed")
            User.findOne({
                email: 'abdulachik@gmail.com'
            }, function(error, user) {
                user.remove(function() {
                    console.log("removed seed user")
                })
            })
        }
    })

    data.posts.forEach(function (post) {

    })

})