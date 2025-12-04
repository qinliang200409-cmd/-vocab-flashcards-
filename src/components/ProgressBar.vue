<template>
  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
    <div 
      class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    required: true,
    default: 0
  }
})
</script>
