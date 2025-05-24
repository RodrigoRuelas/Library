<template>
  <div class="home-container">
    <h1>Bienvenido, {{ username }}</h1>

    <nav>
      <button @click="goToBooks">Gestión de Libros</button>
      <button @click="goToAuthors">Gestion de Autores</button>
      <button @click="goToRelation">Gestion de Relaciones</button>
      <button @click="logout" class="logout-button">Cerrar sesión</button>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      username: localStorage.getItem('username') || 'Invitado'
    }
  },
  methods: {
    goToBooks() {
      this.$router.push('/books')
    },
    goToAuthors() {
      this.$router.push('/authors')
    },
    goToRelation() {
      this.$router.push('/relacionar')
    },
    logout() {
      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      // Redirigir a login
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
}

button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  margin-right: 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.logout-button:hover {
  background-color: #c0392b;
}
</style>

