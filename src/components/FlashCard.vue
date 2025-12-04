<template>
  <div class="w-full max-w-md px-4">
    <div 
      ref="cardRef"
      class="card-container"
      :style="cardStyle"
    >
      <div 
        class="card"
        :class="{ 'flipped': isFlipped }"
        @click="flip"
      >
        <!-- Front Side -->
        <div class="card-face card-front">
          <div class="text-center space-y-6">
            <h2 class="text-5xl font-bold text-gray-900 dark:text-white">
              {{ word?.word }}
            </h2>
            <p class="text-2xl text-gray-600 dark:text-gray-400">
              {{ word?.phonetic }}
            </p>
            
            <!-- TTS Button -->
            <TTSButton 
              v-if="word"
              :word="word.word"
              class="mx-auto"
            />
            
            <p class="text-sm text-gray-500 dark:text-gray-400">
              点击卡片或按空格键翻转
            </p>
          </div>
        </div>

        <!-- Back Side -->
        <div class="card-face card-back">
          <div class="text-center space-y-6">
            <h3 class="text-4xl font-bold text-gray-900 dark:text-gray-800">
              {{ word?.chinese }}
            </h3>
            
            <div v-if="word?.example" class="mt-6 p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <p class="text-sm text-gray-700 dark:text-gray-300 italic">
                "{{ word.example }}"
              </p>
            </div>
            
            <p class="text-sm text-gray-600 dark:text-gray-500">
              点击卡片返回正面
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between items-center mt-4 gap-4">
      <button
        @click.stop="$emit('prev')"
        class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title="上一张 (←)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm">上一张</span>
      </button>
      
      <button
        @click.stop="$emit('next')"
        class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title="下一张 (→)"
      >
        <span class="text-sm">下一张</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useCardDeck } from '@/composables/useCardDeck'
import { useTTS } from '@/composables/useTTS'
import { useStorage } from '@/composables/useStorage'
import TTSButton from './TTSButton.vue'

const props = defineProps({
  word: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['next', 'prev', 'mark-status'])

const { cardRef, isFlipped, cardStyle, flip, resetFlip, setSwipeCallbacks } = useCardDeck()
const { speak } = useTTS()
const { data } = useStorage()

// Set up swipe callbacks
setSwipeCallbacks(
  () => emit('next'),
  () => emit('prev')
)

// Auto-play pronunciation when word changes
watch(() => props.word, (newWord) => {
  if (newWord && data.value.settings.autoPlay) {
    speak(newWord.word)
  }
  resetFlip()
}, { immediate: true })

// Keyboard shortcuts
const handleKeyDown = (event) => {
  if (event.key === ' ') {
    event.preventDefault()
    flip()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.card-container {
  width: 100%;
  min-height: 400px;
  perspective: 1000px;
}

.card {
  position: relative;
  width: 100%;
  height: 400px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-front {
  background: white;
}

.dark .card-front {
  background: rgb(31, 41, 55);
}

.card-back {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: rotateY(180deg);
}

.dark .card-back {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}
</style>
