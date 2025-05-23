const mongoose = require('mongoose');

const authorBookSchema = new mongoose.Schema({
  idAuthor: {
    type: Number,
    required: true
  },
  idBook: {
    type: Number,
    required: true
  }
}, { collection: 'author_books' });

module.exports = mongoose.model('AuthorBook', authorBookSchema);

