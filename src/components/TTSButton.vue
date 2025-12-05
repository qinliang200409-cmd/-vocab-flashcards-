<template>
  <button
    @click.stop="playSound"
    :disabled="!isSupported || isSpeaking"
    class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-110 active:scale-95"
    :class="{ 'animate-pulse': isSpeaking }"
    :title="isSpeaking ? '正在播放...' : (isSupported ? '点击发音' : '浏览器不支持语音合成')"
  >
    <svg
      v-if="!isSpeaking"
      class="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
    <svg
      v-else
      class="w-6 h-6"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
    </svg>
  </button>
</template>

<script setup>
import { useTTS } from '@/composables/useTTS'

const props = defineProps({
  word: {
    type: String,
    required: true
  },
  lang: {
    type: String,
    default: 'en-US'
  }
})

const { speak, isSpeaking, isSupported } = useTTS()

const playSound = () => {
  speak(props.word, { lang: props.lang })
}
</script>
