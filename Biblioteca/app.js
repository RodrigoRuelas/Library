const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const verificarToken = require('./authMiddleware');

const User = require("./models/User");
const Book = require("./models/Book");
const Author = require('./models/Author');
const AuthorBook = require('./models/AuthorBook');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = "clave_secreta_segura";

// Conectar a MongoDB
mongoose.connect("mongodb://localhost:27017/usuarios", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Obtener siguiente ID incremental
const getNextId = async () => {
  const lastUser = await User.findOne().sort({ id: -1 });
  return lastUser ? lastUser.id + 1 : 1;
};

// Ruta: Crear usuario
app.post("/users", async (req, res) => {
  const { username, password } = req.body;

  // Validación de tipo de dato
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username y password deben ser texto." });
  }
  
  if (!username.trim() || !password.trim()) {
    return res.status(400).json({ error: "Username y password no pueden estar vacío." });
  }

  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ error: "El nombre de usuario ya existe." });
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      id: await getNextId(),
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario creado correctamente." });

  } catch (err) {
    res.status(500).json({ error: "Error al crear usuario", detalles: err.message });
  }
});

// Ruta: Mostrar usuarios
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { _id: 0, password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios", detalles: err.message });
  }
});

// Ruta: Eliminar usuario por username
app.delete("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const deleted = await User.findOneAndDelete({ id: userId });
    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado", user: deleted });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario", detalles: err.message });
  }
});

// Ruta: Login con token
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validación de tipo de dato
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Debe ingresar username y password válidos." });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Login rechazado. Usuario o contraseña incorrectos." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Login rechazado. Usuario o contraseña incorrectos." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token
    });

  } catch (err) {
    res.status(500).json({ error: "Error al procesar login", detalles: err.message });
  }
});

// ===================== CRUD LIBROS =======================

