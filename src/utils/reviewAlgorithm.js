/**
 * Calculate priority for words based on their review status
 * Higher priority = shown first
 */
export function prioritizeCards(words, progressData) {
  return words.map(word => {
    const progress = progressData[word.id]
    let priority = 0
    
    if (!progress || progress.status === 'unknown') {
      // Unknown words get highest priority
      priority = 100
    } else if (progress.status === 'fuzzy') {
      // Fuzzy words get medium priority
      priority = 50
    } else if (progress.status === 'known') {
      // Known words get priority based on time decay
      const daysSince = (Date.now() - progress.lastReview) / 86400000
      priority = Math.min(daysSince * 5, 30)
    }
    
    return { ...word, priority }
  }).sort((a, b) => b.priority - a.priority)
}

/**
 * Filter words by status
 */
export function filterByStatus(words, progressData, status) {
  return words.filter(word => {
    const progress = progressData[word.id]
    if (!progress) return status === 'unknown'
    return progress.status === status
  })
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get review statistics
 */
export function getReviewStats(words, progressData) {
  const stats = {
    total: words.length,
    known: 0,
    fuzzy: 0,
    unknown: 0,
    neverReviewed: 0
  }
  
  words.forEach(word => {
    const progress = progressData[word.id]
    if (!progress) {
      stats.neverReviewed++
      stats.unknown++
    } else {
      stats[progress.status]++
    }
  })
  
  return stats
}
