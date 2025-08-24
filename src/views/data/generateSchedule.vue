<script setup>
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport'
import { ref, computed, watch } from 'vue'

// Reactive variables
const principal = ref(25000000) // 25 juta
const tenure = ref(24) // 2 tahun = 24 bulan
const annualRate = ref(12) // 12% per tahun

// Computed properties untuk perhitungan
const monthlyRate = computed(() => annualRate.value / 100 / 12)
const numPayments = computed(() => tenure.value)

// Pilihan pembulatan
const roundingOption = ref('hundred') // 'none', 'hundred', 'thousand', 'ten-thousand'

// Fungsi pembulatan
const roundAmount = (amount, option) => {
  switch (option) {
    case 'hundred':
      return Math.round(amount / 100) * 100
    case 'thousand':
      return Math.round(amount / 1000) * 1000
    case 'ten-thousand':
      return Math.round(amount / 10000) * 10000
    default:
      return amount
  }
}

// Rumus PMT (Payment): P * [r(1+r)^n] / [(1+r)^n - 1]
const monthlyPaymentRaw = computed(() => {
  const rate = monthlyRate.value
  const n = numPayments.value
  const p = principal.value

  if (rate === 0) return p / n // Jika rate 0%

  return (p * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1)
})

// Rumus PMT (Payment): P * [r(1+r)^n] / [(1+r)^n - 1]
const monthlyPayment = computed(() => {
  return roundAmount(monthlyPaymentRaw.value, roundingOption.value)
})

// Schedule perhitungan
const schedule = computed(() => {
  let remainingBalance = principal.value
  const paymentSchedule = []

  for (let month = 1; month <= numPayments.value; month++) {
    // Round the interest payment first
    const interestPayment = roundAmount(remainingBalance * monthlyRate.value, roundingOption.value)

    // Principal payment = total payment - rounded interest
    const principalPayment = monthlyPayment.value - interestPayment

    // Update remaining balance
    remainingBalance = Math.max(0, remainingBalance - principalPayment)

    paymentSchedule.push({
      month,
      monthlyPayment: monthlyPayment.value,
      principalPayment,
      interestPayment,
      remainingBalance: roundAmount(remainingBalance, roundingOption.value),
    })
  }

  return paymentSchedule
})

// Summary calculations
const summary = computed(() => {
  const totalInterest = schedule.value.reduce((sum, payment) => sum + payment.interestPayment, 0)

  return {
    monthlyPayment: monthlyPayment.value,
    totalPayment: monthlyPayment.value * numPayments.value,
    totalInterest,
    totalPrincipal: principal.value,
  }
})

// Format currency function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const downloadHandler = async () => {
  const fileName = `export_${new Date().toISOString()}_schedule_${tenure.value}_${annualRate.value}.xlsx`
  const data = await exportToExcel(formatDataForExport(schedule.value), fileName)
  downloadExcelFile(data.buffer, fileName)
  console.log(data)
}
</script>

