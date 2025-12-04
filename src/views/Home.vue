<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          单词快速复习
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          通过卡片交互强化记忆
        </p>
      </div>

      <!-- Wordbook Selector -->
      <WordbookSelector />

      <!-- Main Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-4">
        <!-- Import CSV -->
        <div>
          <label 
            for="csv-upload" 
            class="block w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center cursor-pointer transition-colors"
          >
            📁 导入CSV单词库
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            class="hidden"
            @change="handleFileUpload"
          />
        </div>

        <!-- Use Sample Data -->
        <button
          @click="useSampleData"
          class="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          📚 使用示例词库
        </button>

        <!-- Random Words Section -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
            🎲 随机复习当前词库
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-500 mb-3 text-center">
            从当前词库中随机选择单词进行复习
          </p>
          <div class="grid grid-cols-2 gap-3">
            <button
              @click="reviewRandomWords(50)"
              class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              :disabled="!getActiveWordbook"
            >
              随机50个
            </button>
            <button
              @click="reviewRandomWords(100)"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              :disabled="!getActiveWordbook"
            >
              随机100个
            </button>
          </div>
          <p v-if="!getActiveWordbook" class="text-xs text-orange-600 dark:text-orange-400 mt-2 text-center">
            请先创建或选择一个词库
          </p>
        </div>

        <!-- Settings -->
        <button
          @click="goToSettings"
          class="w-full px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          ⚙️ 设置
        </button>

        <!-- Error Message -->
        <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          <p class="font-semibold mb-1">❌ 导入失败</p>
          <p>{{ error }}</p>
        </div>

        <!-- Loading with Progress -->
        <div v-if="isLoading" class="text-center text-gray-600 dark:text-gray-400">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>加载中... {{ progress }}%</p>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
        <h3 class="font-semibold mb-2">💡 使用说明：</h3>
        <ul class="space-y-1.5 list-none">
          <li>📚 <strong>词库管理：</strong>创建多个词库分类学习</li>
          <li>🎲 <strong>随机抽取：</strong>从1800+高频词中抽取单词到当前词库</li>
          <li>📁 <strong>CSV格式：</strong>word,phonetic,chinese,example</li>
          <li>⌨️ <strong>快捷键：</strong>空格翻转，1/2/3标记，Z撤销</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCSVImport } from '@/composables/useCSVImport'
import { useWordbook } from '@/composables/useWordbook'
import WordbookSelector from '@/components/WordbookSelector.vue'

const router = useRouter()
const { importFromFile, importFromText, isLoading, error, progress } = useCSVImport()
const { getActiveWordbook, getWordbooksList, createWordbook, addWordsToWordbook } = useWordbook()

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  console.log('File selected:', file.name)
  
  try {
    const words = await importFromFile(file)
    console.log('Parsed words:', words)
    
    if (words && words.length > 0) {
      // Always create a NEW wordbook for imported CSV
      const wordbookName = file.name.replace('.csv', '')
      const wordbookId = createWordbook(wordbookName, words)
      console.log('Created new wordbook:', wordbookId)
      
      // Store words in sessionStorage for immediate review
      sessionStorage.setItem('reviewWords', JSON.stringify(words))
      console.log('Words stored in sessionStorage')
      router.push('/review')
    } else {
      console.error('No words parsed from file')
    }
  } catch (err) {
    console.error('Error handling file upload:', err)
  }
  
  // Reset file input to allow re-selecting the same file
  event.target.value = ''
}

const useSampleData = () => {
  // Sample data for demonstration
  const sampleWords = [
    {
      id: 'apple-0',
      word: 'apple',
      phonetic: '/ˈæpl/',
      chinese: '苹果',
      example: 'An apple a day keeps the doctor away.'
    },
    {
      id: 'abandon-1',
      word: 'abandon',
      phonetic: '/əˈbændən/',
      chinese: '放弃',
      example: 'Never abandon your dreams.'
    },
    {
      id: 'ability-2',
      word: 'ability',
      phonetic: '/əˈbɪləti/',
      chinese: '能力',
      example: 'She has the ability to succeed.'
    },
    {
      id: 'about-3',
      word: 'about',
      phonetic: '/əˈbaʊt/',
      chinese: '关于',
      example: 'Tell me about your day.'
    },
    {
      id: 'above-4',
      word: 'above',
      phonetic: '/əˈbʌv/',
      chinese: '在...上面',
      example: 'The stars are above us.'
    }
  ]

  // Always create a new wordbook for sample data
  createWordbook('示例词库', sampleWords)

  sessionStorage.setItem('reviewWords', JSON.stringify(sampleWords))
  router.push('/review')
}

// Load and create the "高频单词" wordbook on component mount
const loadFrequentWordsWordbook = async () => {
  try {
    const response = await fetch('/frequently-used-words.csv')
    if (!response.ok) {
      console.error('Failed to load frequently-used-words.csv')
      return
    }
    
    const csvText = await response.text()
    const allWords = await importFromText(csvText)
    
    if (allWords && allWords.length > 0) {
      // Check if "高频单词" wordbook already exists
      const existingWordbooks = Object.values(getWordbooksList.value || {})
      const frequentWordsExists = existingWordbooks.some(wb => wb.name === '高频单词')
      
      if (!frequentWordsExists) {
        createWordbook('高频单词', allWords)
        console.log('Created "高频单词" wordbook with', allWords.length, 'words')
      }
    }
  } catch (err) {
    console.error('Error loading frequent words wordbook:', err)
  }
}

// Random review from current active wordbook
const reviewRandomWords = (count) => {
  // IMPORTANT: Re-fetch active wordbook to ensure we have the latest one
  const activeWordbook = getActiveWordbook.value
  
  if (!activeWordbook || !activeWordbook.words || activeWordbook.words.length === 0) {
    error.value = '当前词库为空，请先添加单词'
    setTimeout(() => {
      error.value = ''
    }, 3000)
    return
  }
  
  // Create a deep copy of the words array to avoid reference issues
  const allWords = JSON.parse(JSON.stringify(activeWordbook.words))
  console.log(`Current wordbook "${activeWordbook.name}" has ${allWords.length} words`)
  
  // Randomly select the specified number of words using Fisher-Yates shuffle
  const shuffled = [...allWords]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const selectedWords = shuffled.slice(0, Math.min(count, allWords.length))
  
  console.log(`Selected ${selectedWords.length} random words from "${activeWordbook.name}"`)
  console.log('Sample words:', selectedWords.slice(0, 3).map(w => w.word))
  
  // Store in sessionStorage and navigate to review
  sessionStorage.setItem('reviewWords', JSON.stringify(selectedWords))
  // Add a timestamp to force Review page to reload with new data
  sessionStorage.setItem('reviewSessionId', Date.now().toString())
  router.push('/review')
}

// Load frequent words wordbook when component mounts
loadFrequentWordsWordbook()

const goToSettings = () => {
  router.push('/settings')
}
</script>
