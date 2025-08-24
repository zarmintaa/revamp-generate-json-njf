<script setup>
import { Utils } from '@/utils/doc-utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Properties from '@/components/common/generator/properties/Properties.vue'
import PropertiesItem from '@/components/common/generator/properties/PropertiesItem.vue'
import { useJsonTemplate } from '@/composables/useJsonTemplate.js'
import { useFileUpload } from '@/composables/useFileUpload'

const route = useRoute()
const title = route.meta?.title || 'Generate SCHD'

const senderDocNo = ref(Utils.generateSenderDocNo())
const jsonName = ref('SCHD')
const sourceSystem = ref('AMAN')

const docNoError = ref('')
const jsonNameError = ref('')
const sourceSystemError = ref('')

const {
  isPreviewJsonTemplate,
  copyStatus,
  generateTemplate,
  downloadJson,
  copyToClipboard,
  handlePreviewJsonTemplate,
} = useJsonTemplate()

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

const validateDocNo = () => {
  if (senderDocNo.value.length > 12) {
    docNoError.value = 'Document Number cannot exceed 12 characters'
    senderDocNo.value = senderDocNo.value.slice(0, 12)
    return false
  }
  if (!senderDocNo.value) {
    docNoError.value = 'Document Number is required'
    return false
  }
  docNoError.value = ''
  return true
}

const validateJsonName = () => {
  if (!jsonName.value) {
    jsonNameError.value = 'JSON Name is required'
    return false
  }
  jsonNameError.value = ''
  return true
}

const validateSourceSystem = () => {
  if (!sourceSystem.value) {
    sourceSystemError.value = 'Source System is required'
    return false
  }
  sourceSystemError.value = ''
  return true
}

const validateAll = () => {
  const isDocNoValid = validateDocNo()
  const isJsonNameValid = validateJsonName()
  const isSourceSystemValid = validateSourceSystem()

  return isDocNoValid && isJsonNameValid && isSourceSystemValid
}

const templatePreview = computed(() => {
  const templateIsValid = validateAll()
  if (templateIsValid) {
    return generateTemplate({
      docNo: senderDocNo.value,
      jsonName: jsonName.value,
      sourceSystem: sourceSystem.value,
    })
  }
  return {}
})

// Template dengan data hasil scan file untuk download
const templateWithFileData = computed(() => {
  if (validateAll()) {
    return generateTemplate(
      {
        docNo: senderDocNo.value,
        jsonName: jsonName.value,
        sourceSystem: sourceSystem.value,
      },
      fileData,
    )
  }
  return null
})

const previewJsonTemplate = computed(() => {
  return JSON.stringify(templateWithFileData.value, null, 2)
})

const downloadJsonHandler = () => {
  try {
    downloadJson(templateWithFileData.value, fileType.value)
  } catch (error) {
    errorMessage.value = error.message
  }
}

const updateTemplatePreview = () => {
  if (validateDocNo() && validateJsonName() && validateSourceSystem()) {
    // templatePreview.value = templateStore.setTemplateDisburse({
    //   senderDocNo: senderDocNo.value,
    //   jsonName: jsonName.value,
    //   sourceSystem: sourceSystem.value,
    // })
  } else {
    templatePreview.value = null
  }
}

const handleDocNoInput = (event) => {
  if (event.target.value.length >= 12 && event.data) {
    event.preventDefault()
  }
}

const copyToClipboardHandler = async () => {
  await copyToClipboard(templateWithFileData.value)
}

