

<script setup>
import { useRoute } from 'vue-router'
import { ref, reactive, computed } from 'vue'
import {allFieldMapping} from "@/utils/fieldMapping.js";

const route = useRoute()
const title = route.meta?.title || 'Generate Master PPD'

/* STATE NEW PPD */
const allFields = allFieldMapping

// Form state
const formData = reactive({})
const errors = reactive({})
const isSubmitting = ref(false)
const showDebug = ref(true) // Set to true for development

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

// Initialize form
initializeFormData()

// Validation
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach((key) => delete errors[key])

  let isValid = true

  allFields.forEach((field) => {
    const value = formData[field.jsonKey]

    // Required field validation
    if (field.isRequired) {
      if (field.type === 'CHECKBOX' && !value) {
        errors[field.jsonKey] = `${field.description} harus dicentang`
        isValid = false
      } else if (field.type !== 'CHECKBOX' && (!value || value === '')) {
        errors[field.jsonKey] = `${field.description} wajib diisi`
        isValid = false
      }
    }

    // Type-specific validation
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log('Form submitted:', formData)
    alert('Data berhasil disimpan!')

    // You can replace this with actual API call
    // await submitToAPI(formData)
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
  formData.FUND_CONT_DATE = currentDate;
  formData.COST_CENTER = '00000'
  formData.FUND_CUST_NAME = 'Mamang'
  formData.FUND_ADMF_PRIN = 35000000
  formData.INSR_CODE = '123'
  formData.FUND_ADMF_EFF_RATE = '12.50'
  formData.FUND_DUE_DATE = currentDate
  formData.FUND_INSR_CODE = 'ZURICH'
  // formData.//
}

// Computed properties
const isFormValid = computed(() => {
  return allFields.every((field) => {
    if (!field.isRequired) return true
    const value = formData[field.jsonKey]
    if (field.type === 'CHECKBOX') {
      return value === true
    }
    return value && value !== ''
  })
})
</script>

<template>
  <div class="form-view">
    <div class="card">
      <div class="card-header bg-white">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="card-title fw-medium">{{ title }}</h5>
         <div class="d-flex gap-2">
           <button type="button" class="btn btn-outline-indigo">Customize Fields</button>
           <button type="button" class="btn btn-outline-primary">Create Bulk</button>
         </div>
        </div>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="dynamic-form">
          <div class="row">
            <div v-for="field in allFields" :key="field.njfKey" class="col-md-6 mb-3">
              <label :for="field.njfKey" class="form-label">
                {{ field.jsonKey }}
                <span v-if="field.isRequired" class="text-danger">*</span>
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
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ isSubmitting ? 'Processing...' : 'Submit' }}
            </button>

            <button type="button" @click="resetForm" class="btn btn-secondary">Reset</button>

            <button type="button" @click="fillSampleData" class="btn btn-info">Sample Data</button>
          </div>
        </form>

        <!-- Debug Panel (for development) -->
        <div v-if="showDebug" class="mt-4 p-3 bg-light rounded">
          <h6>Form Data (Debug):</h6>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
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
</style>
