import { ref, computed } from 'vue'
import { useStorage } from './useStorage'
import { useCSVImport } from './useCSVImport'

const WORDBOOKS_KEY = 'vocab_wordbooks'
const ACTIVE_WORDBOOK_KEY = 'vocab_active_wordbook'

const MAX_WORDBOOKS = 50
const MAX_WORDS_PER_BOOK = 10000

/**
 * Composable for managing multiple wordbooks
 * Supports creating, switching, renaming, and deleting wordbooks
 */
export function useWordbook() {
  const { data, saveData } = useStorage()
  const { importFromText } = useCSVImport()
  
  // Wordbooks structure: { id: { name, words: [], createdAt, updatedAt, stats: {} } }
  const wordbooks = ref({})
  const activeWordbookId = ref(null)
  
  // Runtime storage for external wordbooks (not saved to localStorage)
  const runtimeWords = ref([])
  const isLoading = ref(false)

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
        // Trigger load if external
        if (wordbooks.value[activeId].isExternal) {
          switchWordbook(activeId)
        }
      } else if (Object.keys(wordbooks.value).length > 0) {
        // If no active wordbook, set the first one as active
        const firstId = Object.keys(wordbooks.value)[0]
        activeWordbookId.value = firstId
        if (wordbooks.value[firstId].isExternal) {
          switchWordbook(firstId)
        }
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
      // Create a copy of wordbooks for saving, removing words from external books
      const wordbooksToSave = {}
      for (const [id, wb] of Object.entries(wordbooks.value)) {
        if (wb.isExternal) {
          // For external wordbooks, don't save the words array to localStorage
          const { words, ...rest } = wb
          wordbooksToSave[id] = { ...rest, words: [] }
        } else {
          wordbooksToSave[id] = wb
        }
      }

      localStorage.setItem(WORDBOOKS_KEY, JSON.stringify(wordbooksToSave))
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
    // Check limits
    if (Object.keys(wordbooks.value).length >= MAX_WORDBOOKS) {
      console.warn(`Cannot create wordbook: limit of ${MAX_WORDBOOKS} reached`)
      throw new Error(`已达到最大词库数量限制 (${MAX_WORDBOOKS})`)
    }

    if (words.length > MAX_WORDS_PER_BOOK) {
      console.warn(`Cannot create wordbook: limit of ${MAX_WORDS_PER_BOOK} words reached`)
      throw new Error(`单个词库单词数量不能超过 ${MAX_WORDS_PER_BOOK}`)
    }

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
    const wb = wordbooks.value[activeWordbookId.value]
    
    // If it's an external wordbook, merge with runtime words
    if (wb.isExternal) {
      return { 
        ...wb, 
        words: runtimeWords.value.length > 0 ? runtimeWords.value : wb.words 
      }
    }
    
    return wb
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
  const switchWordbook = async (wordbookId) => {
    if (!wordbooks.value[wordbookId]) {
      console.error(`Wordbook ${wordbookId} not found`)
      return false
    }
    
    const wb = wordbooks.value[wordbookId]
    activeWordbookId.value = wordbookId
    localStorage.setItem(ACTIVE_WORDBOOK_KEY, wordbookId)

    // Load words if external and not loaded
    if (wb.isExternal && wb.sourceUrl) {
      isLoading.value = true
      try {
        const response = await fetch(wb.sourceUrl)
        if (!response.ok) throw new Error('Failed to fetch dictionary file')
        
        let words = []
        if (wb.sourceUrl.toLowerCase().endsWith('.json')) {
          // Universal JSON parsing logic
          const rawData = await response.json()
          if (Array.isArray(rawData)) {
            words = rawData.map((item, index) => {
              // Determine word field
              const word = item.name || item.word || item.term || ''
              
              // Determine phonetic field (support multiple formats)
              let phonetic = ''
              if (item.phonetic) {
                phonetic = item.phonetic
              } else if (item.usphone || item.ukphone) {
                phonetic = item.usphone ? `/${item.usphone}/` : `/${item.ukphone}/`
              } else if (item.pronunciation) {
                phonetic = item.pronunciation
              } else if (item.notation) {
                phonetic = item.notation // For Japanese, Korean, etc.
              }
              
              // Determine Chinese/translation field
              let chinese = ''
              if (item.trans) {
                chinese = Array.isArray(item.trans) ? item.trans.join('; ') : item.trans
              } else if (item.chinese) {
                chinese = item.chinese
              } else if (item.definition) {
                chinese = item.definition
              } else if (item.meaning) {
                chinese = item.meaning
              } else if (item.translation) {
                chinese = item.translation
              }
              
              // Determine example field
              const example = item.example || item.sentence || item.usage || ''
              
              return {
                id: `${word}-${index}`,
                word: word,
                phonetic: phonetic,
                chinese: chinese,
                example: example
              }
            }).filter(w => w.word && w.chinese) // Filter valid words with both word and meaning
          }
        } else {
          // Default to CSV
          const csvText = await response.text()
          words = await importFromText(csvText)
        }

        runtimeWords.value = words
        
        // Update total stats just in case
        if (wb.stats.total !== words.length) {
          wb.stats.total = words.length
          wb.updatedAt = Date.now()
          saveWordbooks()
        }
      } catch (err) {
        console.error('Failed to load external words:', err)
        alert('无法加载词库文件：' + err.message)
      } finally {
        isLoading.value = false
      }
    } else {
      runtimeWords.value = []
    }
    
    return true
  }

  /**
   * Create an external wordbook reference
   */
  const createExternalWordbook = (name, sourceUrl, count) => {
    // Check limits
    if (Object.keys(wordbooks.value).length >= MAX_WORDBOOKS) {
      throw new Error(`已达到最大词库数量限制 (${MAX_WORDBOOKS})`)
    }

    const id = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    wordbooks.value[id] = {
      id,
      name,
      words: [], // Empty for storage
      isExternal: true,
      sourceUrl,
      createdAt: now,
      updatedAt: now,
      stats: {
        total: count || 0,
        known: 0,
        fuzzy: 0,
        unknown: 0,
        notReviewed: count || 0
      }
    }
    
    saveWordbooks()
    return id
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
    createExternalWordbook,
    switchWordbook,
    renameWordbook,
    isLoading,
    deleteWordbook,
    updateWordbookStats,
    addWordsToWordbook,
    exportWordbookToCSV,
    getWordbookById,
    clearAllWordbookStats,
    saveWordbooks
  }
}
