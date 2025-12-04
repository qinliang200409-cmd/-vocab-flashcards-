import { ref } from 'vue'

export function useTTS() {
  const isSpeaking = ref(false)
  const isSupported = ref('speechSynthesis' in window)
  let speakTimeout = null
  let currentUtterance = null

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
        
        // Default options
        utterance.lang = options.lang || 'en-US'
        utterance.rate = options.rate || 0.9
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
