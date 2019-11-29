const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//monggose

// Define collection and schema
let User = new Schema({
    UserName: {
        type: String
    }
}, {
    collection: 'user'
})

module.exports = mongoose.model('User', User)