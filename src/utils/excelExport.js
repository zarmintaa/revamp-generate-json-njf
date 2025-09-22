// utils/excelExport.js - Untuk Vue.js (FIXED VERSION)
// Install: npm install exceljs

import * as ExcelJS from 'exceljs'
import { useToast } from '@/composables/useToast.js'

/**
 * Export data ke Excel untuk Vue.js
 * @param {Array} data - Array of objects berisi data
 * @param {string} filename - Nama file Excel (tanpa ekstensi)
 * @param {string} sheetName - Nama sheet
 * @param {Object} options - Opsi tambahan
 */
export async function exportToExcel(data, filename = 'export', sheetName = 'Sheet1', options = {}) {
  try {
    // Validasi data
    if (!data || data.length === 0) {
      throw new Error('Data tidak boleh kosong')
    }

    // Create workbook dan worksheet
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName)

    // Set properties workbook
    workbook.creator = options.creator || 'Vue App'
    workbook.lastModifiedBy = options.lastModifiedBy || 'Vue App'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Ambil headers dari object pertama
    const headers = Object.keys(data[0])

    // Set header columns
    worksheet.columns = headers.map((header) => ({
      header: options.headerMapping?.[header] || header.toUpperCase(),
      key: header,
      width: options.columnWidth || 15,
    }))

    // FIXED: Style untuk header - hanya untuk kolom yang memiliki data
    const headerRow = worksheet.getRow(1)

    // Style hanya untuk cell yang memiliki header (bukan seluruh row)
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1) // Excel columns start from 1
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: options.headerColor || '366092' },
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })

    headerRow.height = options.headerHeight || 25

    // Add data rows
    data.forEach((item, index) => {
      const row = worksheet.addRow(item)

      // Alternating row colors - hanya untuk kolom dengan data
      if (options.alternateRows && index % 2 === 1) {
        headers.forEach((header, colIndex) => {
          const cell = row.getCell(colIndex + 1)
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: options.alternateColor || 'F2F2F2' },
          }
        })
      }

      // Set row height
      if (options.rowHeight) {
        row.height = options.rowHeight
      }
    })

    // Auto-fit columns jika diminta
    if (options.autoFit) {
      worksheet.columns.forEach((column) => {
        let maxLength = 0
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10
          if (columnLength > maxLength) {
            maxLength = columnLength
          }
        })
        column.width = Math.min(Math.max(maxLength + 2, 10), 50) // Min 10, Max 50
      })
    }

    // FIXED: Add borders ke semua cells - hanya untuk area dengan data
    if (options.addBorders !== false) {
      const borderStyle = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      }

      // Apply borders only to data area (headers + data rows)
      for (let rowIndex = 1; rowIndex <= data.length + 1; rowIndex++) {
        const row = worksheet.getRow(rowIndex)
        headers.forEach((header, colIndex) => {
          const cell = row.getCell(colIndex + 1)
          cell.border = borderStyle
          cell.alignment = { vertical: 'middle' }
        })
      }
    }

    // Freeze header row jika diminta
    if (options.freezeHeader !== false) {
      worksheet.views = [{ state: 'frozen', ySplit: 1 }]
    }

    // Add filter ke header - hanya untuk area dengan data
    if (options.addFilter) {
      const lastColumn = String.fromCharCode(64 + headers.length)
      worksheet.autoFilter = {
        from: 'A1',
        to: `${lastColumn}1`,
      }
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      buffer,
      filename: `${filename}.xlsx`,
      success: true,
      message: 'File Excel berhasil dibuat',
      rowCount: data.length,
    }
  } catch (error) {
    console.error('Error saat export ke Excel:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Download file Excel di browser
 * @param {Buffer} buffer - Buffer dari Excel file
 * @param {string} filename - Nama file
 */
export function downloadExcelFile(buffer, filename = `exported_${new Date().toISOString()}`) {
  try {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

    return true
  } catch (error) {
    console.error('Error saat download file:', error)
    return false
  }
}

/**
 * Export multiple sheets untuk Vue.js
 * @param {Array} sheetsData - Array berisi data untuk multiple sheets
 * @param {string} filename - Nama file Excel
 */
export async function exportMultipleSheets(sheetsData, filename = 'multi_export') {
  try {
    const workbook = new ExcelJS.Workbook()

    workbook.creator = 'Vue App'
    workbook.created = new Date()

    for (const sheetInfo of sheetsData) {
      const { data, sheetName, options = {} } = sheetInfo

      if (!data || data.length === 0) continue

      const worksheet = workbook.addWorksheet(sheetName)
      const headers = Object.keys(data[0])

      // Set columns
      worksheet.columns = headers.map((header) => ({
        header: options.headerMapping?.[header] || header.toUpperCase().replace(/_/g, ' '),
        key: header,
        width: options.columnWidth || 15,
      }))

      // FIXED: Style header - hanya untuk kolom dengan data
      const headerRow = worksheet.getRow(1)
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1)
        cell.font = { bold: true, color: { argb: 'FFFFFF' } }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: options.headerColor || '366092' },
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      })

      // Add data
      data.forEach((item, index) => {
        const row = worksheet.addRow(item)

        if (options.alternateRows && index % 2 === 1) {
          headers.forEach((header, colIndex) => {
            const cell = row.getCell(colIndex + 1)
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: options.alternateColor || 'F2F2F2' },
            }
          })
        }
      })

      // FIXED: Add borders - hanya untuk area dengan data
      if (options.addBorders !== false) {
        const borderStyle = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }

        for (let rowIndex = 1; rowIndex <= data.length + 1; rowIndex++) {
          const row = worksheet.getRow(rowIndex)
          headers.forEach((header, colIndex) => {
            const cell = row.getCell(colIndex + 1)
            cell.border = borderStyle
          })
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer()

    return {
      buffer,
      filename: `${filename}.xlsx`,
      success: true,
      sheetCount: sheetsData.length,
    }
  } catch (error) {
    console.error('Error saat export multiple sheets:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Format data untuk export (helper function)
 * @param {Array} rawData - Raw data dari API/database
 * @param {Object} fieldMapping - Mapping field names
 * @param {Array} excludeFields - Fields yang tidak ingin di-export
 */
export function formatDataForExport(rawData, fieldMapping = {}, excludeFields = []) {
  const toast = useToast()
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    toast.error('Error Export Data', 'formatDataForExport: rawData is empty or not an array')
    return []
  }
  return rawData.map((item) => {
    const formatted = {}

    Object.keys(item).forEach((key) => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return

      // Use mapped field name or original
      const fieldName = fieldMapping[key] || key

      // Format value
      let value = item[key]

      // Format dates
      if (value instanceof Date) {
        value = value.toLocaleDateString('id-ID')
      }
      // Handle null/undefined
      else if (value === null || value === undefined) {
        value = ''
      }

      formatted[fieldName] = value
    })

    return formatted
  })
}