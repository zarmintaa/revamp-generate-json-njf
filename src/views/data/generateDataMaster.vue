<script setup>
import { useRoute } from 'vue-router'
import { ref, reactive, computed, onMounted } from 'vue'
import { allFieldMapping } from '@/utils/fieldMapping.js'
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport.js'
import { useToast } from '@/composables/useToast.js'
import { getCryptoRandom } from '@/utils/getCryptoRandom.js'
import { useVehicleGenerator } from '@/utils/vehicleNumberGenerator'
import { mapBatchToFormData } from '@/utils/vehicleNumberGenerator'

const route = useRoute()
const title = route.meta?.title || 'Generate Master PPD'
const { generateForPKs } = useVehicleGenerator()

/* STATE NEW PPD */
const allFields = allFieldMapping

// Form state
const formData = reactive({})
const errors = reactive({})
const isSubmitting = ref(false)
const showDebug = ref(true)

// Field customization state
const selectedFields = ref(new Set())

// Generate PK state
const branchCode = ref('0101')
const year = ref(new Date().getFullYear())
const quantity = ref(10)

// Bulk generation state
const isGenerating = ref(false)
const generatedData = ref([])
const generationProgress = ref(0)

const toast = useToast()
let sequenceCounter = Date.now() % 1000000

// Generate PK Numbers
const generateDummyDataMaster = () => {
  const results = new Set()
  let sequence = 0
  const totalPk = quantity.value

  for (let i = 0; i < totalPk; i++) {
    const microTime = (performance.now() * 1000).toString().replace('.', '').slice(-6)
    const cryptoRandom = getCryptoRandom(4)
    const counter = (sequenceCounter++).toString().padStart(2, '0').slice(-2)

    const mixed = (microTime + cryptoRandom + counter).slice(-6)
    const pkNumber = branchCode.value + year.value + mixed
    sequence++

    results.add({ sequence, pkNumber })

    if (i % 100 === 0) {
      const now = Date.now()
      while (Date.now() - now < 1) {
        /* tiny delay */
      }
    }
  }

  return Array.from(results)
}

// ⭐ Generate Bulk PK + Vehicle Numbers
const handleGenerateBulk = () => {
  if (quantity.value < 1 || quantity.value > 10000) {
    toast.error('Jumlah harus antara 1 sampai 10.000')
    return
  }

  if (!branchCode.value || branchCode.value.length !== 4) {
    toast.error('Kode cabang harus 4 digit')
    return
  }

  isGenerating.value = true
  generationProgress.value = 0

  try {
    const pkNumbers = generateDummyDataMaster()

    const result = generateForPKs(pkNumbers, 'USER001', 'car', 'Toyota', (progress) => {
      generationProgress.value = progress.progress
    })

    if (result.success) {
      generatedData.value = mapBatchToFormData(result.data)

      toast.success(`Berhasil generate ${generatedData.value.length} data`)

      // Close modal after success
      const modal = bootstrap.Modal.getInstance(document.getElementById('setupCreateBulkPk'))
      if (modal) modal.hide()

      // Auto download after generation
      setTimeout(() => {
        handleDownloadBulk()
      }, 500)
    } else {
      toast.error(result.error || 'Gagal generate data')
    }
  } catch (error) {
    console.error('Generate error:', error)
    toast.error('Terjadi kesalahan saat generate data')
  } finally {
    isGenerating.value = false
    generationProgress.value = 0
  }
}

// Download bulk data
const handleDownloadBulk = async () => {
  if (generatedData.value.length === 0) {
    toast.error('Tidak ada data untuk di-download')
    return
  }

  const fileName = `Generate_Master_Bulk_${branchCode.value}_${new Date().toISOString()}.xlsx`

  try {
    const data = await exportToExcel(formatDataForExport(generatedData.value), fileName)
    downloadExcelFile(data.buffer, fileName)
    toast.success('File berhasil di-download')
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Gagal download file')
  }
}

// Initialize selected fields with all required fields
const initializeSelectedFields = () => {
  const requiredFields = allFields.filter((field) => field.isRequired).map((field) => field.jsonKey)
  selectedFields.value = new Set(requiredFields)
}

// Initialize form data
const initializeFormData = () => {
  allFields.forEach((field) => {
    if (field.type === 'CHECKBOX') {
      formData[field.jsonKey] = false
    } else if (field.type === 'NUMBER') {
      formData[field.jsonKey] = null
    } else {
      formData[field.jsonKey] = ''
    }
  })
}

// Get fields to display based on selection
const displayedFields = computed(() => {
  return allFields.filter((field) => field.isRequired || selectedFields.value.has(field.jsonKey))
})

