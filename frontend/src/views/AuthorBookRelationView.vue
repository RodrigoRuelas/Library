<template>
  <div>
    <h2>Relaciones Autor - Libro</h2>

    <!-- Selección autor -->
    <label>Selecciona un Autor:</label>
    <select v-model.number="selectedAuthorId" @change="fetchBooksByAuthor">
      <option disabled value="">-- Selecciona un autor --</option>
      <option v-for="author in authors" :key="author.id" :value="author.id">{{ author.nombre }}</option>
    </select>

    <!-- Tabla libros del autor -->
    <table v-if="authorBooks.length > 0" border="1" style="margin-top: 10px;">
      <thead>
        <tr><th>ID Libro</th><th>Título</th></tr>
      </thead>
      <tbody>
        <tr v-for="libro in authorBooks" :key="libro.id">
          <td>{{ libro.id }}</td>
          <td>{{ libro.titulo }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="selectedAuthorId">No se encontraron libros para este autor.</p>

    <hr/>

    <!-- Selección libro -->
    <label>Selecciona un Libro:</label>
    <select v-model.number="selectedBookId" @change="fetchAuthorsByBook">
      <option disabled value="">-- Selecciona un libro --</option>
      <option v-for="book in books" :key="book.id" :value="book.id">{{ book.titulo }}</option>
    </select>

    <!-- Tabla autores del libro -->
    <table v-if="bookAuthors.length > 0" border="1" style="margin-top: 10px;">
      <thead>
        <tr><th>ID Autor</th><th>Nombre</th></tr>
      </thead>
      <tbody>
        <tr v-for="author in bookAuthors" :key="author.id">
          <td>{{ author.id }}</td>
          <td>{{ author.nombre }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="selectedBookId">No se encontraron autores para este libro.</p>

    <hr/>

    <!-- Crear relación -->
    <h3>Crear relación Autor - Libro</h3>
    <form @submit.prevent="crearRelacion">
      <label>Autor:</label>
      <select v-model.number="newRelation.idAuthor" required>
        <option disabled value="">-- Selecciona un autor --</option>
        <option v-for="author in authors" :key="author.id" :value="author.id">{{ author.nombre }}</option>
      </select>

      <label>Libro:</label>
      <select v-model.number="newRelation.idBook" required>
        <option disabled value="">-- Selecciona un libro --</option>
        <option v-for="book in books" :key="book.id" :value="book.id">{{ book.titulo }}</option>
      </select>

      <button type="submit">Crear Relación</button>
    </form>

    <p v-if="message" :style="{ color: messageColor }">{{ message }}</p>

    <hr/>

    <button @click="$router.push('/home')">Volver al Home</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      authors: [],
      books: [],
      selectedAuthorId: '',
      selectedBookId: '',
      authorBooks: [],
      bookAuthors: [],
      newRelation: {
        idAuthor: '',
        idBook: ''
      },
      message: '',
      messageColor: 'green'
    };
  },
  created() {
    this.fetchAuthors();
    this.fetchBooks();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },

    async fetchAuthors() {
      try {
        const res = await axios.get('http://localhost:3000/authors', { headers: this.getAuthHeaders() });
        this.authors = res.data;
      } catch (error) {
        console.error('Error cargando autores:', error);
      }
    },

    async fetchBooks() {
      try {
        const res = await axios.get('http://localhost:3000/books', { headers: this.getAuthHeaders() });
        this.books = res.data;
      } catch (error) {
        console.error('Error cargando libros:', error);
      }
    },

    async fetchBooksByAuthor() {
      if (!this.selectedAuthorId) {
        this.authorBooks = [];
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/author-books/author/${this.selectedAuthorId}`, {
          headers: this.getAuthHeaders()
        });
        this.authorBooks = res.data.libros || [];
      } catch (error) {
        console.error('Error al obtener libros de autor:', error);
        this.authorBooks = [];
      }
    },

    async fetchAuthorsByBook() {
      if (!this.selectedBookId) {
        this.bookAuthors = [];
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/author-books/book/${this.selectedBookId}`, {
          headers: this.getAuthHeaders()
        });
        this.bookAuthors = res.data.autores || [];
      } catch (error) {
        console.error('Error al obtener autores del libro:', error);
        this.bookAuthors = [];
      }
    },

    async crearRelacion() {
      this.message = '';
      if (!this.newRelation.idAuthor || !this.newRelation.idBook) {
        this.message = 'Selecciona autor y libro para crear la relación.';
        this.messageColor = 'red';
        return;
      }

      // Validar que no exista la relación repetida
      try {
        const res = await axios.get(`http://localhost:3000/author-books/author/${this.newRelation.idAuthor}`, {
          headers: this.getAuthHeaders()
        });

        const librosRelacionados = res.data.libros || [];
        const existeRelacion = librosRelacionados.some(libro => libro.id === this.newRelation.idBook);

        if (existeRelacion) {
          this.message = 'La relación autor-libro ya existe.';
          this.messageColor = 'red';
          return;
        }
      } catch (error) {
        console.error('Error validando relación existente:', error);
      }

      // Crear relación
      try {
        await axios.post('http://localhost:3000/author-books', this.newRelation, {
          headers: this.getAuthHeaders()
        });
        this.message = 'Relación creada correctamente.';
        this.messageColor = 'green';

        // Limpiar selección
        this.newRelation.idAuthor = '';
        this.newRelation.idBook = '';

        // Refrescar tablas
        if(this.selectedAuthorId) await this.fetchBooksByAuthor();
        if(this.selectedBookId) await this.fetchAuthorsByBook();

      } catch (error) {
        console.error('Error creando relación:', error);
        this.message = error.response?.data?.mensaje || 'Error creando la relación.';
        this.messageColor = 'red';
      }
    }
  }
};
</script>

