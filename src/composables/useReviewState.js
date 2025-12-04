import { ref, computed } from 'vue'
import { useStorage } from './useStorage'

export function useReviewState(initialWords = []) {
  const { updateWordStatus, getWordStatus } = useStorage()
  
  const words = ref(initialWords)
  const currentIndex = ref(0)
  const reviewHistory = ref([]) // Session-only history, not persistent
  
  // Statistics - only for current session
  const stats = computed(() => {
    const known = reviewHistory.value.filter(h => h.status === 'known').length
    const fuzzy = reviewHistory.value.filter(h => h.status === 'fuzzy').length
    const unknown = reviewHistory.value.filter(h => h.status === 'unknown').length
    const total = words.value.length
    const reviewed = reviewHistory.value.length // Number of words actually reviewed
    const remaining = total - reviewed
    
    return {
      known,
      fuzzy,
      unknown,
      total,
      reviewed,
      remaining,
      progress: total > 0 ? (reviewed / total) * 100 : 0
    }
  })
  
  // Current word
  const currentWord = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < words.value.length) {
      return words.value[currentIndex.value]
    }
    return null
  })
  
  // Check if review is complete
  const isComplete = computed(() => {
    return currentIndex.value >= words.value.length
  })
  
  // Mark current word status
  const markStatus = (status) => {
    if (!currentWord.value) return
    
    const word = currentWord.value
    
    // Check if this word was already marked in current session
    const existingIndex = reviewHistory.value.findIndex(h => h.wordId === word.id)
    
    if (existingIndex !== -1) {
      // Update existing entry instead of creating a new one
      reviewHistory.value[existingIndex] = {
        wordId: word.id,
        word: word.word,
        status: status,
        timestamp: Date.now()
      }
    } else {
      // Create new history entry
      const historyEntry = {
        wordId: word.id,
        word: word.word,
        status: status,
        timestamp: Date.now()
      }
      reviewHistory.value.push(historyEntry)
    }
    
    // Update word status in persistent storage
    updateWordStatus(word.id, status)
    
    // Move to next word
    nextWord()
  }
  
  // Navigate to next word
  const nextWord = () => {
    if (currentIndex.value < words.value.length - 1) {
      currentIndex.value++
    } else {
      currentIndex.value = words.value.length // Mark as complete
    }
  }
  
  // Navigate to previous word
  const prevWord = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }
  
  // Undo last action
  const undo = () => {
    if (reviewHistory.value.length === 0) return
    
    // Remove last history entry from session
    reviewHistory.value.pop()
    
    // Go back one word
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }
  
  // Reset review session
  const reset = () => {
    currentIndex.value = 0
    reviewHistory.value = [] // Clear session history
  }
  
  // Set words list
  const setWords = (newWords) => {
    words.value = newWords
    reset()
  }
  
  // Get words by status for filtered review
  const getWordsByStatus = (status) => {
    return words.value.filter(word => {
      const wordStatus = getWordStatus(word.id)
      return wordStatus && wordStatus.status === status
    })
  }
  
  return {
    words,
    currentIndex,
    currentWord,
    stats,
    isComplete,
    reviewHistory,
    markStatus,
    nextWord,
    prevWord,
    undo,
    reset,
    setWords,
    getWordsByStatus
  }
}
