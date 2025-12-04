<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="flex items-center mb-6">
        <button
          @click="goBack"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← 返回
        </button>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white ml-4">
          设置
        </h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading">
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="stats" class="mt-6" />
        <div class="mt-6">
          <LoadingSkeleton type="card" />
        </div>
      </div>

      <!-- Loaded Content -->
      <template v-else>
        <!-- Statistics Charts -->
        <StatisticsChart
          :chart-data="recentStats"
          :known-count="getTodayStats.known"
          :fuzzy-count="getTodayStats.fuzzy"
          :unknown-count="getTodayStats.unknown"
          :daily-stats="statistics.dailyStats"
        />

        <!-- Learning Statistics Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 学习统计</h2>
        
        <!-- Overall Stats -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ statistics.totalSessions }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">总会话数</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ statistics.totalWordsReviewed }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">累计复习</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ formatDuration(statistics.totalStudyTime) }}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">学习时长</div>
          </div>
        </div>

        <!-- Today's Stats -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">📅 今日数据</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">会话次数:</span>
              <span class="font-semibold">{{ getTodayStats.sessions }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">复习单词:</span>
              <span class="font-semibold">{{ getTodayStats.words }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">学习时长:</span>
              <span class="font-semibold">{{ formatDuration(getTodayStats.time) }}</span>
            </div>
            <div class="flex justify-between text-known">
              <span>认识:</span>
              <span class="font-semibold">{{ getTodayStats.known }}</span>
            </div>
            <div class="flex justify-between text-fuzzy">
              <span>模糊:</span>
              <span class="font-semibold">{{ getTodayStats.fuzzy }}</span>
            </div>
            <div class="flex justify-between text-unknown">
              <span>不认识:</span>
              <span class="font-semibold">{{ getTodayStats.unknown }}</span>
            </div>
          </div>
        </div>

        <!-- Recent 7 Days -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">📈 近7天概览</h3>
          <div class="space-y-2">
            <div 
              v-for="day in recentStats" 
              :key="day.date"
              class="flex items-center justify-between text-xs py-1"
            >
              <span class="text-gray-600 dark:text-gray-400 w-20">{{ day.date }}</span>
              <div class="flex-1 flex items-center gap-2">
                <div class="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-blue-500 rounded-full"
                    :style="{ width: `${Math.min((day.stats.words / 50) * 100, 100)}%` }"
                  ></div>
                </div>
                <span class="font-semibold w-16 text-right">{{ day.stats.words }} 词</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Average Stats -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">📊 日均数据</h3>
          <div class="grid grid-cols-3 gap-2 text-xs text-center">
            <div>
              <div class="font-bold text-blue-600 dark:text-blue-400">
                {{ getAverageDaily.words }}
              </div>
              <div class="text-gray-600 dark:text-gray-400">单词/天</div>
            </div>
            <div>
              <div class="font-bold text-green-600 dark:text-green-400">
                {{ formatDuration(getAverageDaily.time) }}
              </div>
              <div class="text-gray-600 dark:text-gray-400">时长/天</div>
            </div>
            <div>
              <div class="font-bold text-purple-600 dark:text-purple-400">
                {{ getAverageDaily.sessions }}
              </div>
              <div class="text-gray-600 dark:text-gray-400">会话/天</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
        <!-- Dark Mode -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              深色模式
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              切换到深色主题
            </p>
          </div>
          <button
            @click="toggleDarkMode"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="settings.darkMode ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Auto Play -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              自动发音
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              切换卡片时自动播放发音
            </p>
          </div>
          <button
            @click="toggleAutoPlay"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="settings.autoPlay ? 'bg-blue-600' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="settings.autoPlay ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Clear Data -->
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="confirmClearData"
            class="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            清除所有学习数据
          </button>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            此操作将删除所有复习记录和进度
          </p>
        </div>
        </div>

        <!-- About -->
        <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
        <h3 class="font-semibold mb-2">关于</h3>
        <p class="mb-2">版本：1.0.0</p>
        <p class="text-xs">
          基于Vue 3构建的英语单词复习工具，支持滑动交互、状态标记及智能复习算法。
        </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/composables/useStorage'
import { useStatistics } from '@/composables/useStatistics'
import { useWordbook } from '@/composables/useWordbook'
import StatisticsChart from '@/components/StatisticsChart.vue'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

const router = useRouter()
const { data, updateSettings, clearData } = useStorage()
const { 
  statistics, 
  getTodayStats, 
  getRecentStats, 
  formatDuration, 
  clearStatistics,
  getAverageDaily 
} = useStatistics()
const { clearAllWordbookStats } = useWordbook()

const settings = ref({
  darkMode: false,
  autoPlay: true
})

const isLoading = ref(true)

onMounted(() => {
  // Simulate loading time for better UX (1.5 seconds to make the skeleton visible)
  setTimeout(() => {
    settings.value = { ...data.value.settings }
    isLoading.value = false
  }, 1500)
})

// Computed property for recent 7 days stats
const recentStats = computed(() => getRecentStats(7))

const toggleDarkMode = () => {
  settings.value.darkMode = !settings.value.darkMode
  updateSettings({ darkMode: settings.value.darkMode })
  
  if (settings.value.darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleAutoPlay = () => {
  settings.value.autoPlay = !settings.value.autoPlay
  updateSettings({ autoPlay: settings.value.autoPlay })
}

const confirmClearData = () => {
  if (confirm('确定要清除所有学习数据吗？此操作不可恢复。')) {
    clearData()
    clearStatistics()
    clearAllWordbookStats()
    alert('学习数据和统计已全部清除')
  }
}

const goBack = () => {
  router.push('/')
}
</script>
