<template>
  <div class="min-h-screen p-4 pb-20 md:p-8 md:pb-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-start gap-4">
          <button 
            @click="router.push('/')" 
            class="mt-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="返回首页"
          >
            ←
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📚</span> 词库管理
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              管理您的所有单词本，跟踪学习进度
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <label 
            for="csv-import-global" 
            class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <span>📁</span> 导入
          </label>
          <input
            id="csv-import-global"
            type="file"
            accept=".csv"
            class="hidden"
            @change="handleImport"
          />
          <button
            @click="showCreateDialog = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>➕</span> 新建词库
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          @click="activeTab = 'local'"
          class="px-6 py-3 font-medium text-sm transition-colors relative"
          :class="activeTab === 'local' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          本地词库
          <div v-if="activeTab === 'local'" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></div>
        </button>
        <button
          @click="activeTab = 'online'"
          class="px-6 py-3 font-medium text-sm transition-colors relative"
          :class="activeTab === 'online' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          在线/外部资源
          <div v-if="activeTab === 'online'" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></div>
        </button>
      </div>

      <!-- Online Resources Section -->
      <div v-if="activeTab === 'online'" class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
          💡 这里的词库来源于 <code class="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded">public/dicts</code> 目录。您可以将 CSV 文件放入该目录并更新 index.json 来添加更多词库。这些词库不会占用浏览器存储空间。
        </div>

        <!-- Category Filter Buttons -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in availableCategories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="selectedCategory === cat 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          >
            {{ cat }}
            <span class="ml-1.5 text-xs opacity-75">({{ getCategoryCount(cat) }})</span>
          </button>
        </div>

        <!-- Dictionaries Grid by Category -->
        <div v-for="category in displayCategories" :key="category" class="space-y-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ getCategoryEmoji(category) }} {{ category }}
            </h2>
            <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              {{ getCategoryCount(category) }} 个词库
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="dict in getDictsByCategory(category)" 
              :key="dict.id"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all p-5 flex flex-col"
            >
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ dict.name }}</h3>
                <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {{ dict.count }} 词
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                {{ dict.description || '无描述' }}
              </p>
              <div class="text-xs text-gray-400 mb-4 font-mono truncate">
                📄 {{ dict.filename }}
              </div>
              <button
                @click="addExternalDict(dict)"
                class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <span>📥</span> 添加到我的词库
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls Section: Search, Filter, Sort -->
      <div v-show="activeTab === 'local'" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="搜索词库名称..."
            class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all"
          />
        </div>

        <!-- Filters & Sort -->
        <div class="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          <!-- Status Filter -->
          <select 
            v-model="filterStatus"
            class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="in-progress">进行中</option>
            <option value="not-started">未开始</option>
            <option value="completed">已完成</option>
          </select>

          <!-- Sort -->
          <select 
            v-model="sortBy"
            class="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">最近更新</option>
            <option value="created">创建时间</option>
            <option value="name">名称 (A-Z)</option>
            <option value="count-desc">单词数 (多→少)</option>
            <option value="count-asc">单词数 (少→多)</option>
          </select>
        </div>
      </div>

      <!-- Wordbooks Grid -->
      <div v-show="activeTab === 'local' && filteredWordbooks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="wb in filteredWordbooks" 
          :key="wb.id"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border-2 transition-all duration-200 group relative flex flex-col"
          :class="[
            wb.id === activeWordbookId 
              ? 'border-blue-500 dark:border-blue-500' 
              : 'border-transparent dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
          ]"
        >
          <!-- Active Badge -->
          <div v-if="wb.id === activeWordbookId" class="absolute -top-3 left-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm z-10">
            当前激活
          </div>

          <!-- Card Header -->
          <div class="p-5 pb-0 flex items-start justify-between">
            <div class="flex-1 min-w-0 pr-2">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate" :title="wb.name">
                {{ wb.name }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(wb.updatedAt) }} 更新
              </p>
            </div>
            <!-- Menu Dropdown (using native details for simplicity) -->
            <div class="relative">
              <button 
                @click.stop="toggleMenu(wb.id)"
                class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ⋮
              </button>
              
              <!-- Dropdown Menu -->
              <div 
                v-if="openMenuId === wb.id" 
                class="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-100 dark:border-gray-600 z-20 overflow-hidden py-1"
                v-click-outside="() => openMenuId = null"
              >
                <button 
                  @click="startEdit(wb)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  ✏️ 重命名
                </button>
                <button 
                  @click="exportWordbook(wb.id)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                  💾 导出
                </button>
                <button 
                  v-if="wb.id !== activeWordbookId"
                  @click="confirmDelete(wb)"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-600"
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="px-5 mt-4">
             <div class="flex items-center justify-between text-xs mb-1.5">
              <span class="text-gray-600 dark:text-gray-400 font-medium">进度</span>
              <span class="text-blue-600 dark:text-blue-400 font-bold">
                {{ calculateProgress(wb) }}%
              </span>
            </div>
            <div class="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
              <div 
                class="h-full bg-green-500" 
                :style="{ width: `${(wb.stats.known / wb.stats.total) * 100}%` }"
              ></div>
              <div 
                class="h-full bg-yellow-400" 
                :style="{ width: `${(wb.stats.fuzzy / wb.stats.total) * 100}%` }"
              ></div>
              <!-- Remaining is empty/background -->
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="p-5 pt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg py-2">
              <div class="font-bold text-gray-900 dark:text-white">{{ wb.stats.total }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">总词数</div>
            </div>
            <div class="bg-green-50 dark:bg-green-900/10 rounded-lg py-2">
              <div class="font-bold text-green-600 dark:text-green-400">{{ wb.stats.known }}</div>
              <div class="text-xs text-green-600/70 dark:text-green-400/70">已掌握</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg py-2">
              <div class="font-bold text-blue-600 dark:text-blue-400">
                {{ wb.stats.notReviewed }}
              </div>
              <div class="text-xs text-blue-600/70 dark:text-blue-400/70">待复习</div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="p-5 pt-0 mt-auto">
            <button
              v-if="wb.id !== activeWordbookId"
              @click="handleSwitch(wb.id)"
              class="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium transition-all text-sm"
            >
              切换为此词库
            </button>
            <button
              v-else
              @click="router.push('/review')"
              class="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all text-sm shadow-sm hover:shadow"
            >
              开始复习
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-show="activeTab === 'local' && filteredWordbooks.length === 0" class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">未找到词库</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ wordbooksList.length === 0 ? '您还没有创建任何词库' : '没有匹配搜索条件的词库' }}
        </p>
        <button
          @click="wordbooksList.length === 0 ? (showCreateDialog = true) : resetFilters()"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {{ wordbooksList.length === 0 ? '创建第一个词库' : '清除筛选' }}
        </button>
      </div>
    </div>

    <!-- Create Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" @click.self="showCreateDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">创建新词库</h3>
        <input
          v-model="newWordbookName"
          type="text"
          placeholder="例如：CET-4 核心词汇"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-6"
          @keyup.enter="createNewWordbook"
          autofocus
        />
        <div class="flex gap-3">
          <button @click="showCreateDialog = false" class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
          <button @click="createNewWordbook" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!newWordbookName.trim()">创建</button>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" @click.self="showEditDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">重命名词库</h3>
        <input
          v-model="editingWordbookName"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-6"
          @keyup.enter="saveWordbookName"
        />
        <div class="flex gap-3">
          <button @click="showEditDialog = false" class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
          <button @click="saveWordbookName" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50" :disabled="!editingWordbookName.trim()">保存</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Dialog -->
    <div v-if="showDeleteDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" @click.self="showDeleteDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 text-2xl">
          🗑️
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">删除词库</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          确定要删除 <span class="font-bold text-gray-900 dark:text-white">"{{ deletingWordbook?.name }}"</span> 吗？此操作无法撤销。
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteDialog = false" class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
          <button @click="executeDelete" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">删除</button>
        </div>
      </div>
    </div>
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col items-center">
             <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4"></div>
             <p class="text-gray-700 dark:text-gray-300 font-medium">{{ loadingMessage }}</p>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWordbook } from '@/composables/useWordbook'
