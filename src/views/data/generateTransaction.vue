<script setup>
import { useFileUpload } from '@/composables/useFileUpload'
import { useToast } from '@/composables/useToast'
import { formatReadableDate } from '@/utils/dayjs'
import { Utils } from '@/utils/doc-utils'
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Generate Transaction'

const {
  fileInput,
  fileName,
  fileData,
  errorMessage,
  isFileNotReady,
  isProses,
  fileType,
  handleFileChange,
  processFile,
} = useFileUpload()

const aitParameter = [
  {
    id: 'A001',
    event: 'Angsuran',
    aitCode: 'F0000002',
    description: 'SETTLEMENT ANGSURAN',
  },
  {
    id: 'A002',
    event: 'Angsuran',
    aitCode: 'F0000003',
    description: 'OVERBOOK TO AR',
  },
  {
    id: 'A003',
    event: 'Cancel Angsuran',
    aitCode: 'F1000002',
    description: 'REVERSAL ANGSURAN',
  },
  {
    id: 'A004',
    event: 'Cancel Angsuran',
    aitCode: 'F1000003',
    description: 'OVERBOOK TO TITIPAN',
  },
  {
    id: 'A005',
    event: 'Pelunasan ET',
    aitCode: 'F0000004',
    description: 'PRETERM',
  },
  {
    id: 'A006',
    event: 'Pelunasan IC',
    aitCode: 'F0000005',
    description: 'KLAIM ASURANSI',
  },
  {
    id: 'A007',
    event: 'Cancel Pelunasan ET',
    aitCode: 'F1000004',
    description: 'CANCEL PRETERM',
  },
  {
    id: 'A008',
    event: 'Cancel Pelunasan IC',
    aitCode: 'F1000005',
    description: 'CANCEL CLAIM',
  },
  {
    id: 'A009',
    event: 'Repossess Asset Sold',
    aitCode: 'F0030002',
    description: 'SOLD REPO',
  },
]

const aitParameterTransform = [
  {
    aitCode: 'F0000002',
    lineGt: 2,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F0000002',
    lineGt: 3,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F0000003',
    lineGt: 2,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F0000003',
    lineGt: 3,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F1000002',
    lineGt: 2,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F1000002',
    lineGt: 3,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F1000003',
    lineGt: 2,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F1000003',
    lineGt: 3,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F0000004',
    lineGt: 6,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F0000004',
    lineGt: 8,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F0000005',
    lineGt: 6,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F0000005',
    lineGt: 8,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F1000004',
    lineGt: 6,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F1000004',
    lineGt: 8,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F1000005',
    lineGt: 6,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F1000005',
    lineGt: 8,
    amountType: 'BUNGA',
    isOptional: false,
  },
  {
    aitCode: 'F0030002',
    lineGt: 6,
    amountType: 'POKOK',
    isOptional: false,
  },
  {
    aitCode: 'F0030002',
    lineGt: 8,
    amountType: 'BUNGA',
    isOptional: false,
  },
]

const aitParameterRef = ref(aitParameter)
const aitParamaterTransformRef = ref(aitParameterTransform)

const aitParam = ref('A001')
const dateTransaction = ref(new Date().toISOString().split('T')[0])
const instalment = ref(1)
const transactions = ref([])
const uploadedContracts = ref([])
const isGenerating = ref(false)
const toast = useToast()
const docNoApp = ref(Utils.generateDocNoApp('A'))

const getAllParameter = (id) => {
  const aitParam = aitParameterRef.value.find((param) => param.id === id)

  if (!aitParam) {
    console.warn(`AIT Parameter dengan ID ${id} tidak ditemukan`)
    toast.error('Error', `AIT Parameter dengan ID ${id} tidak ditemukan`)
    return null
  }

  const transformData = aitParamaterTransformRef.value.filter(
    (transform) => transform.aitCode === aitParam.aitCode,
  )

  if (!transformData || transformData.length === 0) {
    toast.error('Error', `AIT Code dengan code ${aitParam.aitCode} tidak ditemukan`)
    console.warn(`AIT Code dengan code ${aitParam.aitCode} tidak ditemukan`)
    return null
  }

  return {
    ...aitParam,
    transforms: transformData,
    hasTransform: transformData.length > 0,
    transformCount: transformData.length,
  }
}

