import { ref, watch } from 'vue'

const STORAGE_KEY = 'vocab_review_data'
const REVIEW_HISTORY_KEY = 'vocab_review_history'

export function useStorage() {
  const data = ref({
    words: {},
    settings: {
      darkMode: false,
      autoPlay: true
    }
  })
  
  const reviewHistory = ref([])

  // Load data from localStorage
  const loadData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        data.value = JSON.parse(stored)
      }
      
      // Load review history
      const storedHistory = localStorage.getItem(REVIEW_HISTORY_KEY)
      if (storedHistory) {
        reviewHistory.value = JSON.parse(storedHistory)
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error)
    }
  }

  // Save data to localStorage
  const saveData = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
      localStorage.setItem(REVIEW_HISTORY_KEY, JSON.stringify(reviewHistory.value))
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
      // If storage is full, try to clean old data
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, clearing old review history')
        reviewHistory.value = reviewHistory.value.slice(-100) // Keep only last 100 reviews
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
          localStorage.setItem(REVIEW_HISTORY_KEY, JSON.stringify(reviewHistory.value))
        } catch (retryError) {
          console.error('Still failed after cleanup:', retryError)
        }
      }
    }
  }

  // Update word status
  const updateWordStatus = (wordId, status) => {
    if (!data.value.words[wordId]) {
      data.value.words[wordId] = {
        status: status,
        lastReview: Date.now(),
        reviewCount: 1
      }
    } else {
      data.value.words[wordId].status = status
      data.value.words[wordId].lastReview = Date.now()
      data.value.words[wordId].reviewCount++
    }
    saveData()
  }

  // Get word status
  const getWordStatus = (wordId) => {
    return data.value.words[wordId] || null
  }

  // Update settings
  const updateSettings = (newSettings) => {
    data.value.settings = { ...data.value.settings, ...newSettings }
    saveData()
  }

  // Save review history entry
  const saveReviewEntry = (entry) => {
    reviewHistory.value.push(entry)
    // Limit review history to last 1000 entries to prevent storage overflow
    if (reviewHistory.value.length > 1000) {
      reviewHistory.value = reviewHistory.value.slice(-1000)
    }
    saveData()
  }
  
  // Get review history
  const getReviewHistory = () => {
    return reviewHistory.value
  }
  
  // Clear review history
  const clearReviewHistory = () => {
    reviewHistory.value = []
    localStorage.removeItem(REVIEW_HISTORY_KEY)
  }
  
  // Clear all data
  const clearData = () => {
    data.value = {
      words: {},
      settings: {
        darkMode: false,
        autoPlay: true
      }
    }
    reviewHistory.value = []
    saveData()
  }

  // Initialize
  loadData()

  return {
    data,
    reviewHistory,
    updateWordStatus,
    getWordStatus,
    updateSettings,
    saveReviewEntry,
    getReviewHistory,
    clearReviewHistory,
    clearData,
    saveData
  }
}
