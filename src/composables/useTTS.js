import { ref } from 'vue'

// Shared state across all useTTS instances (singleton pattern)
const isSpeaking = ref(false)
const isSupported = ref('speechSynthesis' in window)
let speakTimeout = null
let currentUtterance = null

/**
 * Detect language from text content
 * @param {string} text - Text to analyze
 * @returns {string} - Language code (e.g., 'ja-JP', 'zh-CN', 'en-US')
 */
function detectLanguage(text) {
  if (!text) return 'en-US'
  
  // Japanese: Hiragana, Katakana, Kanji (CJK Unified Ideographs)
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/
  if (japaneseRegex.test(text)) {
    return 'ja-JP'
  }
  
  // Chinese: CJK characters (but not Japanese kana)
  const chineseRegex = /[\u4E00-\u9FFF]/
  if (chineseRegex.test(text) && !japaneseRegex.test(text)) {
    return 'zh-CN'
  }
  
  // Korean: Hangul
  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/
  if (koreanRegex.test(text)) {
    return 'ko-KR'
  }
  
  // Default to English for Latin characters
  return 'en-US'
}

export function useTTS() {
  const speak = (text, options = {}) => {
    if (!isSupported.value) {
      console.warn('Speech Synthesis API is not supported in this browser')
      return
    }

    // Clear any pending speech
    if (speakTimeout) {
      clearTimeout(speakTimeout)
      speakTimeout = null
    }

    // Cancel any ongoing speech safely
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel()
      }
    } catch (error) {
      console.warn('Error cancelling speech:', error)
    }

    // Reset state immediately
    isSpeaking.value = false

    // Debounce speech to avoid rapid-fire calls
    speakTimeout = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        currentUtterance = utterance
        
        // Auto-detect language if not specified
        const detectedLang = detectLanguage(text)
        utterance.lang = options.lang || detectedLang
        
        // Adjust rate based on language (Japanese is typically spoken slower)
        let defaultRate = 0.9
        if (utterance.lang.startsWith('ja')) {
          defaultRate = 0.8
        } else if (utterance.lang.startsWith('zh')) {
          defaultRate = 0.85
        }
        
        utterance.rate = options.rate || defaultRate
        utterance.pitch = options.pitch || 1
        utterance.volume = options.volume || 1

        utterance.onstart = () => {
          if (currentUtterance === utterance) {
            isSpeaking.value = true
          }
        }

        utterance.onend = () => {
          if (currentUtterance === utterance) {
            isSpeaking.value = false
            currentUtterance = null
          }
        }

        utterance.onerror = (event) => {
          // Silently handle 'interrupted' errors which are expected during rapid navigation
          if (event.error !== 'interrupted' && event.error !== 'cancelled') {
            console.warn('Speech synthesis error:', event.error)
          }
          if (currentUtterance === utterance) {
            isSpeaking.value = false
            currentUtterance = null
          }
        }

        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.warn('Error speaking:', error)
        isSpeaking.value = false
        currentUtterance = null
      }
    }, 100) // 100ms debounce to avoid rapid-fire
  }

  const stop = () => {
    if (isSupported.value) {
      window.speechSynthesis.cancel()
      isSpeaking.value = false
    }
  }

  const pause = () => {
    if (isSupported.value) {
      window.speechSynthesis.pause()
    }
  }

  const resume = () => {
    if (isSupported.value) {
      window.speechSynthesis.resume()
    }
  }

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  }
}
