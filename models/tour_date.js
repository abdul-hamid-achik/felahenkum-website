var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var tourDateSchema = new Schema({
    at: String,
    city: String,
    flyer: {
        type: Schema.Types.ObjectId,
        ref: 'Media'
    },
    date: Date
});

// tourDateSchema.methods.dudify = function() {
//   // add some stuff to the tourDates name
//   this.name = this.name + '-dude'; 

//   return this.name;
// };

var TourDate = mongoose.model('tourDate', tourDateSchema);

// make this available to our tourDates in our Node applications
module.exports = TourDate;