// Get required and optional fields separately for the customizer
const requiredFields = computed(() => allFields.filter((field) => field.isRequired))
const optionalFields = computed(() => allFields.filter((field) => !field.isRequired))

// Initialize form and selected fields
initializeSelectedFields()
initializeFormData()

// Field customization functions
const toggleOptionalField = (fieldKey) => {
  if (selectedFields.value.has(fieldKey)) {
    selectedFields.value.delete(fieldKey)
  } else {
    selectedFields.value.add(fieldKey)
  }
}

const selectAllOptionalFields = () => {
  optionalFields.value.forEach((field) => {
    selectedFields.value.add(field.jsonKey)
  })
}

const deselectAllOptionalFields = () => {
  optionalFields.value.forEach((field) => {
    selectedFields.value.delete(field.jsonKey)
  })
}

const resetFieldSelection = () => {
  initializeSelectedFields()
}

// Validation
const validateForm = () => {
  Object.keys(errors).forEach((key) => delete errors[key])

  let isValid = true

  displayedFields.value.forEach((field) => {
    const value = formData[field.jsonKey]

    if (field.isRequired) {
      if (field.type === 'CHECKBOX' && !value) {
        errors[field.jsonKey] = `${field.description} harus dicentang`
        isValid = false
      } else if (field.type !== 'CHECKBOX' && (!value || value === '')) {
        errors[field.jsonKey] = `${field.description} wajib diisi`
        isValid = false
      }
    }

    if (value && value !== '') {
      if (field.type === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          errors[field.jsonKey] = 'Format email tidak valid'
          isValid = false
        }
      } else if (field.type === 'NUMBER' && isNaN(value)) {
        errors[field.jsonKey] = 'Harus berupa angka'
        isValid = false
      }
    }
  })

  return isValid
}

// Form handlers
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const filteredFormData = {}
    displayedFields.value.forEach((field) => {
      filteredFormData[field.jsonKey] = formData[field.jsonKey]
    })

    await downloadHandlerWithData(filteredFormData)
  } catch (error) {
    console.error('Submit error:', error)
    alert('Terjadi kesalahan saat menyimpan data')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  initializeFormData()
  Object.keys(errors).forEach((key) => delete errors[key])
}

const fillSampleData = () => {
  const currentDate = new Date().toISOString().split('T')[0]
  formData.FUND_ADV_ARR = '1'
  formData.FUND_BR_ID = '0101'
  formData.FUND_CONT_NO = '010120251234'
  formData.FUND_TOP_SEASONAL = 30
  formData.FUND_CONT_DATE = currentDate
  formData.COST_CENTER = '00000'
  formData.FUND_CUST_NAME = 'Mamang'
  formData.FUND_ADMF_PRIN = 35000000
  formData.FUND_INSR_CODE = 'ZURICH'
  formData.FUND_ADMF_EFF_RATE = 12.5
  formData.FUND_DUE_DATE = currentDate
  formData.FUND_LAST_DATE = currentDate
  formData.FUND_FIRST_DATE = currentDate
  formData.FUND_ADMF_TOP = 36
  formData.FUND_OBJT_BRAND = 'TOYOTA'
  formData.FUND_OBJT_CHASIS_NO = 'MH1234567890'
  formData.FUND_OBJT_CODE = 'AVANZA'
  formData.FUND_OBJT_ENGINE_NO = 'ENG123456'
  formData.FUND_OBJT_GROUP = 'CAR'
  formData.FUND_OBJT_PRICE = 200000000
  formData.FUND_OBJT_TYPE = 'SEDAN'
  formData.FUND_CARA_PEMBIAYAAN = 'KREDIT'
  formData.FUND_KEGIATAN_USAHA = 'PERDAGANGAN'
  formData.FUND_PPD_DATE = currentDate
  formData.FUND_PPD_NO = 'PPD123456'
  formData.FUND_REASON = 'NEW'
  formData.FUND_SALES_THROUGH = '01'
}

const downloadHandlerWithData = async (dataToExport) => {
  const fileName = `Generate Master ${new Date().toISOString()}.xlsx`
  const dataArray = [dataToExport]
  const data = await exportToExcel(formatDataForExport(dataArray), fileName)
  downloadExcelFile(data.buffer, fileName)
}
</script>

