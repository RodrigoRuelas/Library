<template>
  <div class="authors-container">
    <h2>Gestión de Autores</h2>

    <!-- Formulario Crear / Editar Autor -->
    <form @submit.prevent="isEditing ? updateAuthor() : createAuthor()">
      <h3>{{ isEditing ? 'Editar Autor' : 'Nuevo Autor' }}</h3>

      <div>
        <label for="nombre">Nombre:</label>
        <input id="nombre" v-model="form.nombre" type="text" />
      </div>
      <div>
        <label for="fechaNacimiento">Fecha de nacimiento:</label>
        <input id="fechaNacimiento" v-model="form.fechaNacimiento" type="date" />
      </div>
      <div>
        <label for="biografia">Biografía:</label>
        <textarea id="biografia" v-model="form.biografia"></textarea>
      </div>

      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

      <button type="submit">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
      <button type="button" v-if="isEditing" @click="cancelEdit">Cancelar</button>
      
    </form>
    
    <router-link to="/home">
      <button>Volver al Home</button>
    </router-link>

    <hr />

    <!-- Listado de Autores -->
    <h3>Lista de autores</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Fecha de nacimiento</th>
          <th>Biografía</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="author in authors" :key="author.id">
          <td>{{ author.id }}</td>
          <td>{{ author.nombre }}</td>
          <td>{{ formatDate(author.fechaNacimiento) }}</td>
          <td>{{ author.biografia }}</td>
          <td>
            <button @click="startEdit(author)">Editar</button>
            <button @click="deleteAuthor(author.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AuthorsView",
  data() {
    return {
      authors: [],
      form: {
        nombre: '',
        fechaNacimiento: '',
        biografia: ''
      },
      isEditing: false,
      editId: null,
      errorMessage: ''
    };
  },
  created() {
    this.fetchAuthors();
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },

    formatDate(dateStr) {
      return new Date(dateStr).toISOString().split('T')[0];
    },

    async fetchAuthors() {
      try {
        const res = await axios.get('http://localhost:3000/authors', {
          headers: this.getAuthHeaders()
        });
        this.authors = res.data;
      } catch (error) {
        console.error('Error al obtener autores:', error.response?.data?.mensaje || error.message);
      }
    },

    validateForm() {
      const { nombre, fechaNacimiento, biografia } = this.form;
      if (!nombre || !fechaNacimiento || !biografia) {
        this.errorMessage = 'Todos los campos son obligatorios';
        return false;
      }
      this.errorMessage = '';
      return true;
    },

    async createAuthor() {
      if (!this.validateForm()) return;

      try {
        await axios.post('http://localhost:3000/authors', this.form, {
          headers: this.getAuthHeaders()
        });
        this.fetchAuthors();
        this.resetForm();
      } catch (error) {
        this.errorMessage = error.response?.data?.mensaje || 'Error al crear autor';
      }
    },

    startEdit(author) {
      this.isEditing = true;
      this.editId = author.id;
      this.form = {
        nombre: author.nombre,
        fechaNacimiento: this.formatDate(author.fechaNacimiento),
        biografia: author.biografia
      };
      this.errorMessage = '';
    },

    cancelEdit() {
      this.isEditing = false;
      this.editId = null;
      this.resetForm();
    },

    async updateAuthor() {
      if (!this.validateForm()) return;

      try {
        await axios.put(`http://localhost:3000/authors/${this.editId}`, this.form, {
          headers: this.getAuthHeaders()
        });
        this.fetchAuthors();
        this.cancelEdit();
      } catch (error) {
        this.errorMessage = error.response?.data?.mensaje || 'Error al actualizar autor';
      }
    },

    async deleteAuthor(id) {
      if (!confirm('¿Estás seguro de eliminar este autor?')) return;

      try {
        await axios.delete(`http://localhost:3000/authors/${id}`, {
          headers: this.getAuthHeaders()
        });
        this.fetchAuthors();
      } catch (error) {
        alert(error.response?.data?.mensaje || 'Error al eliminar autor');
      }
    },

    resetForm() {
      this.form = {
        nombre: '',
        fechaNacimiento: '',
        biografia: ''
      };
      this.errorMessage = '';
    }
  }
};
</script>

<style scoped>
.authors-container {
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