<template>
  <div class="container-fluid py-4" style="background-color: #f8f9fa; min-height: 100vh">
    <div class="row justify-content-center">
      <div class="col-12">
        <!-- Header Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h1 class="card-title text-center mb-4">Simulasi Kartu Piutang Nasabah</h1>

            <!-- Input Parameters -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Pokok Pinjaman</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="principal"
                  placeholder="25000000"
                />
                <small class="text-muted">{{ formatCurrency(principal) }}</small>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Tenor (Bulan)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="tenure"
                  placeholder="24"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Rate Tahunan (%)</label>
                <input
                  type="number"
                  step="0.1"
                  class="form-control"
                  v-model.number="annualRate"
                  placeholder="12"
                />
              </div>
            </div>

            <!-- Summary Cards -->
            <div class="row g-3">
              <div class="col-md-3">
                <div class="card bg-primary bg-opacity-10 border-primary">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-primary fw-semibold">Angsuran Bulanan</h6>
                    <h5 class="card-title text-primary fw-bold">
                      {{ formatCurrency(summary.monthlyPayment) }}
                    </h5>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card bg-success bg-opacity-10 border-success">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-success fw-semibold">Total Pokok</h6>
                    <h5 class="card-title text-success fw-bold">
                      {{ formatCurrency(summary.totalPrincipal) }}
                    </h5>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card bg-warning bg-opacity-10 border-warning">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-warning fw-semibold">Total Bunga</h6>
                    <h5 class="card-title text-warning fw-bold">
                      {{ formatCurrency(summary.totalInterest) }}
                    </h5>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card bg-danger bg-opacity-10 border-danger">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-danger fw-semibold">Total Pembayaran</h6>
                    <h5 class="card-title text-danger fw-bold">
                      {{ formatCurrency(summary.totalPayment) }}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Schedule -->
        <div class="card shadow-sm">
          <div class="card-header">
            <section class="d-flex align-items-center justify-content-between">
              <h5 class="card-title fw-medium mb-0">Jadwal Angsuran</h5>
              <button type="button" class="btn btn-outline-primary" @click="downloadHandler">
                Download
              </button>
            </section>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="">
                  <tr>
                    <th>Bulan</th>
                    <th class="text-end">Total Angsuran</th>
                    <th class="text-end">Pokok</th>
                    <th class="text-end">Bunga</th>
                    <th class="text-end">Sisa Pokok</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in schedule" :key="payment.month">
                    <td class="fw-semibold">{{ payment.month }}</td>
                    <td class="text-end">{{ formatCurrency(payment.monthlyPayment) }}</td>
                    <td class="text-end text-success">
                      {{ formatCurrency(payment.principalPayment) }}
                    </td>
                    <td class="text-end text-warning">
                      {{ formatCurrency(payment.interestPayment) }}
                    </td>
                    <td class="text-end fw-semibold">
                      {{ formatCurrency(payment.remainingBalance) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Logic Explanation -->
        <div class="card shadow-sm mt-4">
          <div class="card-header">
            <h5 class="card-title mb-0">Penjelasan Logic Perhitungan</h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">1. Metode Anuitas</h6>
                <p class="text-muted">
                  Menggunakan sistem angsuran tetap bulanan dimana jumlah angsuran sama setiap
                  bulan, namun komposisi pokok dan bunga berubah.
                </p>

                <h6 class="fw-bold text-primary">2. Rumus PMT (Payment)</h6>
                <div class="bg-light p-3 rounded">
                  <code>PMT = P × [r(1+r)^n] / [(1+r)^n - 1]</code>
                </div>
                <ul class="mt-2 text-muted">
                  <li>P = Pokok pinjaman</li>
                  <li>r = Rate bulanan (rate tahunan ÷ 12)</li>
                  <li>n = Jumlah pembayaran (tenor dalam bulan)</li>
                </ul>
              </div>

              <div class="col-md-6">
                <h6 class="fw-bold text-primary">3. Perhitungan Per Bulan</h6>
                <ul class="text-muted">
                  <li><strong>Bunga Bulanan:</strong> Sisa pokok × rate bulanan</li>
                  <li><strong>Pokok Bulanan:</strong> Total angsuran - bunga bulanan</li>
                  <li><strong>Sisa Pokok:</strong> Sisa pokok sebelumnya - pokok bulanan</li>
                </ul>

                <h6 class="fw-bold text-primary">4. Karakteristik</h6>
                <ul class="text-muted">
                  <li>Di awal tenor, porsi bunga lebih besar dari pokok</li>
                  <li>Seiring waktu, porsi pokok bertambah dan bunga berkurang</li>
                  <li>Total angsuran bulanan selalu sama</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: none;
  border-radius: 12px;
}

.card-header {
  color: white;
  border-radius: 12px 12px 0 0 !important;
}

.table th {
  font-weight: 600;
  font-size: 0.9rem;
}

.table td {
  font-size: 0.9rem;
  vertical-align: middle;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.bg-primary.bg-opacity-10 {
  background-color: rgba(13, 110, 253, 0.1) !important;
}

.bg-success.bg-opacity-10 {
  background-color: rgba(25, 135, 84, 0.1) !important;
}

.bg-warning.bg-opacity-10 {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.bg-danger.bg-opacity-10 {
  background-color: rgba(220, 53, 69, 0.1) !important;
}

.table-hover tbody tr:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.8rem;
  }
}
</style>