import { useCSVImport } from '@/composables/useCSVImport'

const router = useRouter()
const {
  activeWordbookId,
  getWordbooksList,
  createWordbook,
  createExternalWordbook,
  switchWordbook,
  renameWordbook,
  deleteWordbook,
  exportWordbookToCSV,
  isLoading: isSwitching
} = useWordbook()
const { importFromFile, isLoading: isImporting } = useCSVImport()

// State
const wordbooksList = getWordbooksList
const onlineDicts = ref([])
const activeTab = ref('local')
const selectedCategory = ref('全部')
const searchQuery = ref('')
const filterStatus = ref('all')
const sortBy = ref('updated')
const openMenuId = ref(null)

// Dialogs
const showCreateDialog = ref(false)
const newWordbookName = ref('')
const showEditDialog = ref(false)
const editingWordbookId = ref(null)
const editingWordbookName = ref('')
const showDeleteDialog = ref(false)
const deletingWordbook = ref(null)

// Computed
const filteredWordbooks = computed(() => {
  let result = [...wordbooksList.value]

  // 1. Filter by Search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(wb => wb.name.toLowerCase().includes(query))
  }

  // 2. Filter by Status
  if (filterStatus.value !== 'all') {
    result = result.filter(wb => {
      const progress = calculateProgress(wb)
      if (filterStatus.value === 'completed') return progress === 100
      if (filterStatus.value === 'not-started') return progress === 0
      if (filterStatus.value === 'in-progress') return progress > 0 && progress < 100
      return true
    })
  }

  // 3. Sort
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'created':
        return b.createdAt - a.createdAt
      case 'name':
        return a.name.localeCompare(b.name, 'zh-CN')
      case 'count-desc':
        return b.stats.total - a.stats.total
      case 'count-asc':
        return a.stats.total - b.stats.total
      case 'updated':
      default:
        // Default to updated desc, fallback to created desc
        return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
    }
  })

  return result
})

