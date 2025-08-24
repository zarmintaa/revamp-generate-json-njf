<script setup>
import Properties from '@/components/common/generator/properties/Properties.vue'
import PropertiesItem from '@/components/common/generator/properties/PropertiesItem.vue'
import { useFileUpload } from '@/composables/useFileUpload'
import { useJsonTemplate } from '@/composables/useJsonTemplate'
import { Utils } from '@/utils/doc-utils'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Generate TRX FAST'
const docNoApp = ref(Utils.generateDocNoApp())
const jsonName = ref('TRX-FAST')
const nik = ref('100098829')

const docNoAppError = ref('')
const nikError = ref('')
const jsonNameError = ref('')

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
  if (docNoApp.value.length > 16) {
    docNoAppError.value = 'Document Number cannot exceed 16 characters'
    docNoApp.value = docNoApp.value.slice(0, 16)
    return false
  }
  if (!docNoApp.value) {
    docNoAppError.value = 'Document Number is required'
    return false
  }
  docNoAppError.value = ''
  return true
}

const validateNik = () => {
  if (nik.value.length < 1) {
    nikError.value = 'NIK is required'
    console.log({ nik: nik.value })
    return false
  }

  nikError.value = ''
  return true
}

const validateAll = () => {
  const isDocNoValid = validateDocNo()
  const isNikValid = validateNik()

  console.log({ isDocNoValid, isNikValid })

  return isDocNoValid && isNikValid
}

const templatePreview = computed(() => {
  const templateIsValid = validateAll()
  if (templateIsValid) {
    return generateTemplate({
      docNo: docNoApp.value,
      jsonName: jsonName.value,
      nik: nik.value,
    })
  }
  return {}
})

const templateWithFileData = computed(() => {
  if (validateAll()) {
    return generateTemplate(
      {
        docNo: docNoApp.value,
        jsonName: jsonName.value,
        nik: nik.value,
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
          :input-properties="docNoApp"
          input-label="Document Number"
          input-properties-error="Not specified"
        />
        <PropertiesItem
          :input-properties="nik"
          input-label="User NIK"
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
              :input-properties="docNoApp"
              input-label="Document Number"
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
              <label class="form-label" for="docNoApp">DocNo App</label>
              <input
                v-model="docNoApp"
                :class="{ 'is-invalid': docNoAppError }"
                class="form-control"
                maxlength="16"
                placeholder="DocNo App"
                type="text"
                @blur="validateDocNo"
                @input="handleDocNoInput"
              />
              <div v-if="docNoAppError" class="invalid-feedback">
                {{ docNoAppError }}
              </div>
              <div class="small text-muted mt-1">Fomat: (16 characters total)</div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="user nik">User NIK</label>
              <input
                id="userNik"
                v-model="nik"
                class="form-control"
                placeholder="Enter Nik User"
                type="number"
                @blur="validateNik"
              />
              <div v-if="nikError" class="invalid-feedback">
                {{ nikError }}
              </div>
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
          </form>
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
