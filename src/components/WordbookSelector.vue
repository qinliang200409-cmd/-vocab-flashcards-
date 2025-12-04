<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
    <!-- Header with Create Button -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">
        📚 我的词库
      </h2>
      <button
        @click="showCreateDialog = true"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        ➕ 新建
      </button>
    </div>

    <!-- Active Wordbook Display -->
    <div v-if="activeWordbook" class="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ activeWordbook.name }}
            </span>
            <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              当前
            </span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-600 dark:text-gray-400">总计:</span>
              <span class="ml-1 font-semibold text-gray-900 dark:text-white">
                {{ activeWordbook.stats.total }}
              </span>
            </div>
            <div>
              <span class="text-gray-600 dark:text-gray-400">未复习:</span>
              <span class="ml-1 font-semibold text-gray-900 dark:text-white">
                {{ activeWordbook.stats.notReviewed }}
              </span>
            </div>
            <div>
              <span class="text-green-600 dark:text-green-400">认识:</span>
              <span class="ml-1 font-semibold text-green-600 dark:text-green-400">
                {{ activeWordbook.stats.known }}
              </span>
            </div>
            <div>
              <span class="text-red-600 dark:text-red-400">不认识:</span>
              <span class="ml-1 font-semibold text-red-600 dark:text-red-400">
                {{ activeWordbook.stats.unknown }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            @click="editWordbook(activeWordbook)"
            class="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            title="重命名"
          >
            ✏️
          </button>
          <button
            @click="exportWordbook(activeWordbook.id)"
            class="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
            title="导出"
          >
            💾
          </button>
        </div>
      </div>
    </div>

    <!-- No Wordbooks Message -->
    <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
      <p class="mb-4">还没有词库，创建一个开始学习吧！</p>
      <button
        @click="showCreateDialog = true"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        创建第一个词库
      </button>
    </div>

    <!-- Wordbooks List (collapsible) -->
    <div v-if="wordbooksList.length > 1">
      <button
        @click="showWordbooksList = !showWordbooksList"
        class="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          切换词库 ({{ wordbooksList.length }})
        </span>
        <span :class="{ 'rotate-180': showWordbooksList }" class="transform transition-transform">
          ▼
        </span>
      </button>

      <!-- Wordbooks List Items -->
      <div v-show="showWordbooksList" class="mt-2 space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="wb in wordbooksList"
          :key="wb.id"
          class="flex items-center justify-between p-3 rounded-lg border-2 transition-all"
          :class="[
            wb.id === activeWordbookId
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
          ]"
        >
          <div class="flex-1 min-w-0" @click="switchToWordbook(wb.id)">
            <div class="flex items-center space-x-2 cursor-pointer">
              <span class="font-medium text-gray-900 dark:text-white truncate">
                {{ wb.name }}
              </span>
              <span v-if="wb.id === activeWordbookId" class="text-blue-600 text-xs">✓</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ wb.stats.total }} 个单词 · {{ formatDate(wb.updatedAt) }}
            </div>
          </div>
          <div class="flex space-x-1 ml-2">
            <button
              @click.stop="editWordbook(wb)"
              class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="重命名"
            >
              ✏️
            </button>
            <button
              v-if="wb.id !== activeWordbookId"
              @click.stop="confirmDelete(wb)"
              class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="删除"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Wordbook Dialog -->
    <div
      v-if="showCreateDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showCreateDialog = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          创建新词库
        </h3>
        <input
          v-model="newWordbookName"
          type="text"
          placeholder="输入词库名称..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
          @keyup.enter="createNewWordbook"
        />
        <div class="flex space-x-3 mt-4">
          <button
            @click="createNewWordbook"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            :disabled="!newWordbookName.trim()"
          >
            创建
          </button>
          <button
            @click="showCreateDialog = false"
            class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Wordbook Dialog -->
    <div
      v-if="showEditDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showEditDialog = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
          重命名词库
        </h3>
        <input
          v-model="editingWordbookName"
          type="text"
          placeholder="输入新名称..."
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
          @keyup.enter="saveWordbookName"
        />
        <div class="flex space-x-3 mt-4">
          <button
            @click="saveWordbookName"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            :disabled="!editingWordbookName.trim()"
          >
            保存
          </button>
          <button
            @click="showEditDialog = false"
            class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showDeleteDialog = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
          ⚠️ 确认删除
        </h3>
        <p class="text-gray-700 dark:text-gray-300 mb-6">
          确定要删除词库 <strong>{{ deletingWordbook?.name }}</strong> 吗？
          <br />
          <span class="text-sm text-gray-500 dark:text-gray-400">
            此操作无法撤销！
          </span>
        </p>
        <div class="flex space-x-3">
          <button
            @click="executeDelete"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            确认删除
          </button>
          <button
            @click="showDeleteDialog = false"
            class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWordbook } from '@/composables/useWordbook'

const {
  activeWordbookId,
  getActiveWordbook,
  getWordbooksList,
  createWordbook,
  switchWordbook,
  renameWordbook,
  deleteWordbook,
  exportWordbookToCSV
} = useWordbook()

const activeWordbook = getActiveWordbook
const wordbooksList = getWordbooksList

// UI State
const showWordbooksList = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

// Form State
const newWordbookName = ref('')
const editingWordbookId = ref(null)
const editingWordbookName = ref('')
const deletingWordbook = ref(null)

/**
 * Create a new wordbook
 */
const createNewWordbook = () => {
  if (!newWordbookName.value.trim()) return
  
  createWordbook(newWordbookName.value.trim())
  newWordbookName.value = ''
  showCreateDialog.value = false
}

/**
 * Switch to a different wordbook
 */
const switchToWordbook = (wordbookId) => {
  const success = switchWordbook(wordbookId)
  if (success) {
    showWordbooksList.value = false
  }
}

/**
 * Start editing a wordbook name
 */
const editWordbook = (wordbook) => {
  editingWordbookId.value = wordbook.id
  editingWordbookName.value = wordbook.name
  showEditDialog.value = true
}

/**
 * Save the new wordbook name
 */
const saveWordbookName = () => {
  if (!editingWordbookName.value.trim() || !editingWordbookId.value) return
  
  const success = renameWordbook(editingWordbookId.value, editingWordbookName.value.trim())
  if (success) {
    showEditDialog.value = false
    editingWordbookId.value = null
    editingWordbookName.value = ''
  }
}

/**
 * Show delete confirmation dialog
 */
const confirmDelete = (wordbook) => {
  deletingWordbook.value = wordbook
  showDeleteDialog.value = true
}

/**
 * Execute wordbook deletion
 */
const executeDelete = () => {
  if (!deletingWordbook.value) return
  
  const success = deleteWordbook(deletingWordbook.value.id)
  if (success) {
    showDeleteDialog.value = false
    deletingWordbook.value = null
  }
}

/**
 * Export wordbook to CSV file
 */
const exportWordbook = (wordbookId) => {
  const csvContent = exportWordbookToCSV(wordbookId)
  if (!csvContent) return
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  const wordbook = getWordbooksList.value.find(wb => wb.id === wordbookId)
  const filename = `${wordbook?.name || 'wordbook'}_${new Date().toISOString().split('T')[0]}.csv`
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Format timestamp to readable date
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return date.toLocaleDateString('zh-CN')
}
</script>
