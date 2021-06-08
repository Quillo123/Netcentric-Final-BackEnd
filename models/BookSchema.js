const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let BookSchema = new Schema({
    title: String,
    description: String,
    year: Number,
    authors: [{ type: Schema.Types.ObjectId, ref: 'Author'}],
    hardCover: Boolean,
    price: Number
});

module.exports = mongoose.model('Book', BookSchema);