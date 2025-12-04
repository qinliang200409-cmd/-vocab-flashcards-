import { ref, computed } from 'vue'
import { useStorage } from './useStorage'

const WORDBOOKS_KEY = 'vocab_wordbooks'
const ACTIVE_WORDBOOK_KEY = 'vocab_active_wordbook'

/**
 * Composable for managing multiple wordbooks
 * Supports creating, switching, renaming, and deleting wordbooks
 */
export function useWordbook() {
  const { data, saveData } = useStorage()
  
  // Wordbooks structure: { id: { name, words: [], createdAt, updatedAt, stats: {} } }
  const wordbooks = ref({})
  const activeWordbookId = ref(null)

  /**
   * Load wordbooks from localStorage
   */
  const loadWordbooks = () => {
    try {
      const stored = localStorage.getItem(WORDBOOKS_KEY)
      if (stored) {
        wordbooks.value = JSON.parse(stored)
      }
      
      const activeId = localStorage.getItem(ACTIVE_WORDBOOK_KEY)
      if (activeId && wordbooks.value[activeId]) {
        activeWordbookId.value = activeId
      } else if (Object.keys(wordbooks.value).length > 0) {
        // If no active wordbook, set the first one as active
        activeWordbookId.value = Object.keys(wordbooks.value)[0]
      }
    } catch (error) {
      console.error('Failed to load wordbooks:', error)
    }
  }

  /**
   * Save wordbooks to localStorage
   */
  const saveWordbooks = () => {
    try {
      localStorage.setItem(WORDBOOKS_KEY, JSON.stringify(wordbooks.value))
      if (activeWordbookId.value) {
        localStorage.setItem(ACTIVE_WORDBOOK_KEY, activeWordbookId.value)
      }
    } catch (error) {
      console.error('Failed to save wordbooks:', error)
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded when saving wordbooks')
        // Could implement cleanup logic here
      }
    }
  }

  /**
   * Create a new wordbook
   * @param {string} name - Wordbook name
   * @param {Array} words - Array of word objects [{word, definition, example}]
   * @returns {string} - New wordbook ID
   */
  const createWordbook = (name, words = []) => {
    const id = `wb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    wordbooks.value[id] = {
      id,
      name,
      words,
      createdAt: now,
      updatedAt: now,
      stats: {
        total: words.length,
        known: 0,
        fuzzy: 0,
        unknown: 0,
        notReviewed: words.length
      }
    }
    
    // Set as active if it's the first wordbook
    if (Object.keys(wordbooks.value).length === 1) {
      activeWordbookId.value = id
    }
    
    saveWordbooks()
    return id
  }

  /**
   * Get active wordbook
   * @returns {Object|null} - Active wordbook object or null
   */
  const getActiveWordbook = computed(() => {
    if (!activeWordbookId.value || !wordbooks.value[activeWordbookId.value]) {
      return null
    }
    return wordbooks.value[activeWordbookId.value]
  })

  /**
   * Get all wordbooks as an array
   * @returns {Array} - Array of wordbook objects
   */
  const getWordbooksList = computed(() => {
    return Object.values(wordbooks.value).sort((a, b) => b.updatedAt - a.updatedAt)
  })

  /**
   * Switch to a different wordbook
   * @param {string} wordbookId - ID of the wordbook to switch to
   * @returns {boolean} - Success status
   */
  const switchWordbook = (wordbookId) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return false
    }
    
    activeWordbookId.value = wordbookId
    localStorage.setItem(ACTIVE_WORDBOOK_KEY, wordbookId)
    return true
  }

  /**
   * Rename a wordbook
   * @param {string} wordbookId - ID of the wordbook to rename
   * @param {string} newName - New name for the wordbook
   * @returns {boolean} - Success status
   */
  const renameWordbook = (wordbookId, newName) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return false
    }
    
    if (!newName || newName.trim() === '') {
      console.error('Wordbook name cannot be empty')
      return false
    }
    
    wordbooks.value[wordbookId].name = newName.trim()
    wordbooks.value[wordbookId].updatedAt = Date.now()
    saveWordbooks()
    return true
  }

  /**
   * Delete a wordbook
   * @param {string} wordbookId - ID of the wordbook to delete
   * @returns {boolean} - Success status
   */
  const deleteWordbook = (wordbookId) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return false
    }
    
    // Prevent deleting the last wordbook
    if (Object.keys(wordbooks.value).length === 1) {
      console.warn('Cannot delete the last wordbook')
      return false
    }
    
    delete wordbooks.value[wordbookId]
    
    // If deleted wordbook was active, switch to another one
    if (activeWordbookId.value === wordbookId) {
      const remainingIds = Object.keys(wordbooks.value)
      activeWordbookId.value = remainingIds.length > 0 ? remainingIds[0] : null
    }
    
    saveWordbooks()
    return true
  }

  /**
   * Update wordbook statistics
   * @param {string} wordbookId - ID of the wordbook
   * @param {Object} stats - Statistics object {known, fuzzy, unknown}
   */
  const updateWordbookStats = (wordbookId, stats) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return
    }
    
    const wb = wordbooks.value[wordbookId]
    wb.stats = {
      total: wb.words.length,
      known: stats.known || 0,
      fuzzy: stats.fuzzy || 0,
      unknown: stats.unknown || 0,
      notReviewed: wb.words.length - (stats.known || 0) - (stats.fuzzy || 0) - (stats.unknown || 0)
    }
    wb.updatedAt = Date.now()
    saveWordbooks()
  }

  /**
   * Add words to a wordbook
   * @param {string} wordbookId - ID of the wordbook
   * @param {Array} newWords - Array of word objects to add
   * @returns {boolean} - Success status
   */
  const addWordsToWordbook = (wordbookId, newWords) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return false
    }
    
    wordbooks.value[wordbookId].words.push(...newWords)
    wordbooks.value[wordbookId].stats.total = wordbooks.value[wordbookId].words.length
    wordbooks.value[wordbookId].stats.notReviewed += newWords.length
    wordbooks.value[wordbookId].updatedAt = Date.now()
    saveWordbooks()
    return true
  }

  /**
   * Export wordbook to CSV format
   * @param {string} wordbookId - ID of the wordbook to export
   * @returns {string} - CSV formatted string
   */
  const exportWordbookToCSV = (wordbookId) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return ''
    }
    
    const wb = wordbooks.value[wordbookId]
    const header = 'word,definition,example\n'
    const rows = wb.words.map(w => 
      `"${w.word}","${w.definition}","${w.example || ''}"`
    ).join('\n')
    
    return header + rows
  }

  /**
   * Get wordbook by ID
   * @param {string} wordbookId - ID of the wordbook
   * @returns {Object|null} - Wordbook object or null
   */
  const getWordbookById = (wordbookId) => {
    return wordbooks.value[wordbookId] || null
  }

  /**
   * Clear all wordbook statistics (reset known/fuzzy/unknown to 0)
   * Used when user wants to reset their learning progress
   */
  const clearAllWordbookStats = () => {
    Object.keys(wordbooks.value).forEach(wordbookId => {
      const wb = wordbooks.value[wordbookId]
      wb.stats = {
        total: wb.words.length,
        known: 0,
        fuzzy: 0,
        unknown: 0,
        notReviewed: wb.words.length
      }
      wb.updatedAt = Date.now()
    })
    saveWordbooks()
    console.log('📚 All wordbook statistics cleared')
  }

  // Initialize
  loadWordbooks()

  return {
    wordbooks,
    activeWordbookId,
    getActiveWordbook,
    getWordbooksList,
    createWordbook,
    switchWordbook,
    renameWordbook,
    deleteWordbook,
    updateWordbookStats,
    addWordsToWordbook,
    exportWordbookToCSV,
    getWordbookById,
    clearAllWordbookStats,
    saveWordbooks
  }
}
