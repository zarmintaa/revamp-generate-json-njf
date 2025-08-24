<script setup>
import { debounce } from '@/utils/debounce'
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport'
import { ref, computed, watch } from 'vue'

// --- INPUTS & OPTIONS ---
const principal = ref(25000000)
const tenure = ref(24)
const annualRate = ref(12)
const calculationMethod = ref('annuity') // 'annuity' or 'flat' -> OPSI BARU
const roundingOption = ref('thousand')

const principalInput = ref(principal.value)
const tenureInput = ref(tenure.value)
const annualRateInput = ref(annualRate.value)

const updateCalculationState = debounce(() => {
  principal.value = Number(principalInput.value) || 0
  tenure.value = Number(tenureInput.value) || 0
  annualRate.value = Number(annualRateInput.value) || 0
}, 800) // Tunda kalkulasi selama 500ms setelah user berhenti mengetik

watch([principalInput, tenureInput, annualRateInput], () => {
  updateCalculationState()
})

// --- HELPERS ---
const numPayments = computed(() => tenure.value)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
const roundAmount = (amount, option) => {
  switch (option) {
    case 'hundred':
      return Math.round(amount / 100) * 100
    case 'thousand':
      return Math.round(amount / 1000) * 1000
    case 'ten-thousand':
      return Math.round(amount / 10000) * 10000
    default:
      return Math.round(amount) // Round to nearest integer by default
  }
}

// ==========================================================
// --- ANNUITY (EFFECTIVE RATE) CALCULATION ---
// ==========================================================
const annuityMonthlyRate = computed(() => annualRate.value / 100 / 12)

const annuityMonthlyPaymentRaw = computed(() => {
  const rate = annuityMonthlyRate.value
  const n = numPayments.value
  const p = principal.value
  if (rate === 0) return p / n
  return (p * (rate * Math.pow(1 + rate, n))) / (Math.pow(1 + rate, n) - 1)
})

const annuityMonthlyPayment = computed(() => {
  return roundAmount(annuityMonthlyPaymentRaw.value, roundingOption.value)
})

// KODE PERBAIKAN UNTUK ANNUITY SCHEDULE
const annuitySchedule = computed(() => {
  if (numPayments.value <= 0) return []

  let remainingBalance = principal.value
  const paymentSchedule = []
  for (let month = 1; month <= numPayments.value; month++) {
    // Gunakan 'none' atau pembulatan ke satuan terdekat untuk kalkulasi bunga internal
    const interestPayment = roundAmount(remainingBalance * annuityMonthlyRate.value, 'none')
    let principalPayment, actualMonthlyPayment

    if (month === numPayments.value) {
      // Logika untuk angsuran terakhir sudah BENAR, pertahankan.
      principalPayment = remainingBalance
      actualMonthlyPayment = interestPayment + principalPayment
      remainingBalance = 0
    } else {
      actualMonthlyPayment = annuityMonthlyPayment.value
      principalPayment = actualMonthlyPayment - interestPayment
      remainingBalance = Math.max(0, remainingBalance - principalPayment)
    }

    paymentSchedule.push({
      month,
      monthlyPayment: actualMonthlyPayment,
      principalPayment,
      interestPayment,
      // PERBAIKAN: Bulatkan sisa pokok HANYA untuk tampilan di tabel
      remainingBalance: roundAmount(remainingBalance, 'none'),
    })
  }
  return paymentSchedule
})

const annuitySummary = computed(() => {
  const totalInterest = annuitySchedule.value.reduce((sum, p) => sum + p.interestPayment, 0)
  const totalPayment = annuitySchedule.value.reduce((sum, p) => sum + p.monthlyPayment, 0)
  return {
    monthlyPayment: annuityMonthlyPayment.value,
    totalPayment,
    totalInterest,
    totalPrincipal: principal.value,
  }
})

// ==========================================================
// --- FLAT RATE CALCULATION (LOGIKA BARU) ---
// ==========================================================
const flatPrincipalPerMonth = computed(() => {
  if (numPayments.value === 0) return 0
  return principal.value / numPayments.value
})
const flatInterestPerMonth = computed(() => {
  return (principal.value * (annualRate.value / 100)) / 12
})
const flatMonthlyPayment = computed(() => {
  return flatPrincipalPerMonth.value + flatInterestPerMonth.value
})

const flatSchedule = computed(() => {
  if (numPayments.value <= 0) return []

  let remainingBalance = principal.value
  const paymentSchedule = []

  // Hitung pembayaran pokok dan bunga yang sudah dibulatkan sebagai dasar
  const roundedPrincipalPayment = roundAmount(flatPrincipalPerMonth.value, roundingOption.value)
  const roundedInterestPayment = roundAmount(flatInterestPerMonth.value, roundingOption.value)

  for (let month = 1; month <= numPayments.value; month++) {
    let principalForThisMonth
    let monthlyPaymentForThisMonth

    if (month === numPayments.value) {
      // Untuk angsuran TERAKHIR, lunasi semua sisa pokoknya.
      principalForThisMonth = remainingBalance
      monthlyPaymentForThisMonth = principalForThisMonth + roundedInterestPayment
    } else {
      // Untuk angsuran normal, gunakan angka yang sudah dibulatkan.
      principalForThisMonth = roundedPrincipalPayment
      monthlyPaymentForThisMonth = roundedPrincipalPayment + roundedInterestPayment
    }

    // Kurangi sisa pokok dengan pembayaran pokok bulan ini
    remainingBalance = Math.max(0, remainingBalance - principalForThisMonth)

    paymentSchedule.push({
      month,
      monthlyPayment: monthlyPaymentForThisMonth,
      principalPayment: principalForThisMonth,
      interestPayment: roundedInterestPayment,
      remainingBalance: remainingBalance,
    })
  }
  return paymentSchedule
})

