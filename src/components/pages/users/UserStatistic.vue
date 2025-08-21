<!-- Enhanced Dashboard User -->

<script setup>
import { ref } from 'vue'

const actionCards = ref([
  {
    title: 'Project Assigned',
    total: 3,
    icon: 'ti-box',
    color: 'primary',
    trend: '+12%',
    trendDirection: 'up',
    description: 'New projects this month',
  },
  {
    title: 'Total Task',
    total: 30,
    icon: 'ti-file-text',
    color: 'success',
    trend: '+8%',
    trendDirection: 'up',
    description: 'Active tasks in progress',
  },
  {
    title: 'Incomplete Task',
    total: 4,
    icon: 'ti-clock',
    color: 'warning',
    trend: '-5%',
    trendDirection: 'down',
    description: 'Pending completion',
  },
  {
    title: 'Under Review',
    total: 2,
    icon: 'ti-eye',
    color: 'info',
    trend: '0%',
    trendDirection: 'neutral',
    description: 'Awaiting approval',
  },
])

// Add click handler for card interactions
const handleCardClick = (card) => {
  console.log(`Clicked on ${card.title}`)
  // Add your navigation logic here
}
</script>

<template>
  <div class="row gy-4">
    <div v-for="card in actionCards" :key="card.title" class="col-lg-3 col-md-6 margin-bottom-30">
      <div
        class="card action-card h-100 border-0"
        :data-color="card.color"
        @click="handleCardClick(card)"
        role="button"
        tabindex="0"
        @keydown.enter="handleCardClick(card)"
      >
        <div class="card-header bg-transparent border-0 pb-0">
          <div class="d-flex justify-content-between align-items-start">
            <span class="card-title fw-medium">{{ card.title }}</span>
            <div :class="`trend-badge bg-${card.color}-subtle text-${card.color}`">
              <i
                :class="[
                  'ti',
                  card.trendDirection === 'up'
                    ? 'ti-trending-up'
                    : card.trendDirection === 'down'
                      ? 'ti-trending-down'
                      : 'ti-minus',
                ]"
              ></i>
              {{ card.trend }}
            </div>
          </div>
        </div>

        <div class="card-body pt-2">
          <div class="d-flex align-items-center mb-3">
            <div :class="`icon-wrapper me-3 bg-${card.color}-subtle`">
              <i :class="['ti', card.icon, `text-${card.color}`]"></i>
            </div>
            <div class="text-wrapper flex-grow-1">
              <h2 class="fw-bold mb-1 counter-number">{{ card.total }}</h2>
              <p class="card-description text-muted mb-0">
                {{ card.description }}
              </p>
            </div>
          </div>

          <!-- Progress bar for visual enhancement -->
          <div class="progress-container">
            <div class="progress" style="height: 4px">
              <div
                :class="`progress-bar bg-${card.color}`"
                :style="`width: ${Math.min((card.total / 50) * 100, 100)}%`"
                role="progressbar"
              ></div>
            </div>
          </div>
        </div>

        <!-- Hover overlay - moved to bottom left to not interfere with trend badge -->
        <div class="card-overlay">
          <i class="ti ti-arrow-up-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-card {
  background: #ffffff;
  /*border-radius: 1.25rem;*/
  box-shadow:
    0 4px 25px rgba(0, 0, 0, 0.04),
    0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #f1f5f9;
}
.margin-bottom-30 {
  margin-bottom: 30px !important;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.action-card[data-color='primary']::before {
  background: var(--bs-primary);
}

.action-card[data-color='success']::before {
  background: var(--bs-success);
}

.action-card[data-color='warning']::before {
  background: var(--bs-warning);
}

.action-card[data-color='info']::before {
  background: var(--bs-info);
}

.action-card[data-color='danger']::before {
  background: var(--bs-danger);
}

.action-card:hover::before {
  transform: scaleX(1);
}

.action-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.08),
    0 5px 20px rgba(0, 0, 0, 0.04);
}

/* Fix focus border color to match card color */
.action-card[data-color='primary']:focus {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

.action-card[data-color='success']:focus {
  outline: 2px solid var(--bs-success);
  outline-offset: 2px;
}

.action-card[data-color='warning']:focus {
  outline: 2px solid var(--bs-warning);
  outline-offset: 2px;
}

.action-card[data-color='info']:focus {
  outline: 2px solid var(--bs-info);
  outline-offset: 2px;
}

.action-card[data-color='danger']:focus {
  outline: 2px solid var(--bs-danger);
  outline-offset: 2px;
}

.card-header {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.card-body {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
}

.card-title {
  font-size: 0.875rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.trend-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.icon-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.icon-wrapper .ti {
  font-size: 1.75rem;
  z-index: 1;
}

.counter-number {
  font-size: 2.5rem;
  line-height: 1;
  color: #1e293b;
  font-weight: 800;
}

.card-description {
  font-size: 0.875rem;
  line-height: 1.4;
  color: #94a3b8;
}

.progress-container {
  margin-top: 1rem;
}

.progress {
  background-color: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.6s ease;
}

.card-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-card:hover .card-overlay {
  opacity: 1;
  transform: scale(1);
}

.card-overlay .ti {
  font-size: 1rem;
  color: #475569;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .counter-number {
    font-size: 2rem;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .icon-wrapper .ti {
    font-size: 1.5rem;
  }

  .card-header,
  .card-body {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }
}

/* Dark mode support - removed for consistent light theme */

/* Animation for counter numbers */
@keyframes countUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.counter-number {
  animation: countUp 0.6s ease-out;
}
</style>