// Crear libro
app.post('/books', verificarToken, async (req, res) => {
  try {
    const { titulo, genero, fechaPublicacion, descripcion } = req.body;
    
    if (!titulo || !genero || !fechaPublicacion || !descripcion) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (![titulo, genero, fechaPublicacion, descripcion].every(val => typeof val === 'string')) {
      return res.status(400).json({ mensaje: 'Todos los campos deben ser texto' });
    }

    const cantidad = await Book.countDocuments();
    const nuevoLibro = new Book({
      id: cantidad + 1,
      titulo,
      genero,
      fechaPublicacion,
      descripcion
    });

    await nuevoLibro.save();
    res.status(201).json({ mensaje: 'Libro creado correctamente' });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Error al crear libro' });
    }
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Mostrar libros
app.get('/books', verificarToken, async (req, res) => {
  const libros = await Book.find({}, { _id: 0 });
  res.json(libros);
});

// Mostrar libro por id
app.get('/books/:id', verificarToken, async (req, res) => {
  const libro = await Book.findOne({ id: parseInt(req.params.id) });
  if (!libro) return res.status(404).json({ mensaje: 'Libro no encontrado' });
  res.json(libro);
});

// Actualizar libro
app.put('/books/:id', verificarToken, async (req, res) => {
  try {
    const { titulo, genero, fechaPublicacion, descripcion } = req.body;

    // Validación de campos
    if (!titulo || !genero || !fechaPublicacion || !descripcion) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (![titulo, genero, fechaPublicacion, descripcion].every(val => typeof val === 'string')) {
      return res.status(400).json({ mensaje: 'Todos los campos deben ser texto' });
    }

    const libroActualizado = await Book.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { titulo, genero, fechaPublicacion, descripcion },
      { new: true, runValidators: true }
    );

    if (!libroActualizado) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }

    res.json({ mensaje: 'Libro actualizado correctamente' });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Error al actualizar libro' });
    }
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Eliminar libro
app.delete('/books/:id', verificarToken, async (req, res) => {
  const eliminado = await Book.deleteOne({ id: parseInt(req.params.id) });

  if (eliminado.deletedCount === 0) {
    return res.status(404).json({ mensaje: 'Libro no encontrado' });
  }

  res.json({ mensaje: 'Libro eliminado correctamente' });
});

// ===================== CRUD AUTOR =======================

// Crear autor
app.post('/authors', verificarToken, async (req, res) => {
  try {
    const { nombre, fechaNacimiento, biografia } = req.body;

    if (!nombre || !fechaNacimiento || !biografia) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (![nombre, fechaNacimiento, biografia].every(val => typeof val === 'string')) {
      return res.status(400).json({ mensaje: 'Todos los campos deben ser texto' });
    }

    const cantidad = await Author.countDocuments();
    const nuevoAutor = new Author({
      id: cantidad + 1,
      nombre,
      fechaNacimiento,
      biografia
    });

    await nuevoAutor.save();
    res.status(201).json({ mensaje: 'Autor creado correctamente' });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Error al crear autor' });
    }
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Mostrar todos los autores
app.get('/authors', verificarToken, async (req, res) => {
  try {
    const autores = await Author.find({}, { _id: 0 });
    res.json(autores);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener autores', detalles: err.message });
  }
});

// Mostrar autor por ID
app.get('/authors/:id', verificarToken, async (req, res) => {
  try {
    const autor = await Author.findOne({ id: parseInt(req.params.id) });
    if (!autor) return res.status(404).json({ mensaje: 'Autor no encontrado' });
    res.json(autor);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al buscar autor', detalles: err.message });
  }
});

// Actualizar autor
app.put('/authors/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, fechaNacimiento, biografia } = req.body;

    // Validación de campos
    if (!nombre || !fechaNacimiento || !biografia) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (![nombre, fechaNacimiento, biografia].every(val => typeof val === 'string')) {
      return res.status(400).json({ mensaje: 'Todos los campos deben ser texto' });
    }

    const autorActualizado = await Author.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { nombre, fechaNacimiento, biografia },
      { new: true, runValidators: true }
    );

    if (!autorActualizado) {
      return res.status(404).json({ mensaje: 'Autor no encontrado' });
    }

    res.json({ mensaje: 'Autor actualizado correctamente' });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Error al actualizar autor' });
    }
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Eliminar autor
app.delete('/authors/:id', verificarToken, async (req, res) => {
  try {
    const eliminado = await Author.deleteOne({ id: parseInt(req.params.id) });

    if (eliminado.deletedCount === 0) {
      return res.status(404).json({ mensaje: 'Autor no encontrado' });
    }

    res.json({ mensaje: 'Autor eliminado correctamente' });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar autor', detalles: err.message });
  }
});

// ===================== RELACION AUTHOR-BOOK =======================

// Crear una relación Autor-Libro
app.post('/author-books', verificarToken, async (req, res) => {
  try {
    const { idAuthor, idBook } = req.body;

    if (idAuthor == null || idBook == null) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (typeof idAuthor !== 'number' || typeof idBook !== 'number') {
      return res.status(400).json({ mensaje: 'Los campos deben ser numéricos' });
    }

    const nuevaRelacion = new AuthorBook({ idAuthor, idBook });
    await nuevaRelacion.save();

    res.status(201).json({ mensaje: 'Relación autor-libro creada correctamente' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Error al crear relación autor-libro' });
    }
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Mostrar libros de un autor
app.get('/author-books/author/:idAuthor', verificarToken, async (req, res) => {
  const idAuthor = parseInt(req.params.idAuthor);

  try {
    const author = await Author.findOne({ id: idAuthor });
    if (!author) {
      return res.status(404).json({ mensaje: 'Autor no encontrado' });
    }

    const relaciones = await AuthorBook.find({ idAuthor });

    // Obtener todos los ids de libros asociados
    const idsLibros = relaciones.map(rel => rel.idBook);

    // Buscar los libros por esos ids
    const libros = await Book.find({ id: { $in: idsLibros } }, { _id: 0 });

    res.json({
      autor: {
        id: author.id,
        nombre: author.nombre
      },
      libros
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});


// Mostrar autores de un libro
app.get('/author-books/book/:idBook', verificarToken, async (req, res) => {
  const idBook = parseInt(req.params.idBook);

  try {
    const book = await Book.findOne({ id: idBook });
    if (!book) {
      return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }

    const relaciones = await AuthorBook.find({ idBook });

    // Obtener todos los ids de autores asociados
    const idsAutores = relaciones.map(rel => rel.idAuthor);

    // Buscar los autores por esos ids
    const autores = await Author.find({ id: { $in: idsAutores } }, { _id: 0 });

    res.json({
      libro: {
        id: book.id,
        titulo: book.titulo
      },
      autores
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Actualizar una relación
app.put('/author-books/:id', verificarToken, async (req, res) => {
  try {
    const { idAuthor, idBook } = req.body;

    if (idAuthor == null || idBook == null) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (typeof idAuthor !== 'number' || typeof idBook !== 'number') {
      return res.status(400).json({ mensaje: 'Los campos deben ser numéricos' });
    }

    const actualizada = await AuthorBook.findByIdAndUpdate(
      req.params.id,
      { idAuthor, idBook },
      { new: true, runValidators: true }
    );

    if (!actualizada) {
      return res.status(404).json({ mensaje: 'Relación no encontrada' });
    }

    res.json({ mensaje: 'Relación actualizada correctamente' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ mensaje: 'Error al actualizar relación' });
    }
    res.status(500).json({ mensaje: 'Error del servidor', detalles: err.message });
  }
});

// Eliminar una relación
app.delete('/author-books/:id', verificarToken, async (req, res) => {
  try {
    const eliminada = await AuthorBook.findByIdAndDelete(req.params.id);
    if (!eliminada) {
      return res.status(404).json({ mensaje: 'Relación no encontrada' });
    }
    res.json({ mensaje: 'Relación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar relación', detalles: err.message });
  }
});


// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

