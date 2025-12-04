import { ref } from 'vue'
import Papa from 'papaparse'

export function useCSVImport() {
  const isLoading = ref(false)
  const error = ref(null)
  const words = ref([])
  const progress = ref(0)

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      isLoading.value = true
      error.value = null
      progress.value = 0

      const tempWords = []
      let rowCount = 0

      Papa.parse(file, {
        header: true,
        dynamicTyping: false, // Keep as strings to avoid type conversion
        skipEmptyLines: true,
        chunk: (results, parser) => {
          // Process data in chunks to handle large files
          results.data.forEach((row) => {
            // Validate and add valid rows
            if (row.word && row.phonetic && row.chinese &&
                typeof row.word === 'string' &&
                typeof row.phonetic === 'string' &&
                typeof row.chinese === 'string') {
              
              tempWords.push({
                id: `${row.word.trim()}-${rowCount}`,
                word: row.word.trim(),
                phonetic: row.phonetic.trim(),
                chinese: row.chinese.trim(),
                example: row.example && typeof row.example === 'string' ? row.example.trim() : ''
              })
              rowCount++
            }
          })
          
          // Update progress (approximate)
          progress.value = Math.min(95, Math.floor((tempWords.length / 2000) * 100))
        },
        complete: (results) => {
          isLoading.value = false
          progress.value = 100
          
          if (tempWords.length === 0) {
            error.value = 'CSV文件格式错误：没有找到有效的单词数据'
            reject(new Error(error.value))
            return
          }

          words.value = tempWords
          console.log(`Successfully imported ${tempWords.length} words`)
          resolve(words.value)
        },
        error: (err) => {
          isLoading.value = false
          progress.value = 0
          error.value = `CSV解析错误：${err.message}`
          reject(err)
        }
      })
    })
  }

  const importFromFile = async (file) => {
    if (!file) {
      error.value = '请选择文件'
      return null
    }

    if (!file.name.endsWith('.csv')) {
      error.value = '请选择CSV文件'
      return null
    }

    try {
      const result = await parseCSV(file)
      return result
    } catch (err) {
      console.error('Import error:', err)
      return null
    }
  }

  const importFromText = (csvText) => {
    return new Promise((resolve, reject) => {
      isLoading.value = true
      error.value = null
      progress.value = 0

      const tempWords = []
      let rowCount = 0

      Papa.parse(csvText, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        chunk: (results, parser) => {
          // Process in chunks for large datasets
          results.data.forEach((row) => {
            if (row.word && row.phonetic && row.chinese &&
                typeof row.word === 'string' &&
                typeof row.phonetic === 'string' &&
                typeof row.chinese === 'string') {
              
              tempWords.push({
                id: `${row.word.trim()}-${rowCount}`,
                word: row.word.trim(),
                phonetic: row.phonetic.trim(),
                chinese: row.chinese.trim(),
                example: row.example && typeof row.example === 'string' ? row.example.trim() : ''
              })
              rowCount++
            }
          })
          
          progress.value = Math.min(95, Math.floor((tempWords.length / 2000) * 100))
        },
        complete: (results) => {
          isLoading.value = false
          progress.value = 100

          if (tempWords.length === 0) {
            error.value = 'CSV格式错误：没有找到有效的单词数据'
            reject(new Error(error.value))
            return
          }

          words.value = tempWords
          console.log(`Successfully imported ${tempWords.length} words from text`)
          resolve(words.value)
        },
        error: (err) => {
          isLoading.value = false
          progress.value = 0
          error.value = `解析错误：${err.message}`
          reject(err)
        }
      })
    })
  }

  return {
    isLoading,
    error,
    words,
    progress,
    importFromFile,
    importFromText
  }
}
