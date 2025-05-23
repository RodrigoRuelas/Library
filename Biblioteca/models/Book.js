const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  titulo: {
    type: String,
    required: true
  },
  genero: {
    type: String,
    required: true
  },
  fechaPublicacion: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Book', bookSchema);
