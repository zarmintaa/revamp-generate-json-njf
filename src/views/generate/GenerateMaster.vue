<script setup>
import { Utils } from '@/utils/doc-utils'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Generate Master'

const senderDocNo = ref('')
const jsonName = ref('')
const sourceSystem = ref('')

const docNoError = ref('')
const jsonNameError = ref('')
const sourceSystemError = ref('')

senderDocNo.value = Utils.generateSenderDocNo()
jsonName.value = 'MASTER'
sourceSystem.value = 'AMAN'

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
  <!-- Modal -->
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Setup Template</h1>
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
              <div class="small text-muted mt-1">Fomat: (12 characters total)</div>
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
            <div class="modal-footer">
              <button type="submit" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-header">
      <section class="d-flex align-items-center justify-content-between">
        <h5 class="card-title fw-medium mb-0">{{ title }}</h5>
        <button
          type="button"
          class="btn btn-outline-primary"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Setup Template
        </button>
      </section>
    </div>
    <div class="card-body">
      <p class="mb-0">This is a {{ title }} page</p>
    </div>
  </div>
</template>
