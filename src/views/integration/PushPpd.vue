<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = route.meta?.title || 'Push PPD'

// Form data
const formData = ref({
  apiUrl: 'Url get token',
  username: '',
  password: '',
})

// State management
const loading = ref(false)
const error = ref('')
const tokenData = ref(null)
const copySuccess = ref(false)

// Reset form
const resetForm = () => {
  formData.value = {
    apiUrl: '',
    username: '',
    password: '',
  }
  error.value = ''
  tokenData.value = null
  copySuccess.value = false
}

// Get credentials
const getCredentials = async () => {
  if (!formData.value.username || !formData.value.password) {
    error.value = 'Username and password are required'
    return
  }

  if (!formData.value.apiUrl) {
    error.value = 'API URL  are required'
    return
  }

  loading.value = true
  error.value = ''
  tokenData.value = null

  try {
    const response = await fetch(formData.value.apiUrl, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.value.username,
        password: formData.value.password,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      tokenData.value = data
    } else {
      error.value = data.error_description || 'Failed to get credentials'
    }
  } catch (err) {
    error.value = 'Network error: ' + err.message
  } finally {
    loading.value = false
  }
}

// Copy token to clipboard
const copyToken = async () => {
  if (!tokenData.value?.access_token) return

  try {
    await navigator.clipboard.writeText(tokenData.value.access_token)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="card">
    <div class="card-header bg-white">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="card-title fw-medium">{{ title }}</h5>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-outline-indigo"
            data-bs-toggle="modal"
            data-bs-target="#getCredentials"
            @click="resetForm"
          >
            Get Credentials
          </button>
        </div>
      </div>
    </div>
    <div class="card-body">
      <h5 class="card-title fw-medium mb-4">{{ title }}</h5>
      <p class="mb-0">This is a {{ title }} Task page</p>
    </div>
  </div>

  <!--  MODAL GET CREDENTIALS   -->

  <div
    class="modal fade"
    tabindex="-1"
    aria-hidden="true"
    id="getCredentials"
    aria-labelledby="getCredentials"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Get Credentials</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="resetForm"
          ></button>
        </div>
        <div class="modal-body">
          <!-- Error Alert -->
          <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {{ error }}
            <button type="button" class="btn-close" @click="error = ''"></button>
          </div>

          <!-- Form Section -->
          <form @submit.prevent="getCredentials">
            <!-- API Configuration Section -->
            <div class="mb-4">
              <h6 class="fw-bold mb-3 text-primary">
                <i class="bi bi-gear-fill me-2"></i>API Configuration
              </h6>
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-semibold" for="apiUrl">
                    API URL <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="apiUrl"
                    v-model="formData.apiUrl"
                    placeholder="Your API Url"
                    :disabled="loading"
                    required
                  />
                  <small class="text-muted">Enter the complete API endpoint URL</small>
                </div>
              </div>
            </div>

            <hr class="my-4" />

            <!-- Credentials Section -->
            <div class="mb-4">
              <h6 class="fw-bold mb-3 text-primary">
                <i class="bi bi-person-fill me-2"></i>User Credentials
              </h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="username">
                    Username <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="formData.username"
                    placeholder="Enter username"
                    :disabled="loading"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold" for="password">
                    Password <span class="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    v-model="formData.password"
                    placeholder="Enter password"
                    :disabled="loading"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-secondary"
                @click="resetForm"
                :disabled="loading"
              >
                Reset
              </button>
              <button type="submit" class="btn btn-primary px-4" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Getting Token...' : 'Get Token' }}
              </button>
            </div>
          </form>

          <!-- Token Result Section -->
          <div v-if="tokenData" class="mt-4">
            <hr />
            <h6 class="fw-bold mb-3">Token Information</h6>

            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Access Token</label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control font-monospace small"
                    :value="tokenData.access_token"
                    readonly
                  />
                  <button class="btn btn-outline-secondary" type="button" @click="copyToken">
                    <i v-if="!copySuccess" class="bi bi-clipboard"></i>
                    <i v-else class="bi bi-check-lg text-success"></i>
                    {{ copySuccess ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Token Type</label>
                <input type="text" class="form-control" :value="tokenData.token_type" readonly />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Expires In</label>
                <input
                  type="text"
                  class="form-control"
                  :value="`${tokenData.expires_in} seconds (${Math.floor(tokenData.expires_in / 60)} minutes)`"
                  readonly
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Scope</label>
                <input type="text" class="form-control" :value="tokenData.scope" readonly />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Refresh Token</label>
                <textarea
                  class="form-control font-monospace small"
                  rows="3"
                  :value="tokenData.refresh_token"
                  readonly
                ></textarea>
              </div>
            </div>

            <div class="alert alert-info mt-3" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              <strong>Note:</strong> This token will expire in
              {{ Math.floor(tokenData.expires_in / 60) }} minutes. Please copy and use it before
              expiration.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
            @click="resetForm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-monospace {
  font-family: 'Courier New', Courier, monospace;
}

.small {
  font-size: 0.875rem;
}
</style>
