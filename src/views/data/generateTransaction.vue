<script setup>
import { useFileUpload } from '@/composables/useFileUpload'
import { useToast } from '@/composables/useToast'
import { formatReadableDate } from '@/utils/dayjs'
import { Utils } from '@/utils/doc-utils'
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Properties from '@/components/common/generator/properties/Properties.vue'
import PropertiesItem from '@/components/common/generator/properties/PropertiesItem.vue'
import { debounce } from '@/utils/debounce.js'

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
  {
    aitCode: 'F0030002',
    lineGt: 10,
    amountType: 'DENDA',
    isOptional: true,
  },
  {
    aitCode: 'F0030002',
    lineGt: 1,
    amountType: 'SOLD',
    isOptional: true,
  },
  {
    aitCode: 'F0030002',
    lineGt: 2,
    amountType: 'SOLD',
    isOptional: true,
  },
  {
    aitCode: 'F0030002',
    lineGt: 17,
    amountType: 'EXPENSE',
    isOptional: true,
  },
  {
    aitCode: 'F0030002',
    lineGt: 18,
    amountType: 'EXPENSE',
    isOptional: true,
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
const amountPokok = ref(1000000)
const amountBunga = ref(200000)

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

const showParameter = computed(() => {
  return getAllParameter(aitParam.value)
})

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

// Create debounced version of generateTransactions function
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
        // console.log({ transform })
        let transactionAmount = null
        let dataTransform = null
        if (!transform.isOptional) {
          if (!transform.isOptional) {
            transactionAmount = contract.amount || amountPokok.value || 1000000
            let transactionAmountBunga = amountBunga.value || transactionAmount * 0.2

            if (transform.amountType.trim() === 'BUNGA') {
              transactionAmount = transactionAmountBunga
            }
          }

          dataTransform = getFormatTransaction(
            transform.aitCode,
            transform.lineGt,
            getContractNumber(contract),
            docNoApp.value,
            formatDate(dateTransaction.value),
            '000',
            contract.instalment || instalment.value,
            transactionAmount,
          )
          data.push(dataTransform)
        }

        if (dataTransform === null || transactionAmount === null) {
          toast.info('Mapping AIT', 'Data not available for transaction generation')
        }
      })
    })

    transactions.value = data
    // console.log('Generated transactions:', data)
  } finally {
    isGenerating.value = false
  }
}

// Create debounced version of generateTransactions with 500ms delay
const debouncedGenerateTransactions = debounce(generateTransactions, 500)

// Debounce for handling file processing to prevent multiple rapid calls
const handleProcessFile = debounce(async () => {
  await processFile()
}, 300)

// Debounce for contract data normalization
const debouncedNormalizeContractData = debounce((rawData) => {
  uploadedContracts.value = normalizeContractData(rawData)

  // Generate transactions after contract data is normalized
  if (uploadedContracts.value.length > 0) {
    nextTick(() => {
      debouncedGenerateTransactions()
    })
  }
}, 300)

// Watch for file data changes with debouncing
watch(
  fileData,
  (newFileData) => {
    if (newFileData && newFileData.data) {
      debouncedNormalizeContractData(newFileData.data)
    }
  },
  { deep: true },
)

// Watch for parameter changes with debouncing
watch(
  [aitParam, dateTransaction, instalment, amountPokok, amountBunga],
  () => {
    if (uploadedContracts.value.length > 0) {
      debouncedGenerateTransactions()
    }
  },
  { deep: true },
)

