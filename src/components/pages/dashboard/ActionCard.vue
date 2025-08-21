<script setup lang="ts">
import { ref } from 'vue'

const actionCards = ref([
  {
    title: 'Create Project',
    subtitle: 'Organize your work in projects',
    icon: 'ti-box',
    color: 'primary',
  },
  {
    title: 'Create Task',
    subtitle: 'Assign tasks to your team',
    icon: 'ti-file-text',
    color: 'success',
  },
  {
    title: 'Invite Team',
    subtitle: 'Collaborate with your colleagues',
    icon: 'ti-user-plus',
    color: 'warning',
  },
  {
    title: 'Join Team',
    subtitle: 'Collaborate with your colleagues',
    icon: 'ti-user-plus',
    color: 'danger',
  },
])
</script>

<template>
  <div class="row">
    <div v-for="card in actionCards" :key="card.title" class="col-lg-4 col-md-6">
      <div class="card action-card">
        <div class="card-body">
          <div class="d-flex align-items-center gap-4">
            <div :class="`icon-wrapper bg-${card.color}-subtle`">
              <i :class="['ti', card.icon, `text-${card.color}`]"></i>
            </div>
            <div class="text-wrapper">
              <h5 class="card-title fw-semibold mb-1">{{ card.title }}</h5>
              <p class="card-subtitle text-muted mb-0">{{ card.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-card:hover {
  /*transform: translateY(-5px);*/
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

/* Wrapper untuk ikon */
.icon-wrapper {
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Style untuk ikon di dalamnya */
.icon-wrapper .ti {
  font-size: 2rem; /* Ukuran ikon lebih besar */
}

/* Pembungkus teks */
.text-wrapper {
  text-align: left;
}

.card-title {
  font-size: 1.1rem;
}

.card-subtitle {
  font-size: 0.9rem;
}

/* Kartu konten utama */
.main-content-card {
  margin-top: 1.5rem;
}

/* Definisikan variabel warna Indigo agar mudah dikelola, meniru sistem Bootstrap 5 */
:root {
  --bs-indigo: #6610f2;
  --bs-indigo-rgb: 102, 16, 242;

  /* Warna teks gelap yang serasi dengan latar belakang subtle */
  --bs-indigo-text-emphasis: #4409a1;

  /* Warna latar belakang subtle yang kita inginkan (ungu sangat muda/lavender) */
  --bs-indigo-bg-subtle: #ebe0fe;

  /* Warna border yang serasi */
  --bs-indigo-border-subtle: #d7c1fd;
}

/* Class untuk warna teks utama */
.text-indigo {
  color: var(--bs-indigo) !important;
}

/* Class untuk warna teks yang kontras di atas bg-subtle */
.text-indigo-emphasis {
  color: var(--bs-indigo-text-emphasis) !important;
}

/* Class untuk warna latar belakang subtle */
.bg-indigo-subtle {
  background-color: var(--bs-indigo-bg-subtle) !important;
}

/* Class untuk warna border subtle */
.border-indigo-subtle {
  border-color: var(--bs-indigo-border-subtle) !important;
}
</style>