watch(
  [senderDocNo, jsonName, sourceSystem],
  () => {
    // updateTemplatePreview()
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template>
  <div class="card">
    <div class="card-header">
      <section class="d-flex align-items-center justify-content-between">
        <h5 class="card-title fw-medium mb-0">{{ title }}</h5>
        <button
          type="button"
          class="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#setupTemplateModal"
        >
          Setup Template
        </button>
      </section>
    </div>

    <div class="px-4 mt-4">
      <Properties>
        <PropertiesItem
          :input-properties="senderDocNo"
          input-label="Document Number"
          input-properties-error="Not specified"
        />

        <PropertiesItem
          :input-properties="jsonName"
          input-label="JSON Name"
          input-properties-error="Not specified"
        />

        <PropertiesItem
          :input-properties="sourceSystem"
          input-label="Source System"
          input-properties-error="Not specified"
        />
      </Properties>
    </div>

    <div class="px-4">
      <div class="card-header">Template JSON Structure</div>
      <div class="card-body p-0">
        <pre class="bg-light p-3 rounded">{{ JSON.stringify(templatePreview, null, 2) }}</pre>
      </div>
    </div>
  </div>

  <section class="mt-4">
    <div class="card">
      <div class="card-header">
        <h5>File Upload - {{ title }}</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Select File Type</label>
          <select v-model="fileType" class="form-select">
            <option value="EXCEL">Excel</option>
            <!--              <option value="JSON">JSON</option>-->
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Upload {{ fileType }} File</label>
          <input
            :accept="fileType === 'JSON' ? '.json' : '.xlsx, .xls, .xlsm'"
            class="form-control"
            type="file"
            @change="handleFileChange"
          />
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>

        <button
          :disabled="isFileNotReady || isProses"
          class="btn btn-primary mt-3"
          @click="processFile"
        >
          <span v-if="isProses" class="d-flex align-items-center gap-2">
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Processing...
          </span>
          <span v-else>Process File</span>
        </button>

        <div class="mt-4">
          <Properties>
            <PropertiesItem
              :input-properties="fileName"
              input-label="File Name"
              input-properties-error="File didn't process yet"
            />
            <PropertiesItem
              :input-properties="senderDocNo"
              input-label="Document Number"
              input-properties-error="Not specified"
            />
            <PropertiesItem
              :input-properties="jsonName"
              input-label="JSON Name"
              input-properties-error="Not specified"
            />
            <PropertiesItem
              :input-properties="sourceSystem"
              input-label="Source System"
              input-properties-error="Not specified"
            />
          </Properties>
        </div>

        <div v-if="fileData" class="card mt-4">
          <div class="card-header">Result Upload Data ({{ fileData.type.toUpperCase() }})</div>
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th v-for="(header, index) in fileData.headers" :key="index">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in fileData.data" :key="rowIndex">
                  <td v-for="(value, key) in row" :key="key">
                    {{ value === null ? 'null' : value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="fileData && fileData.type === 'json'" class="card mt-3">
          <div class="card">
            <div class="card-header">Raw JSON Data</div>
            <pre class="bg-light p-3 rounded">{{ JSON.stringify(fileData.data, null, 2) }}</pre>
          </div>
        </div>

        <div v-if="fileData" class="d-flex gap-4">
          <div class="mt-4 d-flex gap-2">
            <button :disabled="isProses" class="btn btn-success" @click="downloadJsonHandler">
              Download JSON Template
            </button>
          </div>

          <div class="mt-4 d-flex gap-2">
            <button
              :disabled="isProses"
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#jsonPreviewModal"
            >
              Preview JSON Template
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Setup Template Modal -->
  <div
    class="modal fade"
    id="setupTemplateModal"
    tabindex="-1"
    aria-labelledby="setupTemplateModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="setupTemplateModalLabel">Setup Template</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent>
            <div class="mb-3">
              <label class="form-label" for="senderDocNo">Document Number</label>
              <input
                id="senderDocNo"
                v-model="senderDocNo"
                :class="{ 'is-invalid': docNoError }"
                class="form-control"
                maxlength="12"
                placeholder="Format: DDMMYYR###### (12 characters)"
                type="text"
                @blur="validateDocNo"
                @input="handleDocNoInput"
              />
              <div v-if="docNoError" class="invalid-feedback">
                {{ docNoError }}
              </div>
              <div class="small text-muted mt-1">Format: (12 characters total)</div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="jsonName">JSON Name</label>
              <input
                id="jsonName"
                v-model="jsonName"
                :class="{ 'is-invalid': jsonNameError }"
                class="form-control"
                placeholder="Enter JSON Name"
                type="text"
                @blur="validateJsonName"
                :disabled="true"
              />
              <div v-if="jsonNameError" class="invalid-feedback">
                {{ jsonNameError }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label" for="sourceSystem">Source System</label>
              <input
                id="sourceSystem"
                v-model="sourceSystem"
                :class="{ 'is-invalid': sourceSystemError }"
                class="form-control"
                placeholder="Enter Source System"
                type="text"
                @blur="validateSourceSystem"
              />
              <div v-if="sourceSystemError" class="invalid-feedback">
                {{ sourceSystemError }}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- JSON Preview Modal -->
  <div
    class="modal fade"
    id="jsonPreviewModal"
    tabindex="-1"
    aria-labelledby="jsonPreviewModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header d-flex justify-content-between align-items-center">
          <!-- Bagian Kiri: Title -->
          <h5 class="modal-title mb-0" id="jsonPreviewModalLabel">Preview JSON Data</h5>

          <!-- Bagian Kanan: Actions -->
          <div class="d-flex gap-2 align-items-center">
            <span v-show="copyStatus" class="text-success">{{ copyStatus }}</span>
            <button class="btn btn-secondary btn-sm" @click="copyToClipboardHandler">
              <svg
                aria-hidden="true"
                class="me-1"
                fill="currentColor"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                  fill-rule="evenodd"
                />
                <path
                  clip-rule="evenodd"
                  d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                  fill-rule="evenodd"
                />
              </svg>
              Copy
            </button>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
        </div>

        <div class="modal-body">
          <pre class="bg-light p-3 rounded overflow-auto">{{ previewJsonTemplate }}</pre>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-body pre {
  flex: 1;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.25rem;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}
</style>