// Watch for uploaded contracts changes with debouncing
watch(
  uploadedContracts,
  () => {
    if (uploadedContracts.value.length > 0) {
      debouncedGenerateTransactions()
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

// Debounce export function to prevent multiple rapid exports
const exportToExcelHandler = debounce(async () => {
  if (!transactions.value.length) {
    alert('No transactions to export')
    toast.warning('Warning', 'No transactions to export')
    return
  }
  const fileName = `transaction_${dateTransaction.value}-${generateUniqueIdWithDate()}.xlsx`
  const data = await exportToExcel(formatDataForExport(transactions.value), fileName)
  downloadExcelFile(data.buffer, fileName)
}, 500)

// Debounced input handlers for form fields
const handleAitParamChange = debounce((value) => {
  aitParam.value = value
}, 200)

const handleDateChange = debounce((value) => {
  dateTransaction.value = value
}, 500)

const handleInstalmentChange = debounce((value) => {
  instalment.value = value
}, 500)

const handleAmountPokokChange = debounce((value) => {
  amountPokok.value = value
}, 500)

const handleAmountBungaChange = debounce((value) => {
  amountBunga.value = value
}, 500)
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
                    :value="aitParam"
                    @change="handleAitParamChange($event.target.value)"
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
                    :value="dateTransaction"
                    @input="handleDateChange($event.target.value)"
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
                    :value="instalment"
                    @input="handleInstalmentChange(parseInt($event.target.value))"
                    class="form-control"
                    min="1"
                    required
                  />
                  <div class="form-text">
                    <small class="text-muted">Will be overridden by file data if available</small>
                  </div>
                </div>

                <!-- Amount Pokok -->
                <div class="col-md-4 mb-3">
                  <label for="amount-pokok-input" class="form-label fw-semibold">
                    <i class="fas fa-money-bill me-1"></i>
                    Default Amount Pokok
                  </label>
                  <input
                    type="number"
                    id="amount-pokok-input"
                    name="amount-pokok"
                    :value="amountPokok"
                    @input="handleAmountPokokChange(parseInt($event.target.value))"
                    class="form-control"
                    min="1"
                    required
                  />
                  <div class="form-text">
                    <small class="text-muted">Will be overridden by file data if available</small>
                  </div>
                </div>

                <!-- Amount Bunga -->
                <div class="col-md-4 mb-3">
                  <label for="amount-bunga-input" class="form-label fw-semibold">
                    <i class="fas fa-percentage me-1"></i>
                    Default Amount Bunga
                  </label>
                  <input
                    type="number"
                    id="amount-bunga-input"
                    name="amount-bunga"
                    :value="amountBunga"
                    @input="handleAmountBungaChange(parseInt($event.target.value))"
                    class="form-control"
                    min="1"
                    required
                  />
                  <div class="form-text">
                    <small class="text-muted">Will be overridden by file data if available</small>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <Properties title="AIT Configuration">
              <PropertiesItem input-label="Event" :input-properties="showParameter.event" />
              <PropertiesItem input-label="AIT CODE" :input-properties="showParameter.aitCode" />
              <PropertiesItem
                input-label="Description"
                :input-properties="showParameter.description"
              />
            </Properties>

            <div v-if="showParameter" class="card shadow-sm">
              <div class="card-body p-0">
                <div class="table-responsive" style="max-height: 500px">
                  <table class="table table-hover mb-0">
                    <thead class="sticky-top">
                      <tr>
                        <th scope="col">No</th>
                        <th scope="col">AIT Code</th>
                        <th scope="col">Line GT</th>
                        <th scope="col">Amount Type</th>
                        <th scope="col">Is Optional</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(ait, index) in showParameter.transforms" :key="index">
                        <td class="fw-medium">{{ index + 1 }}</td>
                        <td>
                          <span class="fw-medium">{{ ait.aitCode }}</span>
                        </td>
                        <td>{{ ait.lineGt }}</td>
                        <td>
                          <span class="fw-medium">{{ ait.amountType }}</span>
                        </td>
                        <td>{{ ait.isOptional === true ? 'YES' : 'NO' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <!-- File Upload Section -->
          <div class="card-header">
            <h6 class="fw-semibold">
              <i class="fas fa-upload"></i>
              Upload Contract Data
            </h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-12">
                <div class="border rounded p-3 bg-light">
                  <form @submit.prevent>
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
                          type="submit"
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
                  </form>

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
          </div>
        </div>

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
                <button class="btn btn-outline-secondary" @click="debouncedGenerateTransactions">
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
