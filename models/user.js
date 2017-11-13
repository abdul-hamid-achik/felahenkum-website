var mongoose = require('mongoose')
var Schema = mongoose.Schema

// create a schema
var userSchema = new Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    admin: Boolean,
    location: String,
    notification: Boolean,
    meta: {
        age: Number,
        website: String
    },
    created_at: Date,
    updated_at: Date
}, {collection: 'users'})

userSchema.methods.dudify = function() {
    // add some stuff to the users name
    this.name = this.name + '-dude';

    return this.name;
}

userSchema.pre('save', function(next) {
    var currentDate = new Date()
    this.updated_at = currentDate

    if (!this.created_at) {
        this.created_at = currentDate
    }

    next()
})

var User = mongoose.model('User', userSchema, 'users')

// make this available to our users in our Node applications
module.exports = User;