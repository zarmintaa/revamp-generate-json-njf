<!-- generateTransaction.vue -->

<script setup>
import { useFileUpload } from '@/composables/useFileUpload'
import { useToast } from '@/composables/useToast'
import { useTableData } from '@/composables/useTableData'
import { Utils } from '@/utils/doc-utils'
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Properties from '@/components/common/generator/properties/Properties.vue'
import PropertiesItem from '@/components/common/generator/properties/PropertiesItem.vue'
import TableView from '@/components/dynamic/TableView.vue'
import { debounce } from '@/utils/debounce.js'
import { aitParameter, aitParameterTransform } from '@/utils/data-ait'
import { transactionMapper } from '@/composables/useTransactionMapper'

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

    if (value && (typeof value === 'string' || typeof value === 'number')) {
      return value //.toLowerCase()
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
      const docNoAppTransaction = Utils.generateDocNoApp('A')
      // console.log('Loop contract ' + docNoAppTransaction)
      transforms.forEach((transform) => {
        let dataTransform = null
        // console.log('Loop mapper ' + docNoAppTransaction)
        dataTransform = transactionMapper(
          contract,
          transform,
          getContractNumber(contract),
          instalment.value,
          docNoAppTransaction,
          dateTransaction.value,
          amountPokok.value,
          amountBunga.value,
        )

        if (dataTransform) {
          data.push(dataTransform)
        }

        if (!transform.isOptional && dataTransform === null) {
          toast.warning(
            'Mapping AIT',
            `Data aitCode ${transform.aitCode} lineGt : ${transform.lineGt} not available for transaction generation`,
          )
        }
      })
    })

    transactions.value = data
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
  [aitParam, dateTransaction, instalment, amountPokok, amountBunga, showParameter],
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
}, 500)

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

// TableView configuration for transactions
const transactionTransformConfig = {
  excludeKeys: ['uuid'],
  includeKeys: [
    // 'aitCode',
    // 'lineGt',
    // 'docNoApp',
    // 'postingDate',
    // 'amount',
    // 'costCenter',
    // 'assignment',
    // 'refKeyL1',
  ],
  dataTransformer: (transaction) => {
    return {
      uuid: `${transaction.AIT_CODE}-${transaction.AIT_LINE_GT}-${Math.random()}`, // Generate unique ID for TableView
      aitCode: transaction.AIT_CODE,
      lineGt: transaction.AIT_LINE_GT,
      docNoApp: transaction.AIT_DOC_NO_APP,
      postingDate: transaction.AIT_POSTING_DATE,
      // amount: Number(transaction.AIT_AMOUNT1).toLocaleString('id-ID'),
      amount: transaction.AIT_AMOUNT1, // Keep raw amount for sorting
      costCenter: transaction.AIT_COST_CENTER,
      assignment: transaction.AIT_ASSIGNTMENT,
      refKeyL1: transaction.AIT_REF_KEY_L1,
    }
  },
}

const {
  tableItems: transactionTableItems,
  rawKeys: transactionRawKeys,
  headers: transactionHeaders,
} = useTableData(transactions, transactionTransformConfig)

// Event handlers for transaction table
const handleTransactionRowClick = (row) => {
  toast.success('Transaction Info', `AIT Code: ${row.aitCode}, Amount: ${row.amount}`, 2000)
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
            <h6 class="fw-semibold">Upload Contract Data</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-12">
                <div class="">
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

        <!-- Generated Transactions Table using TableView -->
        <div v-if="transactions.length > 0" class="card shadow-sm">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">
                <i class="fas fa-receipt me-2"></i>
                Generated Transactions
                <span class="badge bg-success text-light ms-2"
                  >{{ transactions.length }} records</span
                >
              </h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" @click="debouncedGenerateTransactions">
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
          <div class="card-body px-4">
            <TableView
              :items="transactionTableItems"
              :t-key="transactionRawKeys"
              :t-header="transactionHeaders"
              :items-per-page="10"
              :loading="isGenerating"
              :on-row-click="handleTransactionRowClick"
              :enable-keyboard-navigation="true"
            >
              <!-- Custom slot for AIT Code column -->
              <template #cell(aitCode)="{ value }">
                <span class="fw-medium text-dark">{{ value }}</span>
              </template>

              <!-- Custom slot for amount column -->
              <template #cell(amount)="{ item, value }">
                <div class="text-start">
                  <strong class="fw-bold">{{ value }}</strong>
                </div>
              </template>

              <!-- Custom slot for assignment column -->
              <template #cell(assignment)="{ value }">
                <code class="fw-medium text-dark bg-light px-2 py-1 rounded">{{ value }}</code>
              </template>
            </TableView>
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
                Tip: Make sure your file contains columns like 'cont_no', 'instalment', 'pokok',
                'bunga', 'sold', 'expense', 'denda'
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
