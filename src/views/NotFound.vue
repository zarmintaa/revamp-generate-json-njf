<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-text">
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-description">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="error-actions">
        <router-link to="/dashboard" class="btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.5 2L1.5 8L6.5 14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14.5 8H2"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Back to Dashboard
        </router-link>

        <button @click="goBack" class="btn-secondary">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(80vh - 120px);
  padding: 24px;
  background-color: #f8fafc;
}

.not-found-content {
  max-width: 500px;
  text-align: center;
}

/* Error Illustration */
.error-illustration {
  margin-bottom: 40px;
}

.error-code {
  font-size: 96px;
  font-weight: 800;
  color: #e5e7eb;
  line-height: 0.8;
  margin-bottom: 20px;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

.error-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Error Text */
.error-text {
  margin-bottom: 40px;
}

.error-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  line-height: 1.2;
}

.error-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

/* Action Buttons */
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: white;
  color: #6b7280;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 640px) {
  .not-found-page {
    padding: 16px;
  }

  .error-code {
    font-size: 72px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 15px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 260px;
    justify-content: center;
  }
}
</style>
