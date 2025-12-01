<template>
  <div class="daemon-dashboard">
    <!-- Grid Background -->
    <div class="grid-background"></div>
    
    <!-- Main Dashboard -->
    <div class="dashboard-container">
      <!-- Top Status Bar -->
      <div class="status-bar">
        <div class="status-left">
          <div class="system-id">DAEMON://MIESSLER</div>
          <div class="daemon-url">mcp.daemon.danielmiessler.com</div>
          <div class="connection-status">
            <span class="status-dot" :class="{ 'active': isConnected }"></span>
            <span>{{ connectionStatus }}</span>
          </div>
        </div>
        <div class="status-center">
          <div class="timestamp">{{ currentDateTime }}</div>
        </div>
        <div class="status-right">
          <div class="metric">
            <span class="metric-label">ENDPOINTS</span>
            <span class="metric-value">{{ availableTools.length }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">LAST_SYNC</span>
            <span class="metric-value">{{ formatDate(daemonData.last_updated) }}</span>
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="dashboard-grid">
        <!-- Loading State -->
        <div v-if="loading" class="panel loading-panel compact">
          <div class="panel-header">
            <span class="panel-title">INITIALIZING</span>
            <span class="panel-status pulse">CONNECTING</span>
          </div>
          <div class="panel-content">
            <div class="loading-text">Establishing MCP connection...</div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="panel error-panel compact">
          <div class="panel-header">
            <span class="panel-title">CONNECTION_ERROR</span>
            <span class="panel-status error">FAILED</span>
          </div>
          <div class="panel-content">
            <div class="error-text">{{ error }}</div>
            <button @click="fetchDaemonData" class="retry-btn">RETRY</button>
          </div>
        </div>

        <!-- Live Data Panels -->
        <template v-else>
          <!-- Location Panel -->
          <div class="panel location-panel compact">
            <div class="panel-header">
              <span class="panel-title">LOCATION</span>
              <span class="panel-status">LIVE</span>
            </div>
            <div class="panel-content">
              <div class="location-data">{{ daemonData.current_location }}</div>
            </div>
          </div>

          <!-- About Panel -->
          <div class="panel about-panel compact">
            <div class="panel-header">
              <span class="panel-title">STATUS</span>
              <span class="panel-status">ONLINE</span>
            </div>
            <div class="panel-content">
              <div class="about-text">{{ truncateText(daemonData.about, 150) }}</div>
            </div>
          </div>

          <!-- Mission Panel -->
          <div class="panel mission-panel compact">
            <div class="panel-header">
              <span class="panel-title">MISSION</span>
              <span class="panel-status">ACTIVE</span>
            </div>
            <div class="panel-content">
              <div class="mission-text">{{ truncateText(daemonData.mission, 150) }}</div>
            </div>
          </div>

          <!-- TELOS Framework -->
          <div class="panel telos-panel compact">
            <div class="panel-header">
              <span class="panel-title">TELOS</span>
              <span class="panel-status">{{ daemonData.telos?.length || 0 }} ITEMS</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">Personal framework for purpose and direction. 
                <a href="/blog/ai-predictable-path-7-components-2024" class="intro-link">Learn more →</a>
              </div>
              <div class="telos-list">
                <div v-for="(item, i) in daemonData.telos?.slice(0, 6)" :key="i" class="telos-item">
                  <span class="item-id">{{ extractItemId(item) }}</span>
                  <span class="item-text">{{ truncateText(extractItemText(item), 80) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Technical Projects -->
          <div class="panel projects-panel compact">
            <div class="panel-header">
              <span class="panel-title">TECH_PROJECTS</span>
              <span class="panel-status">{{ daemonData.projects?.technical?.length || 0 }} ACTIVE</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">Current technical projects and tools.</div>
              <div class="project-list">
                <div v-for="(project, i) in daemonData.projects?.technical?.slice(0, 4)" :key="i" class="project-item">
                  {{ truncateText(project, 60) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Projects -->
          <div class="panel personal-panel compact">
            <div class="panel-header">
              <span class="panel-title">PERSONAL</span>
              <span class="panel-status">{{ daemonData.projects?.personal?.length || 0 }} ITEMS</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">Personal interests and collections.</div>
              <div class="project-list">
                <div v-for="(project, i) in daemonData.projects?.personal?.slice(0, 4)" :key="i" class="project-item">
                  {{ truncateText(project, 60) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div class="panel preferences-panel compact">
            <div class="panel-header">
              <span class="panel-title">PREFERENCES</span>
              <span class="panel-status">{{ daemonData.preferences?.length || 0 }} SET</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">Work style and technical preferences.</div>
              <div class="preferences-list">
                <div v-for="(pref, i) in daemonData.preferences?.slice(0, 5)" :key="i" class="preference-item">
                  {{ truncateText(pref, 70) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Books -->
          <div class="panel books-panel compact">
            <div class="panel-header">
              <span class="panel-title">BOOKS</span>
              <span class="panel-status">{{ daemonData.favorite_books?.length || 0 }} FAV</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">Recommended reading list.</div>
              <div class="books-list">
                <div v-for="(book, i) in daemonData.favorite_books?.slice(0, 4)" :key="i" class="book-item">
                  {{ truncateText(book, 50) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Movies -->
          <div class="panel movies-panel compact">
            <div class="panel-header">
              <span class="panel-title">MOVIES</span>
              <span class="panel-status">{{ daemonData.favorite_movies?.length || 0 }} FAV</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">Favorite films and recommendations.</div>
              <div class="movies-list">
                <div v-for="(movie, i) in daemonData.favorite_movies?.slice(0, 4)" :key="i" class="movie-item">
                  {{ truncateText(movie, 40) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Predictions -->
          <div class="panel predictions-panel compact">
            <div class="panel-header">
              <span class="panel-title">PREDICTIONS</span>
              <span class="panel-status">{{ daemonData.predictions?.length || 0 }} ACTIVE</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">AI and technology predictions with confidence levels.</div>
              <div class="predictions-list">
                <div v-for="(prediction, i) in daemonData.predictions?.slice(0, 3)" :key="i" class="prediction-item">
                  {{ truncateText(prediction, 90) }}
                </div>
              </div>
            </div>
          </div>

          <!-- API Access -->
          <div class="panel api-panel compact">
            <div class="panel-header">
              <span class="panel-title">API_ACCESS</span>
              <span class="panel-status">LIVE</span>
            </div>
            <div class="panel-content">
              <div class="panel-intro">MCP-compatible API for real-time data access.</div>
              <div class="api-display">
                <code class="api-url">daemon.danielmiessler.com</code>
                <div class="api-stats">
                  <span>MCP</span>
                  <span>{{ availableTools.length }} TOOLS</span>
                  <span>{{ formatTime(daemonData.last_updated) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// State
const loading = ref(true)
const error = ref<string | null>(null)
const isConnected = ref(false)
const currentTime = ref(new Date())
const daemonData = ref<any>({})
const availableTools = ref<any[]>([])

let timer: any = null

// Lifecycle
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
  
  fetchDaemonData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Computed
const currentDateTime = computed(() => {
  return currentTime.value.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
})

const connectionStatus = computed(() => {
  return isConnected.value ? 'MCP CONNECTED' : 'DISCONNECTED'
})

// Methods
async function fetchDaemonData() {
  loading.value = true
  error.value = null
  
  try {
    // Get available tools
    const toolsResponse = await fetch('https://mcp.daemon.danielmiessler.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 1
      })
    })
    
    if (toolsResponse.ok) {
      const toolsData = await toolsResponse.json()
      availableTools.value = toolsData.result?.tools || []
    }

    // Get all daemon data
    const dataResponse = await fetch('https://mcp.daemon.danielmiessler.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'get_all', arguments: {} },
        id: 2
      })
    })
    
    if (dataResponse.ok) {
      const response = await dataResponse.json()
      if (response.result?.content?.[0]?.text) {
        daemonData.value = JSON.parse(response.result.content[0].text)
        isConnected.value = true
      } else {
        throw new Error('Invalid response format')
      }
    } else {
      throw new Error(`HTTP ${dataResponse.status}`)
    }
  } catch (err: any) {
    error.value = `Connection failed: ${err.message}`
    isConnected.value = false
  } finally {
    loading.value = false
  }
}

// Helper functions
function formatDate(dateStr: string): string {
  if (!dateStr) return 'UNKNOWN'
  return new Date(dateStr).toISOString().slice(0, 10)
}

function formatTime(dateStr: string): string {
  if (!dateStr) return 'UNKNOWN'
  return new Date(dateStr).toISOString().slice(11, 19)
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

function extractItemId(item: string): string {
  const match = item.match(/^([PMG]\d+)/)
  return match ? match[1] : '??'
}

function extractItemText(item: string): string {
  return item.replace(/^[PMG]\d+:\s*/, '')
}
</script>

<style scoped>
/* Reset and base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.daemon-dashboard {
  min-height: 100vh;
  background: #0a0a0f;
  color: #c0caf5;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  position: relative;
  overflow-x: hidden;
}

/* Grid background */
.grid-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(157, 124, 216, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(157, 124, 216, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* Dashboard container */
.dashboard-container {
  position: relative;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0.75rem;
}

/* Status bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1a1b26;
  border: 1px solid #3b4261;
  border-radius: 3px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
}

.status-left {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.system-id {
  color: #9d7cd8;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.daemon-url {
  color: #7dcfff;
  font-size: 0.7rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #9ece6a;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f7768e;
}

.status-dot.active {
  background: #9ece6a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.timestamp {
  font-variant-numeric: tabular-nums;
  color: #7dcfff;
  font-size: 0.7rem;
}

.status-right {
  display: flex;
  gap: 1.5rem;
}

.metric {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.metric-label {
  color: #565f89;
  font-size: 0.65rem;
}

.metric-value {
  color: #c0caf5;
  font-weight: 600;
  font-size: 0.7rem;
}

/* Dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
  grid-auto-rows: auto;
}

/* Panels */
.panel {
  background: #1a1b26;
  border: 1px solid #3b4261;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.panel.compact {
  min-height: auto;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #9d7cd8, transparent);
  opacity: 0.4;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #3b4261;
  background: #1f2335;
}

.panel-title {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #7aa2f7;
}

.panel-status {
  font-size: 0.55rem;
  padding: 0.1rem 0.4rem;
  background: #292e42;
  color: #9ece6a;
  border-radius: 2px;
  font-weight: 600;
}

.panel-status.pulse {
  animation: pulse 2s infinite;
}

.panel-status.error {
  background: #f7768e;
  color: #1a1b26;
}

.panel-content {
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Panel intro text */
.panel-intro {
  color: #565f89;
  font-size: 0.65rem;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.intro-link {
  color: #7aa2f7;
  text-decoration: none;
  font-weight: 600;
}

.intro-link:hover {
  color: #9d7cd8;
}

/* Content styles */
.loading-text, .error-text {
  color: #a9b1d6;
  font-size: 0.75rem;
  text-align: center;
  padding: 1rem;
}

.retry-btn {
  background: #9d7cd8;
  color: #1a1b26;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 2px;
  font-family: inherit;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.retry-btn:hover {
  background: #bb9af7;
}

.location-data, .about-text, .mission-text {
  color: #c0caf5;
  font-size: 0.7rem;
  line-height: 1.4;
}

.telos-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.telos-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.3rem;
  background: #1f2335;
  border-radius: 2px;
}

.item-id {
  color: #9d7cd8;
  font-weight: 700;
  font-size: 0.65rem;
  min-width: 25px;
}

.item-text {
  color: #a9b1d6;
  font-size: 0.65rem;
  line-height: 1.3;
}

.project-list, .preferences-list, .books-list, .movies-list, .predictions-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.project-item, .preference-item, .book-item, .movie-item, .prediction-item {
  color: #a9b1d6;
  font-size: 0.65rem;
  padding: 0.2rem 0;
  line-height: 1.3;
  border-bottom: 1px solid #292e42;
}

.project-item:last-child, .preference-item:last-child, .book-item:last-child, 
.movie-item:last-child, .prediction-item:last-child {
  border-bottom: none;
}

/* API display */
.api-display {
  background: #1f2335;
  border-radius: 2px;
  padding: 0.75rem;
}

.api-url {
  display: block;
  padding: 0.5rem;
  background: #0a0a0f;
  border: 1px solid #3b4261;
  border-radius: 2px;
  color: #7dcfff;
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.api-stats {
  display: flex;
  justify-content: space-around;
  font-size: 0.55rem;
  color: #565f89;
}

.api-stats span {
  padding: 0.2rem 0.4rem;
  background: #292e42;
  border-radius: 2px;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
  
  .status-bar {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .status-left, .status-right {
    gap: 1rem;
  }
}
</style>