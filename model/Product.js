const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//monggose

// Define collection and schema
let Product = new Schema({
  product_name: {
    type: String
  },
}, {
  collection: 'products'
})

module.exports = mongoose.model('Product', Product)