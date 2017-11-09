var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mediaSchema = new Schema({
  type: String,
  url: String,
  galery: Boolean,
  created_at: Date,
  updated_at: Date
});

var media = mongoose.model('media', mediaSchema);

module.exports = media;