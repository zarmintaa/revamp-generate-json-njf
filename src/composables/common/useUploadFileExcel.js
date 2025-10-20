import { ref } from 'vue'
import * as ExcelJS from 'exceljs'

/**
 * Composable untuk membaca dan validasi file Excel menggunakan ExcelJS
 * @param {Object} columnValidation - Objek validasi kolom dengan format { columnName: type }
 * @example
 * const validation = {
 *   'Name': 'string',
 *   'Age': 'number',
 *   'Email': 'email',
 *   'Active': 'boolean',
 *   'Join Date': 'date'
 * }
 */
export function useExcelUpload(columnValidation = {}) {
  const data = ref([])
  const headers = ref([])
  const errors = ref([])
  const isLoading = ref(false)
  const fileName = ref('')

  /**
   * Validasi tipe data berdasarkan rules
   */
  const validateValue = (value, type, columnName, rowIndex) => {
    // Jika value kosong/null
    if (value === null || value === undefined || value === '') {
      return { valid: true, value: value }
    }

    switch (type.toLowerCase()) {
      case 'string':
        return {
          valid: typeof value === 'string' || typeof value === 'number',
          value: String(value),
          error:
            typeof value !== 'string' && typeof value !== 'number'
              ? `Baris ${rowIndex + 2}: Kolom "${columnName}" harus berupa text`
              : null,
        }

      case 'number':
        const numValue = typeof value === 'number' ? value : Number(value)
        return {
          valid: !isNaN(numValue),
          value: numValue,
          error: isNaN(numValue)
            ? `Baris ${rowIndex + 2}: Kolom "${columnName}" harus berupa angka`
            : null,
        }

      case 'boolean':
        const boolValue =
          typeof value === 'boolean'
            ? value
            : ['true', '1', 'yes', 'ya'].includes(String(value).toLowerCase())
              ? true
              : ['false', '0', 'no', 'tidak'].includes(String(value).toLowerCase())
                ? false
                : null
        return {
          valid: boolValue !== null,
          value: boolValue,
          error:
            boolValue === null
              ? `Baris ${rowIndex + 2}: Kolom "${columnName}" harus berupa boolean (true/false, 1/0, yes/no)`
              : null,
        }

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isValidEmail = emailRegex.test(String(value))
        return {
          valid: isValidEmail,
          value: String(value),
          error: !isValidEmail
            ? `Baris ${rowIndex + 2}: Kolom "${columnName}" harus berupa email yang valid`
            : null,
        }

      case 'date':
        let dateValue
        // ExcelJS mengembalikan Date object untuk cell dengan format date
        if (value instanceof Date) {
          dateValue = value
        } else {
          dateValue = new Date(value)
        }
        const isValidDate = dateValue instanceof Date && !isNaN(dateValue)
        return {
          valid: isValidDate,
          value: isValidDate ? dateValue.toISOString().split('T')[0] : value,
          error: !isValidDate
            ? `Baris ${rowIndex + 2}: Kolom "${columnName}" harus berupa tanggal yang valid`
            : null,
        }

      default:
        return { valid: true, value: value }
    }
  }

  /**
   * Validasi data berdasarkan column validation rules
   */
  const validateData = (rawData) => {
    const validationErrors = []
    const validatedData = []

    rawData.forEach((row, rowIndex) => {
      const validatedRow = { ...row }
      let rowHasError = false

      // Validasi setiap kolom yang ada rules-nya
      Object.keys(columnValidation).forEach((columnName) => {
        if (row.hasOwnProperty(columnName)) {
          const type = columnValidation[columnName]
          const result = validateValue(row[columnName], type, columnName, rowIndex)

          if (!result.valid) {
            validationErrors.push(result.error)
            rowHasError = true
          }

          validatedRow[columnName] = result.value
        }
      })

      // Hanya tambahkan row yang valid
      if (!rowHasError) {
        validatedData.push(validatedRow)
      }
    })

    return { validatedData, validationErrors }
  }

  /**
   * Membaca file Excel dengan ExcelJS
   */
  const readExcel = async (file) => {
    try {
      isLoading.value = true
      errors.value = []
      fileName.value = file.name

      const workbook = new ExcelJS.Workbook()
      const arrayBuffer = await file.arrayBuffer()
      await workbook.xlsx.load(arrayBuffer)

      // Ambil worksheet pertama
      const worksheet = workbook.worksheets[0]

      if (!worksheet || worksheet.rowCount === 0) {
        errors.value.push('File Excel kosong atau tidak memiliki data')
        isLoading.value = false
        throw new Error('File Excel kosong')
      }

      const rawData = []
      let headerRow = null

      // Iterate melalui rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Row pertama adalah header
          headerRow = row.values.filter((val) => val !== null && val !== undefined)
          headers.value = headerRow.slice(1) // Slice karena index 0 kosong di ExcelJS
        } else {
          // Data rows
          const rowData = {}
          row.eachCell((cell, colNumber) => {
            const headerName = headers.value[colNumber - 1]
            if (headerName) {
              // ExcelJS otomatis convert ke tipe yang sesuai
              rowData[headerName] = cell.value
            }
          })

          // Hanya tambahkan row yang tidak kosong
          if (Object.keys(rowData).length > 0) {
            rawData.push(rowData)
          }
        }
      })

      if (rawData.length === 0) {
        errors.value.push('File Excel tidak memiliki data (hanya header)')
        isLoading.value = false
        throw new Error('Tidak ada data')
      }

      // Validasi data jika ada column validation
      if (Object.keys(columnValidation).length > 0) {
        const { validatedData, validationErrors } = validateData(rawData)

        if (validationErrors.length > 0) {
          errors.value = validationErrors
        }

        data.value = validatedData
      } else {
        // Tidak ada validasi, ambil semua data
        data.value = rawData
      }

      isLoading.value = false
      return {
        data: data.value,
        headers: headers.value,
        errors: errors.value,
        fileName: fileName.value,
        totalRows: rawData.length,
        validRows: data.value.length,
      }
    } catch (error) {
      errors.value.push(`Error membaca file: ${error.message}`)
      isLoading.value = false
      throw error
    }
  }

  /**
   * Validasi file sebelum dibaca
   */
  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      errors.value.push('File harus berformat Excel (.xls atau .xlsx)')
      return false
    }

    if (file.size > maxSize) {
      errors.value.push('Ukuran file maksimal 10MB')
      return false
    }

    return true
  }

  /**
   * Handle file upload
   */
  const handleFileUpload = async (file) => {
    errors.value = []

    if (!validateFile(file)) {
      return { success: false, errors: errors.value }
    }

    try {
      const result = await readExcel(file)
      return { success: true, ...result }
    } catch (error) {
      return { success: false, errors: errors.value }
    }
  }

  /**
   * Reset state
   */
  const reset = () => {
    data.value = []
    headers.value = []
    errors.value = []
    fileName.value = ''
    isLoading.value = false
  }

  return {
    data,
    headers,
    errors,
    isLoading,
    fileName,
    handleFileUpload,
    reset,
  }
}

/*
import { useExcelUpload } from '@/composables/useExcelUpload';

// Setup validasi
const columnValidation = {
    'Name': 'string',
    'Age': 'number',
    'Email': 'email',
    'Active': 'boolean',
    'Join Date': 'date'
};

const { data, headers, errors, isLoading, handleFileUpload, reset } = useExcelUpload(columnValidation);

// Handle file
const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
        const result = await handleFileUpload(file);
        if (result.success) {
            console.log('Data:', result.data);
        }
    }
};
 */