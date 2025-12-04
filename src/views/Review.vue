<template>
  <div class="min-h-screen flex flex-col p-4">
    <!-- Header with Progress -->
    <div class="max-w-2xl w-full mx-auto mb-4">
      <div class="flex items-center justify-between mb-2">
        <button
          @click="goBack"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← 返回
        </button>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ stats.reviewed }} / {{ stats.total }}
        </div>
      </div>
      
      <!-- Progress Bar -->
      <ProgressBar :progress="stats.progress" />
    </div>

    <!-- Card Display -->
    <div v-if="!isComplete" class="flex-1 flex items-center justify-center">
      <FlashCard
        :word="currentWord"
        @next="nextWord"
        @prev="prevWord"
        @mark-status="enhancedMarkStatus"
      />
    </div>

    <!-- Completion Screen -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div class="text-6xl">🎉</div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          复习完成！
        </h2>
        
        <div class="space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">本次复习：</span>
            <span class="font-semibold">{{ stats.total }} 个单词</span>
          </div>
          <div class="flex justify-between text-known">
            <span>认识：</span>
            <span class="font-semibold">{{ stats.known }} ({{ getPercentage(stats.known) }}%)</span>
          </div>
          <div class="flex justify-between text-fuzzy">
            <span>模糊：</span>
            <span class="font-semibold">{{ stats.fuzzy }} ({{ getPercentage(stats.fuzzy) }}%)</span>
          </div>
          <div class="flex justify-between text-unknown">
            <span>不认识：</span>
            <span class="font-semibold">{{ stats.unknown }} ({{ getPercentage(stats.unknown) }}%)</span>
          </div>
        </div>

        <div class="space-y-3 pt-4">
          <button
            v-if="stats.unknown > 0"
            @click="reviewUnknown"
            class="w-full px-6 py-3 bg-unknown text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            重新复习陌生词 ({{ stats.unknown }})
          </button>
          <button
            @click="goBack"
            class="w-full px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>

    <!-- Status Statistics and Controls -->
    <div v-if="!isComplete" class="max-w-2xl w-full mx-auto mt-4 space-y-3">
      <StatusButtons
        :stats="stats"
        @mark-known="enhancedMarkStatus('known')"
        @mark-fuzzy="enhancedMarkStatus('fuzzy')"
        @mark-unknown="enhancedMarkStatus('unknown')"
      />
      
      <!-- Undo Button for Mobile Users -->
      <div class="flex justify-center">
        <button
          @click="undo"
          :disabled="stats.reviewed === 0"
          class="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="撤销上一步 (快捷键: Z)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          撤销
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, onBeforeUnmount, computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReviewState } from '@/composables/useReviewState'
import { useWordbook } from '@/composables/useWordbook'
import { useStatistics } from '@/composables/useStatistics'
import FlashCard from '@/components/FlashCard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatusButtons from '@/components/StatusButtons.vue'

const router = useRouter()

// Load words from sessionStorage
const storedWords = sessionStorage.getItem('reviewWords')
const currentSessionId = sessionStorage.getItem('reviewSessionId')

console.log('Review page loaded')
console.log('SessionId:', currentSessionId)
console.log('Words count:', storedWords ? JSON.parse(storedWords).length : 0)

// Parse words or use empty array
const words = storedWords ? JSON.parse(storedWords) : []
console.log('Loaded words:', words.length, 'words for review')

// Redirect if no words found
if (words.length === 0) {
  console.log('No words in sessionStorage, redirecting to home')
  router.push('/')
}

const {
  currentWord,
  stats,
  isComplete,
  markStatus,
  nextWord,
  prevWord,
  undo,
  setWords,
  getWordsByStatus,
  reviewHistory
} = useReviewState(words)

// Wordbook integration
const { getActiveWordbook, updateWordbookStats } = useWordbook()

// Statistics tracking
const { startSession, recordWordReview, endSession, currentSession } = useStatistics()

// Flag to prevent duplicate endSession calls
let sessionEnded = false

// Safe endSession wrapper
const safeEndSession = () => {
  if (!sessionEnded && currentSession.value) {
    sessionEnded = true
    endSession()
    return true
  }
  return false
}

// Update wordbook statistics whenever review state changes
watch(() => stats.value, (newStats) => {
  const activeWordbook = getActiveWordbook.value
  if (activeWordbook) {
    updateWordbookStats(activeWordbook.id, {
      known: newStats.known,
      fuzzy: newStats.fuzzy,
      unknown: newStats.unknown
    })
  }
}, { deep: true })

// Enhanced markStatus to record statistics
const originalMarkStatus = markStatus
const enhancedMarkStatus = (status) => {
  originalMarkStatus(status)
  recordWordReview(status)
}

const getPercentage = (count) => {
  if (stats.value.total === 0) return 0
  return Math.round((count / stats.value.total) * 100)
}

const goBack = () => {
  router.push('/')
}

const reviewUnknown = () => {
  // End current session before starting a new one
  safeEndSession()
  
  // Get all words marked as unknown from the review history
  const unknownWordIds = reviewHistory.value
    .filter(h => h.status === 'unknown')
    .map(h => h.wordId)
  
  // Filter the original words array to get only unknown words
  const unknownWords = words.filter(word => unknownWordIds.includes(word.id))
  
  if (unknownWords.length > 0) {
    sessionStorage.setItem('reviewWords', JSON.stringify(unknownWords))
    // Reset the review with only unknown words
    setWords(unknownWords)
    // Start a new session for reviewing unknown words
    sessionEnded = false  // Reset flag for new session
    startSession()
  }
}

// Keyboard shortcuts
const handleKeyDown = (event) => {
  switch(event.key) {
    case '1':
      enhancedMarkStatus('known')
      break
    case '2':
      enhancedMarkStatus('fuzzy')
      break
    case '3':
      enhancedMarkStatus('unknown')
      break
    case 'ArrowLeft':
      prevWord()
      break
    case 'ArrowRight':
      nextWord()
      break
    case 'z':
    case 'Z':
      undo()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // Start statistics session
  sessionEnded = false
  startSession()
  console.log('📊 Statistics session started')
})

onBeforeUnmount(() => {
  // End session when leaving the page (only if not already ended)
  if (safeEndSession()) {
    console.log('📊 Statistics session ended (page unmount)')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Watch for completion to end session
watch(() => isComplete.value, (completed) => {
  if (completed && safeEndSession()) {
    console.log('📊 Statistics session ended (review completed)')
  }
})
</script>
