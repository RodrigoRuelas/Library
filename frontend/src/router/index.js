import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/LoginView.vue'
import Register from '../views/RegisterView.vue'
import Home from '../views/HomeView.vue'
import Books from '../views/BooksView.vue'
import Authors from '../views/AuthorsView.vue'
import AuthorBookRelation from '../views/AuthorBookRelationView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/home', name: 'Home', component: Home },
  { path: '/books', name: 'Books', component: Books },
  { path: '/authors', name: 'Authors', component: Authors },
  { path: '/relacionar', name: 'AuthorBookRelation', component: AuthorBookRelation },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

