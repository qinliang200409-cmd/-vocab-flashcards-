<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full">
      <!-- Error Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <!-- Error Icon -->
        <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full">
          <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <!-- Error Message -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            出错了
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Error Details (Dev Mode) -->
        <details v-if="showDetails" class="text-left">
          <summary class="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            查看详细信息
          </summary>
          <pre class="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs text-red-600 dark:text-red-400 overflow-auto max-h-48">{{ errorDetails }}</pre>
        </details>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="retry"
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 重试
          </button>
          
          <button
            @click="goHome"
            class="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            🏠 返回首页
          </button>

          <button
            @click="clearData"
            class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            🗑️ 清除数据并重置
          </button>
        </div>

        <!-- Help Text -->
        <p class="text-xs text-gray-500 dark:text-gray-400">
          如果问题持续出现，请尝试清除数据或联系技术支持
        </p>
      </div>
    </div>
  </div>

  <!-- Normal Content -->
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)
const error = ref(null)

const props = defineProps({
  showDetails: {
    type: Boolean,
    default: import.meta.env.DEV // Only show details in dev mode
  }
})

const errorMessage = computed(() => {
  if (!error.value) return '应用程序遇到了意外错误'
  
  // User-friendly error messages
  if (error.value.message?.includes('localStorage')) {
    return '本地存储空间不足或被禁用，请检查浏览器设置'
  }
  if (error.value.message?.includes('fetch') || error.value.message?.includes('network')) {
    return '网络连接出现问题，请检查您的网络连接'
  }
  if (error.value.message?.includes('JSON')) {
    return '数据格式错误，可能需要清除缓存数据'
  }
  
  return error.value.message || '应用程序遇到了意外错误'
})

const errorDetails = computed(() => {
  if (!error.value) return ''
  return `${error.value.message}\n\n${error.value.stack || ''}`
})

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)
  
  error.value = err
  hasError.value = true
  
  // Prevent error from propagating
  return false
})

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    error.value = event.error
    hasError.value = true
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    error.value = event.reason
    hasError.value = true
  })
}

const retry = () => {
  hasError.value = false
  error.value = null
  // Reload current route
  router.go(0)
}

const goHome = () => {
  hasError.value = false
  error.value = null
  router.push('/')
}

const clearData = () => {
  if (confirm('这将清除所有学习数据和词库，确定继续？')) {
    try {
      // Clear all localStorage data
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('vocab_') || key.startsWith('learning_')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      alert('数据已清除，即将重新加载页面')
      
      // Reload page
      window.location.href = '/'
    } catch (err) {
      console.error('Failed to clear data:', err)
      alert('清除数据失败：' + err.message)
    }
  }
}
</script>

<style scoped>
details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