const isLoading = computed(() => isImporting.value || isSwitching.value)
const loadingMessage = ref('处理中...')

// Category filtering for online dictionaries
const availableCategories = computed(() => {
  const categories = new Set(['全部'])
  onlineDicts.value.forEach(dict => {
    if (dict.category) categories.add(dict.category)
  })
  return Array.from(categories)
})

const displayCategories = computed(() => {
  if (selectedCategory.value === '全部') {
    // Show all categories
    return availableCategories.value.filter(c => c !== '全部')
  }
  // Show only selected category
  return [selectedCategory.value]
})

const getDictsByCategory = (category) => {
  return onlineDicts.value.filter(dict => dict.category === category)
}

const getCategoryCount = (category) => {
  if (category === '全部') {
    return onlineDicts.value.length
  }
  return getDictsByCategory(category).length
}

const getCategoryEmoji = (category) => {
  const emojiMap = {
    '考试': '📝',
    '教材': '📚',
    '日语': '🇯🇵',
    '编程': '💻',
    '基础': '🔤',
    '进阶': '🚀',
    '其他': '📦'
  }
  return emojiMap[category] || '📁'
}

// Click Outside Directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Actions
const createNewWordbook = () => {
  if (!newWordbookName.value.trim()) return
  
  try {
    createWordbook(newWordbookName.value.trim())
    newWordbookName.value = ''
    showCreateDialog.value = false
  } catch (error) {
    alert(error.message)
  }
}

const handleSwitch = (id) => {
  switchWordbook(id)
}

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const startEdit = (wb) => {
  editingWordbookId.value = wb.id
  editingWordbookName.value = wb.name
  showEditDialog.value = true
  openMenuId.value = null
}

const saveWordbookName = () => {
  if (editingWordbookName.value.trim()) {
    renameWordbook(editingWordbookId.value, editingWordbookName.value.trim())
    showEditDialog.value = false
  }
}

const confirmDelete = (wb) => {
  deletingWordbook.value = wb
  showDeleteDialog.value = true
  openMenuId.value = null
}

const executeDelete = () => {
  if (deletingWordbook.value) {
    deleteWordbook(deletingWordbook.value.id)
    showDeleteDialog.value = false
    deletingWordbook.value = null
  }
}

const exportWordbook = (id) => {
  const csvContent = exportWordbookToCSV(id)
  if (!csvContent) return

  const wb = wordbooksList.value.find(w => w.id === id)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${wb.name}_export.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  openMenuId.value = null
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  loadingMessage.value = '正在导入...'
  
  try {
    const words = await importFromFile(file)
    if (words && words.length > 0) {
      const name = file.name.replace('.csv', '')
      createWordbook(name, words)
    }
  } catch (error) {
    console.error('Import failed', error)
    alert('导入失败: ' + error.message)
  } finally {
    event.target.value = ''
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
}

const fetchOnlineDicts = async () => {
  try {
    const response = await fetch('/dicts/index.json')
    if (response.ok) {
      onlineDicts.value = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch online dicts', e)
  }
}

const addExternalDict = (dict) => {
  try {
    createExternalWordbook(dict.name, `/dicts/${dict.filename}`, dict.count)
    activeTab.value = 'local'
    // alert('词库添加成功！')
  } catch (e) {
    alert(e.message)
  }
}

// Helpers
const calculateProgress = (wb) => {
  if (!wb.stats.total) return 0
  return Math.round((wb.stats.known / wb.stats.total) * 100)
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// Close menu on scroll
const handleScroll = () => {
  if (openMenuId.value) openMenuId.value = null
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  fetchOnlineDicts()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