const flatSummary = computed(() => {
  const totalInterest = flatInterestPerMonth.value * numPayments.value
  const totalPayment = principal.value + totalInterest
  return {
    monthlyPayment: roundAmount(flatMonthlyPayment.value, roundingOption.value),
    totalPayment: roundAmount(totalPayment, roundingOption.value),
    totalInterest: roundAmount(totalInterest, roundingOption.value),
    totalPrincipal: principal.value,
  }
})

// ==========================================================
// --- LOGIC SWITCH (PENGGABUNGAN) ---
// ==========================================================
const finalSchedule = computed(() => {
  return calculationMethod.value === 'flat' ? flatSchedule.value : annuitySchedule.value
})
const finalSummary = computed(() => {
  return calculationMethod.value === 'flat' ? flatSummary.value : annuitySummary.value
})

// --- EXCEL EXPORT ---
const downloadHandler = async () => {
  const fileName = `simulasi_${calculationMethod.value}_${tenure.value}bln_${annualRate.value}persen.xlsx`
  const data = await exportToExcel(formatDataForExport(finalSchedule.value), fileName)
  downloadExcelFile(data.buffer, fileName)
}
</script>

<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h1 class="card-title text-center mb-4">Simulasi Kartu Piutang Nasabah</h1>

            <div class="row g-3 mb-4 align-items-end">
              <div class="col-md-3">
                <label class="form-label fw-semibold">Pokok Pinjaman</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="principalInput"
                  placeholder="25000000"
                />
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Tenor (Bulan)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="tenureInput"
                  placeholder="24"
                />
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Rate Tahunan (%)</label>
                <input
                  type="number"
                  step="0.1"
                  class="form-control"
                  v-model.number="annualRateInput"
                  placeholder="12"
                />
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Metode Perhitungan Bunga</label>
                <select class="form-select" v-model="calculationMethod">
                  <option value="annuity">Anuitas (Bunga Efektif)</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
            </div>

            <div class="row g-3">
              <div class="col-md-3">
                <div class="card bg-primary bg-opacity-10 border-primary h-100">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-primary fw-semibold">Angsuran Bulanan</h6>
                    <h5 class="card-title text-primary fw-bold">
                      {{ formatCurrency(finalSummary.monthlyPayment) }}
                    </h5>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card bg-success bg-opacity-10 border-success h-100">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-success fw-semibold">Total Pokok</h6>
                    <h5 class="card-title text-success fw-bold">
                      {{ formatCurrency(finalSummary.totalPrincipal) }}
                    </h5>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card bg-warning bg-opacity-10 border-warning h-100">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-warning fw-semibold">Total Bunga</h6>
                    <h5 class="card-title text-warning fw-bold">
                      {{ formatCurrency(finalSummary.totalInterest) }}
                    </h5>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="card bg-danger bg-opacity-10 border-danger h-100">
                  <div class="card-body text-center">
                    <h6 class="card-subtitle text-danger fw-semibold">Total Pembayaran</h6>
                    <h5 class="card-title text-danger fw-bold">
                      {{ formatCurrency(finalSummary.totalPayment) }}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="card-title fw-medium mb-0">Jadwal Angsuran</h5>
            <button type="button" class="btn btn-outline-primary" @click="downloadHandler">
              Download Excel
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Bulan</th>
                    <th class="text-end">Total Angsuran</th>
                    <th class="text-end">Pokok</th>
                    <th class="text-end">Bunga</th>
                    <th class="text-end">Sisa Pokok</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in finalSchedule" :key="payment.month">
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

        <div class="card shadow-sm mt-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              Penjelasan Logic: Metode
              {{ calculationMethod === 'annuity' ? 'Anuitas (Efektif)' : 'Flat' }}
            </h5>
          </div>
          <div class="card-body">
            <div v-if="calculationMethod === 'annuity'" class="row g-4">
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

            <div v-if="calculationMethod === 'flat'" class="row g-4">
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">1. Metode Flat</h6>
                <p class="text-muted">
                  Angsuran bulanan tetap dengan porsi pokok dan bunga yang juga selalu tetap. Bunga
                  dihitung dari pokok pinjaman awal.
                </p>
                <h6 class="fw-bold text-primary">2. Karakteristik</h6>
                <ul class="text-muted">
                  <li>Jumlah bunga per bulan selalu sama.</li>
                  <li>Jumlah pokok per bulan selalu sama.</li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">3. Rumus Sederhana</h6>
                <ul class="text-muted">
                  <li><strong>Pokok/Bulan:</strong> Total Pokok ÷ Tenor</li>
                  <li><strong>Bunga/Bulan:</strong> (Total Pokok × Rate Tahunan) ÷ 12</li>
                  <li><strong>Angsuran:</strong> Pokok/Bulan + Bunga/Bulan</li>
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
/* Style Anda sudah bagus, tidak ada perubahan yang diperlukan */
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
.form-control:focus,
.form-select:focus {
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
