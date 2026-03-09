<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Dashboard</h1>
        <div class="user-section">
          <span class="user-email">{{ user?.email }}</span>
          <button @click="handleSignOut" class="logout-button">Sign Out</button>
        </div>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>Total Items</h3>
            <p class="stat-value">{{ dashboardItems.length }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>API Posts</h3>
            <p class="stat-value">{{ apiData.length }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✨</div>
          <div class="stat-content">
            <h3>Total Value</h3>
            <p class="stat-value">{{ totalValue }}</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <section class="dashboard-section">
          <div class="section-header">
            <h2>Your Items</h2>
            <button @click="showAddForm = !showAddForm" class="add-button">
              {{ showAddForm ? 'Cancel' : '+ Add Item' }}
            </button>
          </div>

          <div v-if="showAddForm" class="add-form">
            <input
              v-model="newItem.title"
              placeholder="Title"
              class="form-input"
            />
            <input
              v-model="newItem.description"
              placeholder="Description"
              class="form-input"
            />
            <input
              v-model.number="newItem.value"
              type="number"
              placeholder="Value"
              class="form-input"
            />
            <button @click="addDashboardItem" class="submit-form-button">
              Add Item
            </button>
          </div>

          <div v-if="loading" class="loading">Loading...</div>

          <div v-else-if="dashboardItems.length === 0" class="empty-state">
            <p>No items yet. Add your first item!</p>
          </div>

          <div v-else class="items-list">
            <div
              v-for="item in dashboardItems"
              :key="item.id"
              class="item-card"
            >
              <div class="item-header">
                <h3>{{ item.title }}</h3>
                <button @click="deleteItem(item.id)" class="delete-button">×</button>
              </div>
              <p class="item-description">{{ item.description }}</p>
              <div class="item-value">Value: {{ item.value }}</div>
            </div>
          </div>
        </section>

        <section class="dashboard-section">
          <div class="section-header">
            <h2>API Data</h2>
            <button @click="fetchApiData" class="refresh-button">🔄 Refresh</button>
          </div>

          <div v-if="apiLoading" class="loading">Loading API data...</div>

          <div v-else class="api-list">
            <div
              v-for="post in apiData.slice(0, 5)"
              :key="post.id"
              class="api-card"
            >
              <h4>{{ post.title }}</h4>
              <p>{{ post.body }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../lib/supabase'

interface DashboardItem {
  id: string
  title: string
  description: string
  value: number
  created_at: string
}

interface ApiPost {
  id: number
  userId: number
  title: string
  body: string
}

const router = useRouter()
const { user, signOut } = useAuth()

const dashboardItems = ref<DashboardItem[]>([])
const apiData = ref<ApiPost[]>([])
const loading = ref(true)
const apiLoading = ref(false)
const showAddForm = ref(false)

const newItem = ref({
  title: '',
  description: '',
  value: 0,
})

const totalValue = computed(() => {
  return dashboardItems.value.reduce((sum, item) => sum + Number(item.value), 0)
})

const handleSignOut = async () => {
  await signOut()
  router.push('/login')
}

const fetchDashboardItems = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('dashboard_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data) {
    dashboardItems.value = data
  }
  loading.value = false
}

const addDashboardItem = async () => {
  if (!newItem.value.title) return

  const { error } = await supabase
    .from('dashboard_items')
    .insert([
      {
        user_id: user.value?.id,
        title: newItem.value.title,
        description: newItem.value.description,
        value: newItem.value.value,
      },
    ])

  if (!error) {
    newItem.value = { title: '', description: '', value: 0 }
    showAddForm.value = false
    await fetchDashboardItems()
  }
}

const deleteItem = async (id: string) => {
  const { error } = await supabase
    .from('dashboard_items')
    .delete()
    .eq('id', id)

  if (!error) {
    await fetchDashboardItems()
  }
}

const fetchApiData = async () => {
  apiLoading.value = true
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    const data = await response.json()
    apiData.value = data
  } catch (error) {
    console.error('Failed to fetch API data:', error)
  } finally {
    apiLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardItems()
  fetchApiData()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7fafc, #edf2f7);
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  color: #1a202c;
  font-size: 1.875rem;
  font-weight: 700;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-email {
  color: #4a5568;
  font-size: 0.875rem;
}

.logout-button {
  background: #e53e3e;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-button:hover {
  background: #c53030;
}

.dashboard-main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-value {
  margin: 0.25rem 0 0 0;
  color: #1a202c;
  font-size: 1.875rem;
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 700;
}

.add-button,
.refresh-button {
  background: #48bb78;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover,
.refresh-button:hover {
  background: #38a169;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.form-input {
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.submit-form-button {
  background: #4299e1;
  color: white;
  padding: 0.625rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-form-button:hover {
  background: #3182ce;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #a0aec0;
}

.items-list,
.api-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card,
.api-card {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s;
}

.item-card:hover,
.api-card:hover {
  border-color: #cbd5e0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.item-header h3,
.api-card h4 {
  margin: 0;
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
}

.delete-button {
  background: #fc8181;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-button:hover {
  background: #f56565;
}

.item-description,
.api-card p {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
  font-size: 0.875rem;
  line-height: 1.5;
}

.item-value {
  color: #38a169;
  font-weight: 600;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
