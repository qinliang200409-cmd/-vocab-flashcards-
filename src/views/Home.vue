<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <!-- Review Amount Selector Modal -->
    <div v-if="showAmountSelector" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <ReviewAmountSelector
        :max-words="activeWordbook?.stats?.total || 0"
        @confirm="startReviewWithAmount"
        @cancel="showAmountSelector = false"
      />
    </div>

    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center mb-4">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          单词快速复习
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          通过卡片交互强化记忆
        </p>
      </div>

      <!-- Active Wordbook Card -->
      <div v-if="activeWordbook" class="bg-blue-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.01] cursor-pointer" @click="startReview">
        <div class="absolute -top-4 -right-4 p-4 opacity-10 rotate-12">
          <span class="text-9xl">📚</span>
        </div>
        <div class="relative z-10">
            <div class="text-blue-100 text-sm font-medium mb-1 flex justify-between items-center">
              <span>当前正在学习</span>
              <span class="bg-blue-500/30 px-2 py-0.5 rounded text-xs">点击继续</span>
            </div>
            <h2 class="text-2xl font-bold mb-4 truncate pr-8">{{ activeWordbook.name }}</h2>
            
            <div class="flex items-end gap-4 mb-2">
                 <div class="text-4xl font-bold">{{ calculateProgress(activeWordbook) }}%</div>
                 <div class="text-blue-100 mb-1.5 text-sm">已掌握 ({{ activeWordbook.stats.known }}/{{ activeWordbook.stats.total }})</div>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-blue-900/30 rounded-full h-2 mb-4 overflow-hidden backdrop-blur-sm">
                <div class="bg-white h-full rounded-full transition-all duration-500" :style="{ width: `${calculateProgress(activeWordbook)}%` }"></div>
            </div>
            
            <div class="flex justify-between text-xs text-blue-100 font-medium">
                <span>待复习: {{ activeWordbook.stats.notReviewed }}</span>
                <span>上次学习: {{ formatDate(activeWordbook.updatedAt) }}</span>
            </div>
        </div>
      </div>
      
      <!-- No Active Wordbook State -->
       <div v-else class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div class="text-4xl mb-3">📭</div>
          <p class="text-gray-500 dark:text-gray-400 mb-4 font-medium">还没有选择词库</p>
          <button @click="router.push('/wordbooks')" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            创建或选择词库
          </button>
       </div>

      <!-- Main Actions -->
      <div class="space-y-3">
         <!-- Start Review Button with Amount Selection -->
         <button 
            v-if="activeWordbook"
            @click="showAmountSelector = true"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
         >
            <span>▶️</span> 开始复习
         </button>
         
         <!-- Random Review -->
         <div class="grid grid-cols-2 gap-3">
             <button
              @click="reviewRandomWords(50)"
              class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              :disabled="!activeWordbook"
            >
              🎲 随机50词
            </button>
            <button
              @click="reviewRandomWords(100)"
              class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              :disabled="!activeWordbook"
            >
              🎲 随机100词
            </button>
         </div>
      </div>
      
      <!-- Secondary Actions Grid -->
      <div class="grid grid-cols-2 gap-3">
          <button
            @click="router.push('/wordbooks')"
            class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>📚</span> 词库管理
          </button>
          
          <button
            @click="router.push('/settings')"
             class="px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
             <span>⚙️</span> 设置
          </button>
      </div>

       <!-- Import/Sample (Collapsible) -->
       <div class="text-center pt-4">
            <button 
              @click="showImportOptions = !showImportOptions" 
              class="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
                {{ showImportOptions ? '收起更多选项' : '更多选项 (导入/示例)' }}
                <span :class="{ 'rotate-180': showImportOptions }" class="transform transition-transform text-xs">▼</span>
            </button>
            
            <div v-show="showImportOptions" class="mt-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 transition-all">
                 <label 
                    class="block w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm"
                  >
                    📁 导入CSV文件
                    <input type="file" accept=".csv" class="hidden" @change="handleFileUpload" />
                  </label>
                  
                  <button
                    @click="useSampleData"
                    class="w-full py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm"
                  >
                    📚 创建示例词库
                  </button>
            </div>
       </div>

      <!-- Loading/Error Feedback -->
       <div v-if="isLoading" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl flex flex-col items-center gap-3 shadow-2xl min-w-[200px]">
                 <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                 <div class="text-center">
                    <p class="text-gray-900 dark:text-white font-medium">处理中...</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ progress }}%</p>
                 </div>
            </div>
       </div>
       
       <div v-if="error" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border-l-4 border-red-500 text-gray-700 dark:text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 min-w-[300px] animate-bounce-in">
          <div class="text-red-500 text-xl">❌</div>
          <div>
            <div class="font-bold">操作失败</div>
            <div class="text-sm opacity-90">{{ error }}</div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCSVImport } from '@/composables/useCSVImport'
