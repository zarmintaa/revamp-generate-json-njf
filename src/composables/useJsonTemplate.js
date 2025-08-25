// composables/useJsonTemplate.js
import { ref, computed } from 'vue'
import { useToast } from './useToast'

export function useJsonTemplate() {
  const isPreviewJsonTemplate = ref(false)
  const copyStatus = ref('')

  // Generic template generator - bisa di-override untuk template yang berbeda
  const generateTemplate = (config, fileData = null) => {
    const { docNo, jsonName, sourceSystem, nik } = config

    let msgContent = []
    let templateJson = {}
    let dataTrx = []
    if (fileData?.value) {
      msgContent = fileData.value.data.map((record) => JSON.stringify({ data: { ...record } }))
      dataTrx = fileData.value
    }

    if (jsonName === 'MASTER' || jsonName === 'SCHD' || jsonName === 'RC_SCHD' || jsonName === 'RESCHD' || jsonName === 'CANCEL_PPD') {
      templateJson = {
        data: [
          {
            fastSeqNo: '1',
            msgContent,
            jsonName,
            sourceSystem,
            senderDocNo: docNo,
          },
        ],
      }
    }

    if (jsonName === 'TRX-FAST') {
      let totalRow = 0
      let totalAmount = 0
      if (dataTrx.data) {
        totalRow = dataTrx.data.length
        if (totalRow > 0) {
          dataTrx.data.forEach((item) => {
            if (item.AIT_AMOUNT1) {
              totalAmount += +item.AIT_AMOUNT1
            } else {
              totalAmount += 0
            }
          })
        } else {
          totalAmount = 0
        }
      }

      templateJson = {
        docNoApp: docNo,
        jumlahRow: totalRow,
        jumlahAmount: totalAmount,
        useNik: nik,
        data: dataTrx.data || [],
      }
    }

    return templateJson
  }

  const downloadJson = (templateData, fileType = 'EXCEL') => {
    if (!templateData) {
      throw new Error('No template data available for download')
    }

    const blob = new Blob([JSON.stringify(templateData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export_${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (templateData) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(templateData, null, 2))
      copyStatus.value = 'Copied!'
      setTimeout(() => {
        copyStatus.value = ''
      }, 2000)
      // toast.info('File Processing', 'File success')
      // toast.success('Copy Text', 'Success copied text', 3000)
    } catch (err) {
      copyStatus.value = 'Failed to copy'
      setTimeout(() => {
        copyStatus.value = ''
      }, 2000)
    }
  }

  const handlePreviewJsonTemplate = () => {
    isPreviewJsonTemplate.value = !isPreviewJsonTemplate.value
  }

  return {
    // State
    isPreviewJsonTemplate,
    copyStatus,

    // Methods
    generateTemplate,
    downloadJson,
    copyToClipboard,
    handlePreviewJsonTemplate,
  }
}
