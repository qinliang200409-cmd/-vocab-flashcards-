import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useReviewState } from '@/composables/useReviewState'

// Mock useStorage
vi.mock('@/composables/useStorage', () => ({
  useStorage: () => ({
    updateWordStatus: vi.fn(),
    getWordStatus: vi.fn(() => null)
  })
}))

describe('useReviewState', () => {
  let reviewState
  const testWords = [
    { id: '1', word: 'apple', phonetic: '/ˈæpl/', chinese: '苹果', example: 'An apple a day.' },
    { id: '2', word: 'banana', phonetic: '/bəˈnænə/', chinese: '香蕉', example: 'I like bananas.' },
    { id: '3', word: 'cherry', phonetic: '/ˈtʃeri/', chinese: '樱桃', example: 'Cherry pie is delicious.' }
  ]

  beforeEach(() => {
    reviewState = useReviewState(testWords)
  })

  describe('initialization', () => {
    it('should initialize with provided words', () => {
      expect(reviewState.words.value.length).toBe(3)
    })

    it('should set current index to 0', () => {
      expect(reviewState.currentIndex.value).toBe(0)
    })

    it('should return first word as current word', () => {
      expect(reviewState.currentWord.value).toBeDefined()
      expect(reviewState.currentWord.value.word).toBe('apple')
    })

    it('should not be complete initially', () => {
      expect(reviewState.isComplete.value).toBe(false)
    })

    it('should have empty review history', () => {
      expect(reviewState.reviewHistory.value.length).toBe(0)
    })
  })

  describe('navigation', () => {
    it('should move to next word', () => {
      reviewState.nextWord()
      expect(reviewState.currentIndex.value).toBe(1)
      expect(reviewState.currentWord.value.word).toBe('banana')
    })

    it('should move to previous word', () => {
      reviewState.nextWord()
      reviewState.prevWord()
      expect(reviewState.currentIndex.value).toBe(0)
      expect(reviewState.currentWord.value.word).toBe('apple')
    })

    it('should not go below index 0', () => {
      reviewState.prevWord()
      expect(reviewState.currentIndex.value).toBe(0)
    })

    it('should mark as complete when reaching the end', () => {
      reviewState.nextWord() // index 1
      reviewState.nextWord() // index 2
      reviewState.nextWord() // index 3 (complete)
      expect(reviewState.isComplete.value).toBe(true)
      expect(reviewState.currentWord.value).toBeNull()
    })
  })

  describe('status marking', () => {
    it('should mark word as known and auto-advance', () => {
      reviewState.markStatus('known')
      expect(reviewState.reviewHistory.value.length).toBe(1)
      expect(reviewState.reviewHistory.value[0].status).toBe('known')
      expect(reviewState.currentIndex.value).toBe(1)
    })

    it('should mark word as fuzzy', () => {
      reviewState.markStatus('fuzzy')
      expect(reviewState.reviewHistory.value[0].status).toBe('fuzzy')
    })

    it('should mark word as unknown', () => {
      reviewState.markStatus('unknown')
      expect(reviewState.reviewHistory.value[0].status).toBe('unknown')
    })
  })

  describe('statistics', () => {
    it('should track known count', () => {
      reviewState.markStatus('known')
      reviewState.markStatus('known')
      expect(reviewState.stats.value.known).toBe(2)
    })

    it('should track fuzzy count', () => {
      reviewState.markStatus('fuzzy')
      expect(reviewState.stats.value.fuzzy).toBe(1)
    })

    it('should track unknown count', () => {
      reviewState.markStatus('unknown')
      reviewState.markStatus('unknown')
      expect(reviewState.stats.value.unknown).toBe(2)
    })

    it('should calculate progress percentage correctly', () => {
      expect(reviewState.stats.value.progress).toBe(0)
      reviewState.markStatus('known')
      expect(reviewState.stats.value.progress).toBeCloseTo(33.33, 1)
    })

    it('should track reviewed and remaining counts', () => {
      reviewState.markStatus('known')
      expect(reviewState.stats.value.reviewed).toBe(1)
      expect(reviewState.stats.value.remaining).toBe(2)
    })

    it('should track total count', () => {
      expect(reviewState.stats.value.total).toBe(3)
    })
  })

  describe('undo functionality', () => {
    it('should undo last action', () => {
      reviewState.markStatus('known')
      const indexAfterMark = reviewState.currentIndex.value
      
      reviewState.undo()
      
      expect(reviewState.currentIndex.value).toBe(indexAfterMark - 1)
      expect(reviewState.reviewHistory.value.length).toBe(0)
    })

    it('should not fail when undoing with empty history', () => {
      expect(() => reviewState.undo()).not.toThrow()
      expect(reviewState.currentIndex.value).toBe(0)
    })
  })

  describe('reset functionality', () => {
    it('should reset to initial state', () => {
      reviewState.markStatus('known')
      reviewState.markStatus('fuzzy')
      
      reviewState.reset()
      
      expect(reviewState.currentIndex.value).toBe(0)
      expect(reviewState.reviewHistory.value.length).toBe(0)
    })
  })

  describe('setWords functionality', () => {
    it('should update words and reset state', () => {
      const newWords = [
        { id: '4', word: 'date', phonetic: '/deɪt/', chinese: '日期', example: 'What is the date?' }
      ]
      
      reviewState.setWords(newWords)
      
      expect(reviewState.words.value.length).toBe(1)
      expect(reviewState.currentIndex.value).toBe(0)
      expect(reviewState.reviewHistory.value.length).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty word list', () => {
      const emptyReview = useReviewState([])
      expect(emptyReview.currentWord.value).toBeNull()
      expect(emptyReview.isComplete.value).toBe(true)
      expect(emptyReview.stats.value.total).toBe(0)
    })

    it('should handle single word', () => {
      const singleWordReview = useReviewState([testWords[0]])
      expect(singleWordReview.words.value.length).toBe(1)
      singleWordReview.markStatus('known')
      expect(singleWordReview.isComplete.value).toBe(true)
    })

    it('should not mark status when no current word', () => {
      // Move past the end
      reviewState.nextWord()
      reviewState.nextWord()
      reviewState.nextWord()
      
      const historyBefore = reviewState.reviewHistory.value.length
      reviewState.markStatus('known')
      
      // Should not add to history when no current word
      expect(reviewState.reviewHistory.value.length).toBe(historyBefore)
    })
  })
})