const getFormatTransaction = (
  aitCode,
  aitLineGt,
  contract,
  docNoApp = Utils.generateDocNoApp('A'),
  postingDate = formatReadableDate(new Date().toLocaleDateString()),
  costCenter = '000',
  instalment = 1,
  amount,
) => {
  return {
    AIT_CODE: aitCode,
    AIT_LINE_GT: aitLineGt,
    AIT_DOC_NO_APP: docNoApp,
    AIT_POSTING_DATE: postingDate,
    AIT_AMOUNT1: amount,
    AIT_COST_CENTER: costCenter,
    AIT_ASSIGNTMENT: contract,
    AIT_REF_KEY_L1: instalment,
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return year + month + day
}

const normalizeHeaders = (headers) => {
  const headerMap = {
    CONT_NO: 'cont_no',
    CONTRACT_NUMBER: 'contract_number',
    CONTRACT: 'contract',
    FUND_CONT_NO: 'fund_cont_no',
    AREC_CONT_NO: 'arec_cont_no',
    INSTALMENT: 'instalment',
    AMOUNT: 'amount',
    AIT_AMOUNT1: 'ait_amount1',
    AIT_ASSIGNTMENT: 'ait_assigntment',
  }

  return headers.map((header) => headerMap[header.toUpperCase()] || header.toLowerCase())
}

const getContractNumber = (contract) => {
  const possibleFields = [
    'cont_no',
    'contract_number',
    'contract',
    'fund_cont_no',
    'arec_cont_no',
    'ait_assigntment',
  ]

  for (const field of possibleFields) {
    const value = contract[field]

    if (value && typeof value === 'string') {
      return value.toLowerCase()
    }
  }

  return 'unknown_contract'
}

const getContractNumberCompact = (contract) => {
  return (
    contract.cont_no?.toLowerCase() ||
    contract.contract_number?.toLowerCase() ||
    contract.contract?.toLowerCase() ||
    contract.fund_cont_no?.toLowerCase() ||
    contract.arec_cont_no?.toLowerCase() ||
    'unknown_contract'
  )
}

const normalizeContractData = (rawData) => {
  if (!rawData || !rawData.length) return []

  const headers = Object.keys(rawData[0])
  const normalizedHeaders = normalizeHeaders(headers)

  return rawData.map((row) => {
    const normalizedRow = {}
    headers.forEach((originalHeader, index) => {
      normalizedRow[normalizedHeaders[index]] = row[originalHeader]
    })
    return normalizedRow
  })
}

const generateTransactions = () => {
  if (!uploadedContracts.value.length) {
    console.warn('No contracts available for transaction generation')
    toast.error('Error', 'No contracts available for transaction generation')
    return
  }

  isGenerating.value = true

  try {
    const paramData = getAllParameter(aitParam.value)
    if (!paramData) {
      console.error('Invalid AIT parameter')
      toast.error('Error', 'Invalid AIT parameter')
      return
    }

    const { transforms } = paramData
    let data = []
    docNoApp.value = ref(Utils.generateDocNoApp('A'))

    uploadedContracts.value.forEach((contract) => {
      transforms.forEach((transform) => {
        let transactionAmount = contract.amount || 1000000

        if (transform.amountType.trim() === 'BUNGA') {
          transactionAmount = transactionAmount * 0.2
        }

        data.push(
          getFormatTransaction(
            transform.aitCode,
            transform.lineGt,
            getContractNumber(contract),
            docNoApp.value,
            formatDate(dateTransaction.value),
            '000',
            contract.instalment || instalment.value,
            transactionAmount,
          ),
        )
      })
    })

    transactions.value = data
    // console.log('Generated transactions:', data)
  } finally {
    isGenerating.value = false
  }
}

const handleProcessFile = async () => {
  await processFile()
}

// Watch for file data changes
watch(
  fileData,
  (newFileData) => {
    if (newFileData && newFileData.data) {
      uploadedContracts.value = normalizeContractData(newFileData.data)
      // console.log('Uploaded contracts:', newFileData.data)
    }
  },
  { deep: true },
)

// Watch for parameter changes to regenerate transactions
watch(
  [aitParam, dateTransaction, instalment, uploadedContracts],
  () => {
    if (uploadedContracts.value.length > 0) {
      generateTransactions()
    }
  },
  { deep: true },
)

const selectedParameter = computed(() => {
  return aitParameterRef.value.find((param) => param.id === aitParam.value)
})

function generateUniqueIdWithDate() {
  const timestamp = Date.now().toString(36)
  const randomString = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomString}`
}

const exportToExcelHandler = async () => {
  if (!transactions.value.length) {
    alert('No transactions to export')
    toast.warning('Warning', 'No transactions to export')
    return
  }
  const fileName = `transaction_${dateTransaction.value}-${generateUniqueIdWithDate()}.xlsx`
  const data = await exportToExcel(formatDataForExport(transactions.value), fileName)
  downloadExcelFile(data.buffer, fileName)
}
</script>

<template>
  <section>
    <div class="row">
      <div class="col-12">
        <!-- Form Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-cog me-2"></i>
              Transaction Configuration
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="generateTransactions">
              <div class="row">
                <!-- Event Transaction -->
                <div class="col-md-4 mb-3">
                  <label for="event-select" class="form-label fw-semibold">
                    <i class="fas fa-tags me-1"></i>
                    Pilih Event Transaksi
                  </label>
                  <select
                    id="event-select"
                    name="event"
                    v-model="aitParam"
                    class="form-select"
                    required
                  >
                    <option value="" disabled>-- Pilih Event --</option>
                    <option v-for="item in aitParameterRef" :key="item.id" :value="item.id">
                      {{ item.event }} - {{ item.description }}
                    </option>
                  </select>
                  <div v-if="selectedParameter" class="form-text">
                    <small class="text-info">
                      <i class="fas fa-info-circle me-1"></i>
                      Code: {{ selectedParameter.aitCode }}
                    </small>
                  </div>
                </div>

                <!-- Transaction Date -->
                <div class="col-md-4 mb-3">
                  <label for="date-transaction" class="form-label fw-semibold">
                    <i class="fas fa-calendar-alt me-1"></i>
                    Pilih Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    id="date-transaction"
                    name="date-transaction"
                    v-model="dateTransaction"
                    class="form-control"
                    required
                  />
                </div>

                <!-- Instalment -->
                <div class="col-md-4 mb-3">
                  <label for="instalment-input" class="form-label fw-semibold">
                    <i class="fas fa-list-ol me-1"></i>
                    Default Instalment
                  </label>
                  <input
                    type="number"
                    id="instalment-input"
                    name="instalment"
                    v-model="instalment"
                    class="form-control"
                    min="1"
                    required
                  />
                  <div class="form-text">
                    <small class="text-muted">Will be overridden by file data if available</small>
                  </div>
                </div>
              </div>

              <!-- File Upload Section -->
              <div class="row">
                <div class="col-12">
                  <div class="border rounded p-3 bg-light">
                    <h6 class="fw-semibold mb-3">
                      <i class="fas fa-upload"></i>
                      Upload Contract Data
                    </h6>

                    <div class="mb-3">
                      <div class="input-group">
                        <input
                          :accept="fileType === 'JSON' ? '.json' : '.xlsx, .xls, .xlsm'"
                          class="form-control"
                          type="file"
                          @change="handleFileChange"
                          :disabled="isProses"
                        />
                        <button
                          :disabled="isFileNotReady || isProses"
                          class="btn btn-outline-primary"
                          type="button"
                          @click="handleProcessFile"
                        >
                          <span v-if="isProses" class="d-flex align-items-center">
                            <span
                              class="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Processing...
                          </span>
                          <span v-else>
                            <i class="fas fa-play me-1"></i>
                            Process
                          </span>
                        </button>
                      </div>

                      <div v-if="fileName && !isProses" class="form-text mt-2">
                        <i class="fas fa-file-check text-success me-1"></i>
                        Selected: <strong>{{ fileName }}</strong>
                      </div>
                    </div>

                    <div v-if="errorMessage" class="alert alert-danger">
                      <i class="fas fa-exclamation-triangle me-2"></i>
                      {{ errorMessage }}
                    </div>

                    <div v-if="fileData" class="alert alert-success">
                      <i class="fas fa-check-circle me-2"></i>
                      File processed successfully!
                      <strong>{{ fileData.data.length }}</strong> records loaded.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <!-- <div class="row mt-4">
                <div class="col-12">
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      :disabled="!uploadedContracts.length || isGenerating"
                      class="btn btn-primary"
                      @click="generateTransactions"
                    >
                      <span v-if="isGenerating">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Generating...
                      </span>
                      <span v-else>
                        <i class="fas fa-cogs me-1"></i>
                        Generate Transactions
                      </span>
                    </button>

                    <button
                      type="button"
                      :disabled="!transactions.length"
                      class="btn btn-success"
                      @click="exportToExcelHandler"
                    >
                      <i class="fas fa-download me-1"></i>
                      Export to Excel
                    </button>
                  </div>
                </div>
              </div> -->
            </form>
          </div>
        </div>

        <!-- Results Table
        <div v-if="uploadedContracts.length > 0" class="card shadow-sm mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-table me-2"></i>
              Uploaded Contract Data
              <span class="badge bg-primary text-light ms-2"
                >{{ uploadedContracts.length }} records</span
              >
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive" style="max-height: 300px">
              <table class="table table-striped table-hover mb-0">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col" v-for="(header, index) in fileData?.headers || []" :key="index">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(contract, index) in uploadedContracts" :key="index">
                    <td class="fw-medium">{{ index + 1 }}</td>
                    <td v-for="(header, headerIndex) in fileData?.headers || []" :key="headerIndex">
                      <span v-if="contract[header] !== null && contract[header] !== undefined">
                        {{ contract[header] }}
                      </span>
                      <span v-else class="text-muted fst-italic">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> -->

        <!-- Generated Transactions Table -->
        <div v-if="transactions.length > 0" class="card shadow-sm">
          <div class="card-header bg-success">
            <h5 class="card-title mb-0">
              <i class="fas fa-receipt me-2"></i>
              Generated Transactions
              <span class="badge bg-light text-dark ms-2">{{ transactions.length }} records</span>
            </h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive" style="max-height: 500px">
              <table class="table table-striped table-hover mb-0">
                <thead class="sticky-top">
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">AIT Code</th>
                    <th scope="col">Line GT</th>
                    <th scope="col">Doc No App</th>
                    <th scope="col">Posting Date</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Cost Center</th>
                    <th scope="col">Assignment</th>
                    <th scope="col">Ref Key L1</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(transaction, index) in transactions" :key="index">
                    <td class="fw-medium">{{ index + 1 }}</td>
                    <td>
                      <span class="fw-medium">{{ transaction.AIT_CODE }}</span>
                    </td>
                    <td>{{ transaction.AIT_LINE_GT }}</td>
                    <td>
                      <span class="fw-medium">{{ transaction.AIT_DOC_NO_APP }}</span>
                    </td>
                    <td>{{ transaction.AIT_POSTING_DATE }}</td>
                    <td class="fw-medium">
                      <strong>{{ Number(transaction.AIT_AMOUNT1).toLocaleString('id-ID') }}</strong>
                    </td>
                    <td>{{ transaction.AIT_COST_CENTER }}</td>
                    <td>
                      <code class="fw-medium text-dark">{{ transaction.AIT_ASSIGNTMENT }}</code>
                    </td>
                    <td>{{ transaction.AIT_REF_KEY_L1 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer bg-light">
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                Showing {{ transactions.length }} generated transactions
              </small>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" @click="generateTransactions">
                  <i class="fas fa-sync-alt me-1"></i>
                  Refresh
                </button>
                <button class="btn btn-outline-success" @click="exportToExcelHandler">
                  <i class="fas fa-file-excel me-1"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!uploadedContracts.length && !transactions.length" class="card shadow-sm">
          <div class="card-body text-center py-5">
            <div class="mb-4">
              <i class="fas fa-file-upload text-muted" style="font-size: 4rem"></i>
            </div>
            <h5 class="text-muted mb-3">No Data Available</h5>
            <p class="text-muted mb-4">
              Please upload an Excel file containing contract data to generate transactions.
            </p>
            <div class="text-muted">
              <small>
                <i class="fas fa-lightbulb me-1"></i>
                Tip: Make sure your file contains columns like 'cont_no', 'instalment', and 'amount'
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
