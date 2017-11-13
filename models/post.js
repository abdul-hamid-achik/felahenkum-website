const mongoose = require('mongoose')
const slugify = require('slugify')
const Schema = mongoose.Schema

var postSchema = new Schema({
    title: String,
    slug: String,
    description: String,
    content: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_at: Date,
    updated_at: Date
})

postSchema.pre('save', function(next) {
    var currentDate = new Date()
    this.updated_at = currentDate

    if (!this.created_at) {
        this.created_at = currentDate
    }

    if (!this.slugify && this.title ) {
        this.slugify = slugify(this.title)
    }

    next()
})

var Post = mongoose.model('post', postSchema)

module.exports = Post