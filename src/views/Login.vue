<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p>{{ isSignUp ? 'Create your account' : 'Sign in to your account' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            :disabled="isLoading"
            minlength="6"
          />
        </div>

        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>

      <div class="toggle-mode">
        <button @click="toggleMode" type="button" :disabled="isLoading">
          {{ isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { signIn, signUp } = useAuth()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  errorMessage.value = ''
}

const handleSubmit = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = isSignUp.value
      ? await signUp(email.value, password.value)
      : await signIn(email.value, password.value)

    if (result.error) {
      errorMessage.value = result.error.message
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    errorMessage.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  width: 100%;
  max-width: 440px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #1a202c;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.login-header p {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #2d3748;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: 1px solid #fc8181;
}

.submit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-mode {
  margin-top: 1.5rem;
  text-align: center;
}

.toggle-mode button {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.5rem;
}

.toggle-mode button:hover:not(:disabled) {
  color: #764ba2;
  text-decoration: underline;
}

.toggle-mode button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
