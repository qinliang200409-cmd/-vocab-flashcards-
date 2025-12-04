<template>
  <div class="space-y-6">
    <!-- 学习趋势折线图 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📈 学习趋势 (近7天)
      </h3>
      
      <div class="relative h-48">
        <!-- Y轴标签 -->
        <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
          <span>{{ maxValue }}</span>
          <span>{{ Math.floor(maxValue / 2) }}</span>
          <span>0</span>
        </div>
        
        <!-- 图表区域 -->
        <div class="ml-8 h-full relative">
          <!-- 网格线 -->
          <div class="absolute inset-0 flex flex-col justify-between">
            <div class="border-t border-gray-200 dark:border-gray-700"></div>
            <div class="border-t border-gray-200 dark:border-gray-700"></div>
            <div class="border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          
          <!-- SVG 折线图 -->
          <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <!-- 渐变定义 -->
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(59, 130, 246);stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:rgb(59, 130, 246);stop-opacity:0" />
              </linearGradient>
            </defs>
            
            <!-- 填充区域 -->
            <polygon
              :points="areaPoints"
              fill="url(#lineGradient)"
            />
            
            <!-- 折线 -->
            <polyline
              :points="linePoints"
              fill="none"
              stroke="rgb(59, 130, 246)"
              stroke-width="0.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            
            <!-- 数据点 -->
            <circle
              v-for="(point, index) in points"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="1.5"
              fill="rgb(59, 130, 246)"
              class="cursor-pointer hover:r-2 transition-all"
            />
          </svg>
          
          <!-- X轴标签 -->
          <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span v-for="day in chartData" :key="day.date">
              {{ formatDate(day.date) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 掌握率分布饼图 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🎯 单词掌握分布
      </h3>
      
      <div class="flex items-center justify-center gap-8">
        <!-- 饼图 -->
        <div class="relative w-32 h-32">
          <svg viewBox="0 0 100 100" class="transform -rotate-90">
            <!-- 背景圆 -->
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="20"
              class="dark:stroke-gray-700"
            />
            
            <!-- 认识 (绿色) -->
            <circle
              v-if="knownPercentage > 0"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#10b981"
              stroke-width="20"
              :stroke-dasharray="`${knownPercentage * 2.51} 251`"
              :stroke-dashoffset="0"
              class="transition-all duration-500"
            />
            
            <!-- 模糊 (黄色) -->
            <circle
              v-if="fuzzyPercentage > 0"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f59e0b"
              stroke-width="20"
              :stroke-dasharray="`${fuzzyPercentage * 2.51} 251`"
              :stroke-dashoffset="`-${knownPercentage * 2.51}`"
              class="transition-all duration-500"
            />
            
            <!-- 不认识 (红色) -->
            <circle
              v-if="unknownPercentage > 0"
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#ef4444"
              stroke-width="20"
              :stroke-dasharray="`${unknownPercentage * 2.51} 251`"
              :stroke-dashoffset="`-${(knownPercentage + fuzzyPercentage) * 2.51}`"
              class="transition-all duration-500"
            />
          </svg>
          
          <!-- 中心文字 -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ totalWords }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">总计</div>
          </div>
        </div>
        
        <!-- 图例 -->
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded bg-known"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              认识: {{ knownCount }} ({{ knownPercentage }}%)
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded bg-fuzzy"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              模糊: {{ fuzzyCount }} ({{ fuzzyPercentage }}%)
            </span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded bg-unknown"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              不认识: {{ unknownCount }} ({{ unknownPercentage }}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习日历热力图 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📅 学习日历 (近30天)
      </h3>
      
      <div class="grid grid-cols-10 gap-1">
        <div
          v-for="(day, index) in last30Days"
          :key="index"
          :class="getHeatmapColor(day.count)"
          class="aspect-square rounded transition-all hover:scale-110 cursor-pointer"
          :title="`${day.date}: ${day.count} 个单词`"
        >
        </div>
      </div>
      
      <!-- 热力图图例 -->
      <div class="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>少</span>
        <div class="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900"></div>
        <div class="w-3 h-3 rounded bg-blue-400 dark:bg-blue-700"></div>
        <div class="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500"></div>
        <span>多</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chartData: {
    type: Array,
    required: true,
    default: () => []
  },
  knownCount: {
    type: Number,
    default: 0
  },
  fuzzyCount: {
    type: Number,
    default: 0
  },
  unknownCount: {
    type: Number,
    default: 0
  },
  dailyStats: {
    type: Object,
    default: () => ({})
  }
})

// 总单词数
const totalWords = computed(() => {
  return props.knownCount + props.fuzzyCount + props.unknownCount
})

// 百分比计算
const knownPercentage = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((props.knownCount / totalWords.value) * 100)
})

const fuzzyPercentage = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((props.fuzzyCount / totalWords.value) * 100)
})

const unknownPercentage = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((props.unknownCount / totalWords.value) * 100)
})

// 图表数据处理
const maxValue = computed(() => {
  const max = Math.max(...props.chartData.map(d => d.stats.words), 10)
  return Math.ceil(max / 10) * 10 // 向上取整到10的倍数
})

// 计算SVG点坐标
const points = computed(() => {
  const data = props.chartData
  if (data.length === 0) return []
  
  const width = 100
  const height = 100
  const pointsArray = []
  
  data.forEach((day, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((day.stats.words / maxValue.value) * height)
    pointsArray.push({ x, y })
  })
  
  return pointsArray
})

// 折线points字符串
const linePoints = computed(() => {
  return points.value.map(p => `${p.x},${p.y}`).join(' ')
})

// 填充区域points字符串
const areaPoints = computed(() => {
  if (points.value.length === 0) return ''
  const firstPoint = points.value[0]
  const lastPoint = points.value[points.value.length - 1]
  return `${firstPoint.x},100 ${linePoints.value} ${lastPoint.x},100`
})

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 近30天数据
const last30Days = computed(() => {
  const result = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const dayStats = props.dailyStats[key]
    result.push({
      date: key,
      count: dayStats ? dayStats.words : 0
    })
  }
  
  return result
})

// 热力图颜色
const getHeatmapColor = (count) => {
  if (count === 0) return 'bg-gray-200 dark:bg-gray-700'
  if (count < 10) return 'bg-blue-200 dark:bg-blue-900'
  if (count < 30) return 'bg-blue-400 dark:bg-blue-700'
  return 'bg-blue-600 dark:bg-blue-500'
}
</script>
