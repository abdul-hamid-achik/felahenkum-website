require('dotenv').config({path: __dirname + '/../.env'})
const mongoose = require('mongoose')
const cloudinary = require('cloudinary')
const User = require('../models/user')
const Post = require('../models/post')
const Media = require('../models/media')
const TourDate = require('../models/tour_date')
const password = require('password-hash-and-salt')
const data = require('./data.json')
const fs = require('fs')
const ROOT_DIR = __dirname + "/../"
const moment = require('moment')

// mongoose.set('debug', process.env.MODE == 'development', true)
console.log(process.env.DATABASE)
mongoose.connect(process.env.DATABASE)
const db = mongoose.connection

console.log(process.env.CLOUDINARY_API_KEY)
console.log(typeof process.env.CLOUDINARY_API_KEY)

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
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
        }
    })

    console.log("Creating tour dates")
    data.past_dates.forEach(record => {
        var flyer_url = ROOT_DIR + "public/img/band/flyers/" + record.flyer
        console.log("Uploading file " + flyer_url)
        cloudinary.v2.uploader.upload(flyer_url, function (error, result) {
            var media = new Media({
                flyer: true,
                carousel: false,
                band: false,
                gallery: false,
                type: "image",
                file: JSON.stringify(result)
            })
    
            media.save(document => {
                console.log("Uploaded file" + flyer_url)
                var date = new TourDate({
                    at: record.at,
                    city: record.city,
                    date: moment(record.date, "M/D/YYYY"),
                    flyer: media._id
                })

                date.save(() => {
                    console.log("Created Tour date")
                })
            })
        })
    })

    data.new_dates.forEach(record => {
        var flyer_url = ROOT_DIR + "public/img/band/flyers/" + record.flyer
        console.log("Uploading file " + flyer_url)
        cloudinary.v2.uploader.upload(flyer_url, function (error, result) {
            var media = new Media({
                flyer: true,
                carousel: false,
                band: false,
                gallery: false,
                type: "image",
                file: JSON.stringify(result)
            })
    
            media.save(document => {
                console.log("Uploaded file" + flyer_url)

                var date = new TourDate({
                    at: record.at,
                    city: record.city,
                    date: moment(record.date, "M/D/YYYY"),
                    flyer: media._id
                })
                
                date.save(() => {
                    console.log("Created Tour date")
                })
            })
        })
    })

    console.log("Creating posts")
    data.posts.forEach(post => {
        console.log(post)
        var newPost = new Post({
            description: post
        })

        newPost.save((error, data) => {
            if (error) {
                return console.log(error)
            }
            console.log("Created post: " + data)
        })
    })

    console.log("Creating carousel data")
    data.carousel.forEach(record => {
        var carousel_file_url = ROOT_DIR + "public/" + record.src
        console.log("Uploading file " + carousel_file_url)
        var options = {}
        
        if (record.type == "video") {
            options = { resource_type: "video" }
        }
        
        cloudinary.v2.uploader.upload(carousel_file_url, options, function (error, result) {
            console.log(error, result)
            var media = new Media({
                flyer: false,
                carousel: true,
                band: false,
                gallery: false,
                type: record.type,
                file: JSON.stringify(result)
            })
    
            media.save(_ => {
                console.log("Uploaded file" + carousel_file_url)
            })
        })
    })
})