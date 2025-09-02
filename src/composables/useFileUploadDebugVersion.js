// composables/useFileUpload.js
import { ref, nextTick } from 'vue'
import * as ExcelJS from 'exceljs'
import { useToast } from './useToast'

export function useFileUpload() {
  const fileInput = ref(null)
  const fileName = ref(null)
  const fileData = ref(null)
  const errorMessage = ref(null)
  const isFileNotReady = ref(true)
  const isProses = ref(false)
  const fileType = ref('EXCEL')
  const processingProgress = ref(0)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      fileInput.value = file
      fileName.value = file.name
      isFileNotReady.value = false
    } else {
      fileInput.value = null
      fileName.value = null
      isFileNotReady.value = true
    }
  }

  const readExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const workbook = new ExcelJS.Workbook()
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          console.log('🔄 Starting Excel buffer processing...')
          const buffer = e.target.result

          await workbook.xlsx.load(buffer)
          console.log('✅ Workbook loaded successfully')

          const worksheet = workbook.getWorksheet(1)
          if (!worksheet) {
            throw new Error('No worksheet found in Excel file')
          }

          console.log(`📊 Worksheet found with ${worksheet.rowCount} rows`)

          const jsonData = []
          const headers = []

          // Get headers from first row
          const headerRow = worksheet.getRow(1)
          headerRow.eachCell((cell, colNumber) => {
            headers.push(cell.value?.toString() || `Column ${colNumber}`)
          })
          console.log('📋 Headers extracted:', headers.length, 'columns')

          // Get data from rows (starting from row 2)
          let processedRows = 0
          const totalDataRows = worksheet.rowCount - 1

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
              const rowData = {}
              row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1]
                let resultReadRow = cell.value
                if (resultReadRow === 'NULL') {
                  resultReadRow = null
                }
                rowData[header] = resultReadRow
              })
              jsonData.push(rowData)
              processedRows++

              // Log progress setiap 1000 rows
              if (processedRows % 1000 === 0) {
                console.log(`📈 Progress: ${processedRows}/${totalDataRows} rows processed`)
              }
            }
          })

          console.log(`✅ Excel processing completed: ${jsonData.length} rows extracted`)

          resolve({
            headers,
            data: jsonData,
            type: 'excel',
          })
        } catch (error) {
          console.error('❌ Error in Excel processing:', error)
          reject(new Error(`Error reading Excel file: ${error.message}`))
        }
      }

      reader.onerror = (error) => {
        console.error('❌ FileReader error:', error)
        reject(new Error('Error reading file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const readJsonFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)

          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const headers = Object.keys(jsonData[0])
            resolve({
              headers,
              data: jsonData,
              type: 'json',
            })
          } else {
            resolve({
              headers: [],
              data: jsonData,
              type: 'json',
            })
          }
        } catch (error) {
          reject(new Error('Invalid JSON file format'))
        }
      }

      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const processFile = async () => {
    console.log('🚀 =================================')
    console.log('🚀 STARTING PROCESS FILE')
    console.log('🚀 =================================')

    const toast = useToast()

    // Test toast di awal
    console.log('🧪 Testing toast at start...')
    toast.info('Debug', 'Process started - testing toast', 2000)

    isProses.value = true
    errorMessage.value = null
    fileData.value = null
    processingProgress.value = 0

    try {
      if (!fileInput.value) {
        throw new Error(`Please select a ${fileType.value} file first`)
      }

      console.log('📁 File info:', {
        name: fileInput.value.name,
        size: fileInput.value.size,
        type: fileInput.value.type,
      })

      // Force Vue reactivity update
      await nextTick()

      let data
      console.log('🔄 Starting file processing...')

      if (fileType.value === 'EXCEL') {
        data = await readExcelFile(fileInput.value)
      } else if (fileType.value === 'JSON') {
        data = await readJsonFile(fileInput.value)
      } else {
        throw new Error('Unsupported file type')
      }

      console.log('✅ Data processing completed:', {
        headers: data.headers.length,
        rows: data.data.length,
        type: data.type,
      })

      fileData.value = data

      // Multiple attempts untuk memastikan toast muncul
      console.log('🎉 About to show success toast...')

      // Attempt 1: Immediate
      toast.success('File Processing', `1 - SUCCESS! Processed ${data.data.length} rows`, 5000)
      console.log('✅ SUCCESS TOAST TRIGGERED - Attempt 1')

      // Attempt 2: After nextTick
      await nextTick()
      toast.success('Processing Complete', `2 - File processed: ${data.data.length} rows`, 5000)
      console.log('✅ SUCCESS TOAST TRIGGERED - Attempt 2 (after nextTick)')

      // Attempt 3: After timeout
      setTimeout(() => {
        toast.success('Final Confirmation', `3 - Data ready: ${data.data.length} rows`, 5000)
        console.log('✅ SUCCESS TOAST TRIGGERED - Attempt 3 (after timeout)')
      }, 100)

      // Attempt 4: Different toast method (jika ada)
      if (toast.show) {
        toast.show({
          type: 'success',
          title: 'Alternative Toast',
          message: `Processing completed: ${data.data.length} rows`,
          duration: 5000,
        })
        console.log('✅ ALTERNATIVE TOAST METHOD TRIGGERED')
      }
    } catch (error) {
      console.error('❌ ERROR in processFile:', error)
      console.error('❌ Error stack:', error.stack)

      toast.error('Error Processing File', error.message || 'Failed to process file', 5000)
      console.log('🔥 ERROR TOAST TRIGGERED')

      errorMessage.value = error.message || 'Failed to process file'
    } finally {
      console.log('🏁 Process completed, setting isProses to false')
      isProses.value = false
      processingProgress.value = 0

      console.log('🚀 =================================')
      console.log('🚀 PROCESS FILE COMPLETED')
      console.log('🚀 =================================')
    }
  }

  const resetFileData = () => {
    fileInput.value = null
    fileName.value = null
    fileData.value = null
    errorMessage.value = null
    isFileNotReady.value = true
    isProses.value = false
    processingProgress.value = 0
  }

  // Test function untuk debugging toast
  const testToast = () => {
    console.log('🧪 Testing toast manually...')
    const toast = useToast()
    toast.success('Test Toast', 'This is a test toast', 3000)
    toast.error('Test Error', 'This is a test error', 3000)
    toast.info('Test Info', 'This is a test info', 3000)
  }

  return {
    // State
    fileInput,
    fileName,
    fileData,
    errorMessage,
    isFileNotReady,
    isProses,
    fileType,
    processingProgress,

    // Methods
    handleFileChange,
    processFile,
    resetFileData,
    testToast, // Tambahan untuk debugging
  }
}