import { useWordbook } from '@/composables/useWordbook'
import { prioritizeCards } from '@/utils/reviewAlgorithm'
import { useStorage } from '@/composables/useStorage'
import ReviewAmountSelector from '@/components/ReviewAmountSelector.vue'

const router = useRouter()
const { importFromFile, importFromText, isLoading, error, progress } = useCSVImport()
const { getActiveWordbook, getWordbooksList, createWordbook } = useWordbook()
const { data } = useStorage()

const activeWordbook = getActiveWordbook
const showImportOptions = ref(false)
const showAmountSelector = ref(false)

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const words = await importFromFile(file)
    
    if (words && words.length > 0) {
      const wordbookName = file.name.replace('.csv', '')
      createWordbook(wordbookName, words)
      router.push('/wordbooks')
    }
  } catch (err) {
    console.error('Error handling file upload:', err)
    alert('导入失败: ' + err.message)
  }
  
  event.target.value = ''
}

const useSampleData = () => {
  const sampleWords = [
    { id: 'apple-0', word: 'apple', phonetic: '/ˈæpl/', chinese: '苹果', example: 'An apple a day keeps the doctor away.' },
    { id: 'abandon-1', word: 'abandon', phonetic: '/əˈbændən/', chinese: '放弃', example: 'Never abandon your dreams.' },
    { id: 'ability-2', word: 'ability', phonetic: '/əˈbɪləti/', chinese: '能力', example: 'She has the ability to succeed.' },
    { id: 'about-3', word: 'about', phonetic: '/əˈbaʊt/', chinese: '关于', example: 'Tell me about your day.' },
    { id: 'above-4', word: 'above', phonetic: '/əˈbʌv/', chinese: '在...上面', example: 'The stars are above us.' }
  ]

  try {
    createWordbook('示例词库', sampleWords)
    router.push('/wordbooks')
  } catch (error) {
    alert(error.message)
  }
}

// Load frequent words if needed
const loadFrequentWordsWordbook = async () => {
  try {
    const existingWordbooks = Object.values(getWordbooksList.value || {})
    const frequentWordsExists = existingWordbooks.some(wb => wb.name === '高频单词')
    
    if (!frequentWordsExists) {
      const response = await fetch('/frequently-used-words.csv')
      if (response.ok) {
        const csvText = await response.text()
        const allWords = await importFromText(csvText)
        if (allWords && allWords.length > 0) {
          createWordbook('高频单词', allWords)
        }
      }
    }
  } catch (err) {
    console.error('Error loading frequent words:', err)
  }
}

const startReview = () => {
  if (!activeWordbook.value) return
  sessionStorage.removeItem('reviewWords')
  router.push('/review')
}

const startReviewWithAmount = (amount) => {
  if (!activeWordbook.value || !activeWordbook.value.words.length) {
    error.value = '当前词库为空'
    setTimeout(() => error.value = '', 3000)
    return
  }

  // Use review algorithm to prioritize words
  const allWords = activeWordbook.value.words
  const prioritized = prioritizeCards(allWords, data.value.words)
  
  // Select the requested amount of highest priority words
  const selectedWords = prioritized.slice(0, Math.min(amount, allWords.length))
  
  // Store in session storage for Review.vue
  sessionStorage.setItem('reviewWords', JSON.stringify(selectedWords))
  sessionStorage.setItem('reviewSessionId', Date.now().toString())
  
  showAmountSelector.value = false
  router.push('/review')
}

const reviewRandomWords = (count) => {
  if (!activeWordbook.value || !activeWordbook.value.words.length) {
    error.value = '当前词库为空'
    setTimeout(() => error.value = '', 3000)
    return
  }
  
  const allWords = JSON.parse(JSON.stringify(activeWordbook.value.words))
  const shuffled = [...allWords]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const selectedWords = shuffled.slice(0, Math.min(count, allWords.length))
  
  sessionStorage.setItem('reviewWords', JSON.stringify(selectedWords))
  sessionStorage.setItem('reviewSessionId', Date.now().toString())
  router.push('/review')
}

const calculateProgress = (wb) => {
  if (!wb || !wb.stats || !wb.stats.total) return 0
  return Math.round((wb.stats.known / wb.stats.total) * 100)
}

const formatDate = (timestamp) => {
  if (!timestamp) return '从未'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  return `${days}天前`
}

loadFrequentWordsWordbook()
</script>
