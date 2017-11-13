var mongoose = require('mongoose')
var Schema = mongoose.Schema

var mediaSchema = new Schema({
  type: String,
  file: String,
  gallery: { type: Boolean, default: false },
  flyer: { type: Boolean, default: false },
  carousel: { type: Boolean, default: false },
  band: { type: Boolean, default: false },
  created_at: Date,
  updated_at: Date
})

mediaSchema.pre('save', function(next) {
    var currentDate = new Date()
    this.updated_at = currentDate

    if (!this.created_at) {
        this.created_at = currentDate
    }

    next()
})

var media = mongoose.model('media', mediaSchema)

module.exports = media