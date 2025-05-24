<template>
  <div class="books-container">
    <h2>Gestión de Libros</h2>

    <!-- Formulario Crear / Editar Libro -->
    <form @submit.prevent="isEditing ? updateBook() : createBook()">
      <h3>{{ isEditing ? 'Editar Libro' : 'Nuevo Libro' }}</h3>

      <div>
        <label for="titulo">Título:</label>
        <input id="titulo" v-model="form.titulo" type="text" />
      </div>
      <div>
        <label for="genero">Género:</label>
        <input id="genero" v-model="form.genero" type="text" />
      </div>
      <div>
        <label for="fechaPublicacion">Fecha de publicación:</label>
        <input id="fechaPublicacion" v-model="form.fechaPublicacion" type="text" />
      </div>
      <div>
        <label for="descripcion">Descripción:</label>
        <textarea id="descripcion" v-model="form.descripcion"></textarea>
      </div>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

      <button type="submit">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
      <button type="button" v-if="isEditing" @click="cancelEdit">Cancelar</button>
    </form>
    
    <router-link to="/home">
      <button>Volver al Home</button>
    </router-link>

    <hr />

    <!-- Listado de Libros -->
    <h3>Lista de libros</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Título</th>
          <th>Género</th>
          <th>Fecha Publicación</th>
          <th>Descripción</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" :key="book.id">
          <td>{{ book.id }}</td>
          <td>{{ book.titulo }}</td>
          <td>{{ book.genero }}</td>
          <td>{{ book.fechaPublicacion }}</td>
          <td>{{ book.descripcion }}</td>
          <td>
            <button @click="startEdit(book)">Editar</button>
            <button @click="deleteBook(book.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "BooksView",
  data() {
    return {
      books: [],
      form: {
        titulo: '',
        genero: '',
        fechaPublicacion: '',
        descripcion: ''
      },
      isEditing: false,
      editId: null,
      errorMessage: ''
    };
  },
  created() {
    this.fetchBooks();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },

    async fetchBooks() {
      try {
        const res = await axios.get('http://localhost:3000/books', {
          headers: this.getAuthHeaders()
        });
        this.books = res.data;
      } catch (error) {
        console.error('Error al obtener libros:', error.response?.data?.mensaje || error.message);
      }
    },

    validateForm() {
      const { titulo, genero, fechaPublicacion, descripcion } = this.form;
      if (!titulo || !genero || !fechaPublicacion || !descripcion) {
        this.errorMessage = 'Todos los campos son obligatorios';
        return false;
      }
      this.errorMessage = '';
      return true;
    },

    async createBook() {
      if (!this.validateForm()) return;

      try {
        await axios.post('http://localhost:3000/books', this.form, {
          headers: this.getAuthHeaders()
        });
        this.fetchBooks();
        this.resetForm();
      } catch (error) {
        this.errorMessage = error.response?.data?.mensaje || 'Error al crear libro';
      }
    },

    startEdit(book) {
      this.isEditing = true;
      this.editId = book.id;
      this.form = { ...book };
      this.errorMessage = '';
    },

    cancelEdit() {
      this.isEditing = false;
      this.editId = null;
      this.resetForm();
    },

    async updateBook() {
      if (!this.validateForm()) return;

      try {
        await axios.put(`http://localhost:3000/books/${this.editId}`, this.form, {
          headers: this.getAuthHeaders()
        });
        this.fetchBooks();
        this.cancelEdit();
      } catch (error) {
        this.errorMessage = error.response?.data?.mensaje || 'Error al actualizar libro';
      }
    },

    async deleteBook(id) {
      if (!confirm('¿Estás seguro de eliminar este libro?')) return;

      try {
        await axios.delete(`http://localhost:3000/books/${id}`, {
          headers: this.getAuthHeaders()
        });
        this.fetchBooks();
      } catch (error) {
        alert(error.response?.data?.mensaje || 'Error al eliminar libro');
      }
    },

    resetForm() {
      this.form = {
        titulo: '',
        genero: '',
        fechaPublicacion: '',
        descripcion: ''
      };
      this.errorMessage = '';
    }
  }
};
</script>

<style scoped>
.books-container {
  max-width: 700px;
  margin: 2rem auto;
  font-family: Arial, sans-serif;
}
form div {
  margin-bottom: 10px;
}
.error {
  color: red;
  margin-bottom: 10px;
}
button {
  margin-right: 10px;
}
table {
  width: 100%;
  margin-top: 20px;
}
</style>

button {
  margin-bottom: 15px;
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

