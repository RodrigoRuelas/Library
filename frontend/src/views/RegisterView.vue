<template>
  <div class="register-container">
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="Username" type="text"/>
      <input v-model="password" placeholder="Password" type="password" />
      <button type="submit">Registrar</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
    <button @click="$router.push('/login')">¿Ya tienes cuenta? Inicia sesión</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async handleRegister() {
      this.error = '';

      // Validaciones básicas
      if (!this.username || !this.password) {
        this.error = 'Todos los campos son obligatorios.';
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        const result = await response.json();

        if (!response.ok) {
          // Captura mensaje del backend como "usuario ya existe"
          this.error = result.message || 'Error al registrar.';
        } else {
          this.$router.push('/login');
        }
      } catch (err) {
        this.error = 'Error en la conexión al servidor.';
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 5rem auto;
  padding: 2rem 2.5rem;
  background-color: #f9fafb;
  box-shadow: 0 0 14px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

form > div {
  margin-bottom: 1.4rem;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #34495e;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #dcdfe3;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background-color: #fff;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #3498db;
  outline: none;
}

button {
  width: 100%;
  background-color: #3498db;
  color: white;
  padding: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

button:hover {
  background-color: #2c80b4;
}

.error-message,
.success-message {
  text-align: center;
  margin-top: 1rem;
  font-weight: 600;
}

.error-message {
  color: #e74c3c;
}

.success-message {
  color: #27ae60;
}
</style>


