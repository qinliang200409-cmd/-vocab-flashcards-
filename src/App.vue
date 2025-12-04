<template>
  <ErrorBoundary>
    <div id="app" class="min-h-screen">
      <router-view />
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { onMounted } from 'vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

onMounted(() => {
  // Check for dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
