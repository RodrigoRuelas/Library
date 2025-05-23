// models/Author.js
const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  fechaNacimiento: {
    type: String,
    required: true
  },
  biografia: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Author', AuthorSchema);

