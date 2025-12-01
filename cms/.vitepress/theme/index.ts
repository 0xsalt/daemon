import { h } from 'vue'
import type { Theme } from 'vitepress'
import './style.css'
import DaemonDashboard from './components/DaemonDashboard.vue'
import { initAnalytics } from './analytics'

export default {
  Layout: DaemonDashboard,
  enhanceApp({ app, router, siteData }) {
    // Register custom components
    app.component('DaemonDashboard', DaemonDashboard)
    
    // Initialize analytics tracking
    initAnalytics(router)
  }
} satisfies Theme