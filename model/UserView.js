const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//monggose

// Define collection and schema
let UserView = new Schema({
    UserId: {
        type: String
    },
    ViewDate: {
        type: Date
    },
    ProductId: {
        type: String
    }
}, {
    collection: 'userView'
})

module.exports = mongoose.model('UserView', UserView)