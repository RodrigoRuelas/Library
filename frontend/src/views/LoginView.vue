<template>
  <div class="login-container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <input type="text" v-model="username" placeholder="Usuario" />
      <input type="password" v-model="password" placeholder="Contraseña" />
      <button type="submit">Ingresar</button>
    </form>
    <p class="error" v-if="error">{{ error }}</p>
    <button @click="$router.push('/register')">Registrar nuevo usuario</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async login() {
      this.error = '';
      if (!this.username || !this.password) {
        this.error = 'Debe ingresar usuario y contraseña.';
        return;
      }
      if (typeof this.username !== 'string' || typeof this.password !== 'string') {
        this.error = 'Los campos deben ser texto.';
        return;
      }
      try {
        const res = await axios.post('http://localhost:3000/login', {
          username: this.username,
          password: this.password
        });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('username', this.username);
          this.$router.push('/home');
        } else {
          this.error = 'Credenciales incorrectas.';
        }
      } catch (err) {
        this.error = 'Error al intentar iniciar sesión.';
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 1em;
}
.error {
  color: red;
}
</style>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 6rem auto;
  padding: 2rem 2.5rem;
  background-color: #f5f7fa;
  box-shadow: 0 0 12px rgba(0,0,0,0.1);
  border-radius: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 1.8rem;
  color: #333;
  font-weight: 600;
}

form > div {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px 14px;
  border: 1.8px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #3a86ff;
  outline: none;
}

button {
  width: 100%;
  background-color: #3a86ff;
  color: white;
  padding: 12px 0;
  font-size: 1.1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.25s ease;
}

button:hover {
  background-color: #265dcc;
}

.error-message {
  margin-top: 1rem;
  color: #ff4d4f;
  font-weight: 600;
  text-align: center;
}
</style>


