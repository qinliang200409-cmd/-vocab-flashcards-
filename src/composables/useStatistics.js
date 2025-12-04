import { ref, computed } from 'vue'

/**
 * 学习统计管理 Composable
 * 追踪学习会话、单词复习进度、学习时长等数据
 */
export function useStatistics() {
  // 当前会话状态
  const currentSession = ref(null)
  
  // 从 localStorage 加载统计数据
  const loadStatistics = () => {
    const defaultStats = {
      totalSessions: 0,           // 总会话数
      totalWordsReviewed: 0,      // 累计复习单词数
      totalStudyTime: 0,          // 累计学习时长(毫秒)
      dailyStats: {},             // 每日统计数据
      lastSessionDate: null       // 最后一次会话日期
    }
    
    try {
      const saved = localStorage.getItem('learning_statistics')
      return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats
    } catch (error) {
      console.error('Failed to load statistics:', error)
      return defaultStats
    }
  }
  
  const statistics = ref(loadStatistics())
  
  /**
   * 保存统计数据到 localStorage
   */
  const saveStatistics = () => {
    try {
      localStorage.setItem('learning_statistics', JSON.stringify(statistics.value))
      console.log('📊 Statistics saved:', statistics.value)
    } catch (error) {
      console.error('Failed to save statistics:', error)
    }
  }
  
  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   */
  const getTodayKey = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }
  
  /**
   * 开始新的学习会话
   */
  const startSession = () => {
    const sessionId = Date.now()
    currentSession.value = {
      id: sessionId,
      startTime: sessionId,
      wordsReviewed: 0,
      knownCount: 0,
      fuzzyCount: 0,
      unknownCount: 0
    }
    
    console.log('🎯 Session started:', currentSession.value)
    return sessionId
  }
  
  /**
   * 记录单词复习
   * @param {string} status - 'known' | 'fuzzy' | 'unknown'
   */
  const recordWordReview = (status) => {
    if (!currentSession.value) {
      console.warn('⚠️ No active session when recording word review')
      return
    }
    
    currentSession.value.wordsReviewed++
    
    if (status === 'known') {
      currentSession.value.knownCount++
    } else if (status === 'fuzzy') {
      currentSession.value.fuzzyCount++
    } else if (status === 'unknown') {
      currentSession.value.unknownCount++
    }
    
    console.log(`📝 Word review recorded: ${status}, total: ${currentSession.value.wordsReviewed}`)
  }
  
  /**
   * 结束当前会话
   */
  const endSession = () => {
    if (!currentSession.value) {
      console.warn('⚠️ No active session to end')
      return
    }
    
    const endTime = Date.now()
    const sessionDuration = endTime - currentSession.value.startTime
    const todayKey = getTodayKey()
    
    // 更新全局统计
    statistics.value.totalSessions++
    statistics.value.totalWordsReviewed += currentSession.value.wordsReviewed
    statistics.value.totalStudyTime += sessionDuration
    statistics.value.lastSessionDate = todayKey
    
    // 更新今日统计
    if (!statistics.value.dailyStats[todayKey]) {
      statistics.value.dailyStats[todayKey] = {
        sessions: 0,
        words: 0,
        time: 0,
        known: 0,
        fuzzy: 0,
        unknown: 0
      }
    }
    
    const todayStats = statistics.value.dailyStats[todayKey]
    todayStats.sessions++
    todayStats.words += currentSession.value.wordsReviewed
    todayStats.time += sessionDuration
    todayStats.known += currentSession.value.knownCount
    todayStats.fuzzy += currentSession.value.fuzzyCount
    todayStats.unknown += currentSession.value.unknownCount
    
    // 保存到 localStorage
    saveStatistics()
    
    console.log('✅ Session ended:', {
      duration: sessionDuration,
      wordsReviewed: currentSession.value.wordsReviewed,
      todayStats
    })
    
    // 清空当前会话
    const sessionSummary = { ...currentSession.value, duration: sessionDuration }
    currentSession.value = null
    
    return sessionSummary
  }
  
  /**
   * 获取今日统计
   */
  const getTodayStats = computed(() => {
    const todayKey = getTodayKey()
    return statistics.value.dailyStats[todayKey] || {
      sessions: 0,
      words: 0,
      time: 0,
      known: 0,
      fuzzy: 0,
      unknown: 0
    }
  })
  
  /**
   * 获取最近N天的统计数据
   * @param {number} days - 天数
   */
  const getRecentStats = (days = 7) => {
    const result = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      result.push({
        date: key,
        stats: statistics.value.dailyStats[key] || {
          sessions: 0,
          words: 0,
          time: 0,
          known: 0,
          fuzzy: 0,
          unknown: 0
        }
      })
    }
    
    return result
  }
  
  /**
   * 格式化时长
   * @param {number} ms - 毫秒数
   */
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`
    } else {
      return `${seconds}秒`
    }
  }
  
  /**
   * 清空所有统计数据
   */
  const clearStatistics = () => {
    statistics.value = {
      totalSessions: 0,
      totalWordsReviewed: 0,
      totalStudyTime: 0,
      dailyStats: {},
      lastSessionDate: null
    }
    currentSession.value = null
    saveStatistics()
    console.log('🗑️ Statistics cleared')
  }
  
  /**
   * 计算平均每日学习数据
   */
  const getAverageDaily = computed(() => {
    const days = Object.keys(statistics.value.dailyStats).length
    if (days === 0) return { words: 0, time: 0, sessions: 0 }
    
    return {
      words: Math.round(statistics.value.totalWordsReviewed / days),
      time: Math.round(statistics.value.totalStudyTime / days),
      sessions: Math.round(statistics.value.totalSessions / days)
    }
  })
  
  return {
    // 状态
    statistics,
    currentSession,
    
    // 会话管理
    startSession,
    recordWordReview,
    endSession,
    
    // 数据获取
    getTodayStats,
    getRecentStats,
    getAverageDaily,
    
    // 工具函数
    formatDuration,
    clearStatistics,
    saveStatistics
  }
}
