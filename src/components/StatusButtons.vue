<template>
  <div class="space-y-4">
    <!-- Status Buttons -->
    <div class="grid grid-cols-3 gap-3">
      <button
        @click="$emit('mark-known')"
        class="status-btn status-known"
        title="快捷键: 1"
      >
        <span class="block text-lg mb-1">✓</span>
        <span class="block text-sm">认识</span>
        <span class="block text-xs opacity-75">1</span>
      </button>
      
      <button
        @click="$emit('mark-fuzzy')"
        class="status-btn status-fuzzy"
        title="快捷键: 2"
      >
        <span class="block text-lg mb-1">⚠</span>
        <span class="block text-sm">模糊</span>
        <span class="block text-xs opacity-75">2</span>
      </button>
      
      <button
        @click="$emit('mark-unknown')"
        class="status-btn status-unknown"
        title="快捷键: 3"
      >
        <span class="block text-lg mb-1">✗</span>
        <span class="block text-sm">不认识</span>
        <span class="block text-xs opacity-75">3</span>
      </button>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-around text-sm">
      <div class="text-center">
        <div class="text-known font-bold text-lg">{{ stats.known }}</div>
        <div class="text-gray-600 dark:text-gray-400">认识</div>
      </div>
      <div class="text-center">
        <div class="text-fuzzy font-bold text-lg">{{ stats.fuzzy }}</div>
        <div class="text-gray-600 dark:text-gray-400">模糊</div>
      </div>
      <div class="text-center">
        <div class="text-unknown font-bold text-lg">{{ stats.unknown }}</div>
        <div class="text-gray-600 dark:text-gray-400">不认识</div>
      </div>
      <div class="text-center">
        <div class="text-gray-900 dark:text-white font-bold text-lg">{{ stats.remaining }}</div>
        <div class="text-gray-600 dark:text-gray-400">剩余</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})

defineEmits(['mark-known', 'mark-fuzzy', 'mark-unknown'])
</script>
