const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let AuthorSchema = new Schema({
    name: String,
    nationality: String
});

module.exports = mongoose.model('Author', AuthorSchema);