<template>
  <div class="form-view">
    <div class="card">
      <div class="card-header bg-white">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="card-title fw-medium">{{ title }}</h5>
          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-outline-indigo"
              data-bs-toggle="modal"
              data-bs-target="#setupCustomizeFields"
            >
              <i class="fas fa-cogs me-1"></i>
              Customize Fields
            </button>
            <button
              type="button"
              class="btn btn-outline-primary"
              data-bs-toggle="modal"
              data-bs-target="#setupCreateBulkPk"
            >
              <i class="fas fa-layer-group me-1"></i>
              Create Bulk
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <!-- Field Summary -->
        <div class="alert alert-info mb-3">
          <small>
            <strong>Displayed Fields:</strong> {{ displayedFields.length }} of
            {{ allFields.length }} total fields ({{ requiredFields.length }} required,
            {{ displayedFields.length - requiredFields.length }} optional selected)
          </small>
        </div>

        <form @submit.prevent="handleSubmit" class="dynamic-form">
          <div class="row">
            <div v-for="field in displayedFields" :key="field.njfKey" class="col-md-6 mb-3">
              <label :for="field.njfKey" class="form-label">
                {{ field.jsonKey }}
                <span v-if="field.isRequired" class="text-danger">*</span>
                <span v-else class="text-muted">(Optional)</span>
              </label>

              <!-- String Input -->
              <input
                v-if="field.type === 'STRING'"
                :id="field.njfKey"
                v-model="formData[field.jsonKey]"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors[field.jsonKey] }"
                :required="field.isRequired"
                :placeholder="`Masukkan ${field.description.toLowerCase()}`"
              />

              <!-- Number Input -->
              <input
                v-else-if="field.type === 'NUMBER'"
                :id="field.njfKey"
                v-model.number="formData[field.jsonKey]"
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors[field.jsonKey] }"
                :required="field.isRequired"
                :placeholder="`Masukkan ${field.description.toLowerCase()}`"
                step="0.01"
              />

              <!-- Date Input -->
              <input
                v-else-if="field.type === 'DATE'"
                :id="field.njfKey"
                v-model="formData[field.jsonKey]"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors[field.jsonKey] }"
                :required="field.isRequired"
              />

              <!-- Email Input -->
              <input
                v-else-if="field.type === 'EMAIL'"
                :id="field.njfKey"
                v-model="formData[field.jsonKey]"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors[field.jsonKey] }"
                :required="field.isRequired"
                :placeholder="`Masukkan ${field.description.toLowerCase()}`"
              />

              <!-- Select/Dropdown -->
              <select
                v-else-if="field.type === 'SELECT'"
                :id="field.njfKey"
                v-model="formData[field.jsonKey]"
                class="form-select"
                :class="{ 'is-invalid': errors[field.jsonKey] }"
                :required="field.isRequired"
              >
                <option value="">Pilih {{ field.description.toLowerCase() }}</option>
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>

              <!-- Textarea -->
              <textarea
                v-else-if="field.type === 'TEXTAREA'"
                :id="field.njfKey"
                v-model="formData[field.jsonKey]"
                class="form-control"
                :class="{ 'is-invalid': errors[field.jsonKey] }"
                :required="field.isRequired"
                :placeholder="`Masukkan ${field.description.toLowerCase()}`"
                rows="3"
              ></textarea>

              <!-- Checkbox -->
              <div v-else-if="field.type === 'CHECKBOX'" class="form-check">
                <input
                  :id="field.njfKey"
                  v-model="formData[field.jsonKey]"
                  type="checkbox"
                  class="form-check-input"
                  :class="{ 'is-invalid': errors[field.jsonKey] }"
                />
                <label :for="field.njfKey" class="form-check-label">
                  {{ field.description }}
                </label>
              </div>

              <!-- Error Message -->
              <div v-if="errors[field.jsonKey]" class="invalid-feedback">
                {{ errors[field.jsonKey] }}
              </div>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <button type="button" @click="resetForm" class="btn btn-secondary">Reset</button>

            <button type="button" @click="fillSampleData" class="btn btn-info">Sample Data</button>

            <button type="submit" class="btn btn-success" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSubmitting ? 'Processing...' : 'Export' }}
            </button>
          </div>
        </form>

        <!-- Debug Panel (for development) -->
        <div v-if="showDebug" class="mt-4 p-3 bg-light rounded">
          <h6>Form Data (Debug):</h6>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Create Bulk Modal -->
    <div
      class="modal fade"
      tabindex="-1"
      aria-hidden="false"
      id="setupCreateBulkPk"
      aria-labelledby="setupCreateBulkPkLabel"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="setupCreateBulkPkLabel">
              <i class="fas fa-layer-group me-2"></i>
              Create Bulk Data
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info">
              <small>
                <i class="fas fa-info-circle me-1"></i>
                Generate multiple PK numbers dengan nomor rangka dan nomor mesin otomatis
              </small>
            </div>

            <form @submit.prevent="handleGenerateBulk">
              <div class="mb-3">
                <label for="bulkBranchCode" class="form-label">
                  Kode Cabang
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="bulkBranchCode"
                  v-model="branchCode"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: 0101"
                  maxlength="4"
                  required
                  :disabled="isGenerating"
                />
                <small class="text-muted">4 digit kode cabang</small>
              </div>

              <div class="mb-3">
                <label for="bulkQuantity" class="form-label">
                  Jumlah Data
                  <span class="text-danger">*</span>
                </label>
                <input
                  id="bulkQuantity"
                  v-model.number="quantity"
                  type="number"
                  class="form-control"
                  placeholder="Masukkan jumlah"
                  min="1"
                  max="10000"
                  required
                  :disabled="isGenerating"
                />
                <small class="text-muted">Maksimal 10.000 data</small>
              </div>

              <!-- Progress Bar -->
              <div v-if="isGenerating" class="mb-3">
                <div class="progress">
                  <div
                    class="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    :style="{ width: generationProgress + '%' }"
                    :aria-valuenow="generationProgress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {{ generationProgress }}%
                  </div>
                </div>
                <small class="text-muted d-block mt-2 text-center">
                  Generating data, please wait...
                </small>
              </div>

              <div class="alert alert-warning">
                <small>
                  <strong>Info:</strong> Setelah generate selesai, file akan otomatis ter-download
                </small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
              :disabled="isGenerating"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleGenerateBulk"
              :disabled="isGenerating"
            >
              <span v-if="isGenerating" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-play me-1"></i>
              {{ isGenerating ? 'Generating...' : 'Generate' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Customizer Modal -->
    <div
      class="modal fade"
      tabindex="-1"
      aria-hidden="false"
      id="setupCustomizeFields"
      aria-labelledby="setupCustomizeFields"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Customize Form Fields</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Required Fields Section -->
            <div class="mb-4">
              <h6 class="text-primary mb-3">
                <i class="fas fa-asterisk me-1"></i>
                Required Fields ({{ requiredFields.length }}) - Always Displayed
              </h6>
              <div class="row">
                <div v-for="field in requiredFields" :key="field.jsonKey" class="col-md-4 mb-2">
                  <div class="form-check">
                    <input
                      :id="`req-${field.jsonKey}`"
                      type="checkbox"
                      class="form-check-input"
                      checked
                      disabled
                    />
                    <label :for="`req-${field.jsonKey}`" class="form-check-label text-muted">
                      <strong>{{ field.jsonKey }}</strong>
                      <br /><small>{{ field.description }}</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Optional Fields Section -->
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-secondary mb-0">
                  <i class="fas fa-list me-1"></i>
                  Optional Fields ({{ optionalFields.length }})
                </h6>
                <div class="btn-group btn-group-sm">
                  <button
                    type="button"
                    class="btn btn-outline-success btn-sm"
                    @click="selectAllOptionalFields"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="deselectAllOptionalFields"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div class="row max-height-300">
                <div v-for="field in optionalFields" :key="field.jsonKey" class="col-md-4 mb-2">
                  <div class="form-check">
                    <input
                      :id="`opt-${field.jsonKey}`"
                      type="checkbox"
                      class="form-check-input"
                      :checked="selectedFields.has(field.jsonKey)"
                      @change="toggleOptionalField(field.jsonKey)"
                    />
                    <label :for="`opt-${field.jsonKey}`" class="form-check-label">
                      <strong>{{ field.jsonKey }}</strong>
                      <br /><small class="text-muted">{{ field.description }}</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="alert alert-light">
              <small class="text-dark">
                <strong>Selection Summary:</strong>
                {{ selectedFields.size }} of {{ allFields.length }} fields will be displayed ({{
                  requiredFields.length
                }}
                required + {{ selectedFields.size - requiredFields.length }} optional)
              </small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="resetFieldSelection">
              Reset to Default
            </button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-view {
  max-height: 80vh;
  overflow: auto;
}

.dynamic-form .form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.dynamic-form .text-danger {
  font-size: 0.875rem;
}

.dynamic-form .is-invalid {
  border-color: #dc3545;
}

.dynamic-form .invalid-feedback {
  display: block;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

pre {
  font-size: 0.8rem;
  max-height: 300px;
  overflow-y: auto;
}

.max-height-300 {
  max-height: 300px;
  overflow-y: auto;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.btn-outline-indigo {
  color: #6f42c1;
  border-color: #6f42c1;
}

.btn-outline-indigo:hover {
  background-color: #6f42c1;
  color: white;
}

.form-check-label small {
  font-size: 0.8rem;
  line-height: 1.2;
}

.alert-light {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.progress {
  height: 25px;
}

.progress-bar {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
