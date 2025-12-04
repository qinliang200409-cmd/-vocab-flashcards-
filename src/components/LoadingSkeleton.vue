<template>
  <div class="loading-skeleton">
    <!-- Header Skeleton -->
    <div v-if="type === 'page'" class="space-y-4 animate-pulse">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    </div>

    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="animate-pulse">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-4">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div class="flex gap-2">
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-if="type === 'list'" class="space-y-3 animate-pulse">
      <div v-for="i in count" :key="i" class="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <div class="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Chart Skeleton -->
    <div v-if="type === 'chart'" class="animate-pulse">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
        <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>

    <!-- Stats Skeleton -->
    <div v-if="type === 'stats'" class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'page', // 'page', 'card', 'list', 'chart', 'stats'
    validator: (value) => ['page', 'card', 'list', 'chart', 'stats'].includes(value)
  },
  count: {
    type: Number,
    default: 3 // For list type
  }
})
</script>

<style scoped>
.loading-skeleton {
  @apply w-full;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
