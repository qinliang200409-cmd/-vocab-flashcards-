<template>
  <div class="min-h-screen flex flex-col p-4">
    <!-- Loading State -->
    <div v-if="isInitializing" class="flex-1 flex flex-col items-center justify-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      <p class="text-gray-600 dark:text-gray-400 font-medium">正在准备复习内容...</p>
    </div>

    <!-- No Words State -->
    <div v-else-if="noWordsMessage" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div class="text-6xl mb-4">🎉</div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">太棒了！</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {{ noWordsMessage }}
      </p>
      <div class="space-y-3 w-full max-w-xs">
        <button
          @click="goBack"
          class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          返回首页
        </button>
        <button
          @click="router.push('/')"
          class="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          尝试随机复习
        </button>
      </div>
    </div>

    <!-- Review Content -->
    <template v-else>
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
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, onBeforeUnmount, computed, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useReviewState } from '@/composables/useReviewState'
import { useWordbook } from '@/composables/useWordbook'
import { useStorage } from '@/composables/useStorage'
import { useStatistics } from '@/composables/useStatistics'
import { prioritizeCards } from '@/utils/reviewAlgorithm'
import FlashCard from '@/components/FlashCard.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatusButtons from '@/components/StatusButtons.vue'

const router = useRouter()
const { data } = useStorage()
const { getActiveWordbook, updateWordbookStats, isLoading: isWordbookLoading } = useWordbook()

// Initialize review state with empty array initially
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
} = useReviewState([])

// State
const isInitializing = ref(true)
const noWordsMessage = ref('')

// Initialize Logic
const initReviewSession = async () => {
  isInitializing.value = true
  noWordsMessage.value = ''
  
  // 1. Try Session Storage (Random Mode / Forced Review)
  const storedWords = sessionStorage.getItem('reviewWords')
  if (storedWords) {
    try {
      const parsed = JSON.parse(storedWords)
      if (parsed.length > 0) {
        setWords(parsed)
        isInitializing.value = false
        console.log(`Loaded ${parsed.length} words from session storage`)
        return
      }
    } catch (e) {
      console.error('Failed to parse session words', e)
    }
  }

  // 2. Wait for Wordbook Loading
  if (isWordbookLoading.value) {
    // Watcher will trigger this function again when loading finishes
    console.log('Waiting for wordbook to load...')
    return
  }

  // 3. Load from Active Wordbook (Smart Review)
  const activeBook = getActiveWordbook.value
  if (activeBook) {
    const allWords = activeBook.words
    if (allWords && allWords.length > 0) {
      // Prioritize words
      const sorted = prioritizeCards(allWords, data.value.words)
      
      // Select words to review
      // We prioritize unknown/fuzzy, then old known words
      // If we only have "fresh" known words, prioritizeCards puts them at the end with low priority
      
      // For now, let's take up to 50 words that are most "due"
      let sessionWords = sorted.slice(0, 50)
      
      // Filter out words that are VERY recently reviewed (e.g. today) AND known?
      // Maybe not necessary, if user clicks review, they might want to review something.
      // But if priority is very low, maybe we warn?
      // prioritizeCards logic puts 'unknown' at 100, 'fuzzy' at 50.
      // 'known' depends on days since review.
      
      if (sessionWords.length > 0) {
        setWords(sessionWords)
        isInitializing.value = false
        console.log(`Loaded ${sessionWords.length} words from active wordbook (smart review)`)
        return
      }
    } else {
      noWordsMessage.value = '当前词库是空的。'
      isInitializing.value = false
      return
    }
  }

  // 4. No active wordbook or empty
  if (!activeBook) {
    noWordsMessage.value = '未选择词库。请先在首页选择或创建一个词库。'
  } else {
    noWordsMessage.value = '您已经复习完所有需要复习的单词了！'
  }
  isInitializing.value = false
}

// Watchers
watch(isWordbookLoading, (loading) => {
  if (!loading) {
    initReviewSession()
  }
})

// Statistics tracking
const { startSession, recordWordReview, endSession, currentSession } = useStatistics()
let sessionEnded = false

const safeEndSession = () => {
  if (!sessionEnded && currentSession.value) {
    sessionEnded = true
    endSession()
    return true
  }
  return false
}

// Update wordbook statistics
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

// Enhanced markStatus
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
  safeEndSession()
  
  const unknownWordIds = reviewHistory.value
    .filter(h => h.status === 'unknown')
    .map(h => h.wordId)
  
  // We need access to original words. 'words' is not available here since we didn't pass it to setup.
  // BUT useReviewState has 'words' state internally but doesn't expose all of them directly cleanly.
  // Wait, I can't easily get 'all currently loaded words' from useReviewState unless I expose them.
  // useReviewState exposes `currentWord` and `nextWord` etc.
  // Actually, I can reload them from `setWords`.
  // Or better, let's fix `useReviewState.js` to expose `words` or `remainingWords`?
  // Or I can just filter from the words I passed to `setWords`.
  // But I don't have a persistent reference to "current session words" in this scope except what I passed.
  // I passed `sessionWords` to `setWords`.
  
  // WORKAROUND: For this specific "Review Unknown" button feature, 
  // I need to know what the words were.
  // Since I don't have them easily accessible, I will disable this button or fix logic.
  // Actually, `useReviewState` should probably support "restart with unknown".
  
  // Let's check reviewHistory. It has wordId.
  // I can look up wordId in activeWordbook or data.words.
  // activeWordbook is available.
  
  if (!getActiveWordbook.value) return
  const allBookWords = getActiveWordbook.value.words
  
  const unknownWords = allBookWords.filter(w => unknownWordIds.includes(w.id))
  
  if (unknownWords.length > 0) {
    setWords(unknownWords)
    sessionEnded = false
    startSession()
  }
}

// Keyboard shortcuts
const handleKeyDown = (event) => {
  if (isInitializing.value || noWordsMessage.value || isComplete.value) return
  
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
  initReviewSession()
  window.addEventListener('keydown', handleKeyDown)
  // Start statistics session
  sessionEnded = false
  startSession()
})

onBeforeUnmount(() => {
  if (safeEndSession()) {
    console.log('Session ended')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

watch(() => isComplete.value, (completed) => {
  if (completed && safeEndSession()) {
    console.log('Session completed')
  }
})
</script>
