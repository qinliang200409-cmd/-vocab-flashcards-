import { ref, computed } from 'vue'
import { useSwipe } from '@vueuse/core'

export function useCardDeck() {
  const cardRef = ref(null)
  const isFlipped = ref(false)
  const swipeOffset = ref(0)
  
  // Swipe configuration
  const { lengthX, direction } = useSwipe(cardRef, {
    threshold: 50,
    onSwipe: () => {
      swipeOffset.value = lengthX.value
    },
    onSwipeEnd: (e, dir) => {
      swipeOffset.value = 0
      
      if (dir === 'left' && onSwipeLeft.value) {
        onSwipeLeft.value()
      } else if (dir === 'right' && onSwipeRight.value) {
        onSwipeRight.value()
      }
    }
  })
  
  // Callbacks
  const onSwipeLeft = ref(() => {})
  const onSwipeRight = ref(() => {})
  
  // Card style based on swipe
  const cardStyle = computed(() => {
    const offset = swipeOffset.value
    const rotation = offset * 0.05
    
    return {
      transform: `translateX(${offset}px) rotate(${rotation}deg)`,
      transition: swipeOffset.value === 0 ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
    }
  })
  
  // Flip card
  const flip = () => {
    isFlipped.value = !isFlipped.value
  }
  
  // Reset flip state
  const resetFlip = () => {
    isFlipped.value = false
  }
  
  // Set swipe callbacks
  const setSwipeCallbacks = (left, right) => {
    onSwipeLeft.value = left
    onSwipeRight.value = right
  }
  
  return {
    cardRef,
    isFlipped,
    cardStyle,
    flip,
    resetFlip,
    setSwipeCallbacks
  }
}
