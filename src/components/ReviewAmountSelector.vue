<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      选择复习数量
    </h3>
    
    <div class="space-y-4">
      <!-- Preset Options -->
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="preset in presets"
          :key="preset"
          @click="selectAmount(preset)"
          :class="[
            'py-3 px-4 rounded-lg font-medium transition-all',
            selectedAmount === preset
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ preset }}
        </button>
      </div>
      
      <!-- Custom Input -->
      <div class="space-y-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">
          自定义数量 (最多 {{ maxWords }})
        </label>
        <input
          v-model.number="customAmount"
          type="number"
          :min="1"
          :max="maxWords"
          @input="selectAmount(customAmount)"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="输入数量"
        />
      </div>
      
      <!-- Info Text -->
      <p class="text-sm text-gray-500 dark:text-gray-400">
        词库共有 {{ maxWords }} 个单词可供复习
      </p>
      
      <!-- Action Buttons -->
      <div class="flex gap-3 pt-2">
        <button
          @click="$emit('cancel')"
          class="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          取消
        </button>
        <button
          @click="confirm"
          :disabled="!selectedAmount || selectedAmount < 1 || selectedAmount > maxWords"
          class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          开始复习
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  maxWords: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// Preset amounts based on max available
const presets = computed(() => {
  const amounts = [20, 50, 100]
  return amounts.filter(n => n <= props.maxWords)
})

const selectedAmount = ref(presets.value[0] || 20)
const customAmount = ref(null)

const selectAmount = (amount) => {
  if (amount >= 1 && amount <= props.maxWords) {
    selectedAmount.value = amount
    customAmount.value = amount
  }
}

const confirm = () => {
  if (selectedAmount.value && selectedAmount.value >= 1 && selectedAmount.value <= props.maxWords) {
    emit('confirm', selectedAmount.value)
  }
}
</script>
