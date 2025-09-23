<script setup>
import { debounce } from '@/utils/debounce'
import { downloadExcelFile, exportToExcel, formatDataForExport } from '@/utils/excelExport'
import { computed, ref, watch } from 'vue'

// --- INPUTS & OPTIONS ---
const principal = ref(25000000)
const tenure = ref(24)
const annualRate = ref(12)
const calculationMethod = ref('annuity') // 'annuity' or 'flat'
const roundingOption = ref('thousand')

const principalInput = ref(principal.value)
const tenureInput = ref(tenure.value)
const annualRateInput = ref(annualRate.value)

const updateCalculationState = debounce(() => {
  principal.value = Number(principalInput.value) || 0
  tenure.value = Number(tenureInput.value) || 0
  annualRate.value = Number(annualRateInput.value) || 0
}, 800)

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
    case 'none':
      return amount
    default:
      return Math.round(amount) // Round to nearest integer by default
  }
}

// ==========================================================
// --- PMT FUNCTION  ---
// ==========================================================
const pmt = (rate, months, presentValue, type = false) => {
  let result
  if (rate === 0) {
    result = -presentValue / months
  } else {
    const r1 = rate + 1
    const opt = type ? r1 : 1
    result = (presentValue * Math.pow(r1, months) * rate) / (opt * (1 - Math.pow(r1, months)))
  }
  return Math.abs(result)
}

// ==========================================================
// --- ANNUITY CALCULATION ---
// ==========================================================
const annuityMonthlyRate = computed(() => annualRate.value / 100 / 12)

const annuityMonthlyPaymentRaw = computed(() => {
  const rate = annuityMonthlyRate.value
  const n = numPayments.value
  const p = principal.value
  return pmt(rate, n, p, false)
})

const annuityMonthlyPayment = computed(() => {
  return roundAmount(annuityMonthlyPaymentRaw.value, roundingOption.value)
})

// ANNUITY SCHEDULE - Menggunakan metode 30/360
const annuitySchedule = computed(() => {
  if (numPayments.value <= 0) return []

  let outstanding = principal.value
  const paymentSchedule = []
  const installment = annuityMonthlyPaymentRaw.value
  const lendingRate = annualRate.value / 100 // Convert percentage to decimal

  for (let month = 1; month <= numPayments.value; month++) {
    // Interest calculation using 30/360 method
    const interest = outstanding * lendingRate * (30 / 360)

    let principalPayment
    let actualMonthlyPayment

    if (month === numPayments.value) {
      // Last payment: pay all remaining balance
      principalPayment = outstanding
      actualMonthlyPayment = principalPayment + interest
      outstanding = 0
    } else {
      actualMonthlyPayment = installment
      principalPayment = actualMonthlyPayment - interest
      outstanding = Math.max(0, outstanding - principalPayment)
    }

    paymentSchedule.push({
      month,
      monthlyPayment: roundAmount(actualMonthlyPayment, roundingOption.value),
      principalPayment: roundAmount(principalPayment, roundingOption.value),
      interestPayment: roundAmount(interest, roundingOption.value),
      remainingBalance: roundAmount(outstanding, roundingOption.value),
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
// --- FLAT RATE CALCULATION ---
// ==========================================================
const flatSchedule = computed(() => {
  if (numPayments.value <= 0) return []

  // Sesuai dengan Java: flatCalculate method
  const tenor = numPayments.value
  const principalAmount = principal.value
  const interestRate = annualRate.value / 100 // Convert to decimal

  // Principal per month
  const principalFlat = Math.round(principalAmount / tenor)

  // Interest per month (flat calculation from Java)
  const interestFlat = Math.round((principalAmount * interestRate * (tenor / 12)) / tenor)

  // Total installment per month
  const installmentFlat = principalFlat + interestFlat

  let remainingPrincipal = principalAmount
  const paymentSchedule = []

  for (let month = 1; month <= tenor; month++) {
    let principalForThisMonth
    let monthlyPaymentForThisMonth

    if (month === tenor) {
      // Last payment: pay all remaining principal
      principalForThisMonth = remainingPrincipal
      monthlyPaymentForThisMonth = principalForThisMonth + interestFlat
      remainingPrincipal = 0
    } else {
      principalForThisMonth = principalFlat
      monthlyPaymentForThisMonth = installmentFlat
      remainingPrincipal = Math.max(0, remainingPrincipal - principalForThisMonth)
    }

    paymentSchedule.push({
      month,
      monthlyPayment: roundAmount(monthlyPaymentForThisMonth, roundingOption.value),
      principalPayment: roundAmount(principalForThisMonth, roundingOption.value),
      interestPayment: roundAmount(interestFlat, roundingOption.value),
      remainingBalance: roundAmount(remainingPrincipal, roundingOption.value),
    })
  }

  return paymentSchedule
})

const flatSummary = computed(() => {
  const totalInterest = flatSchedule.value.reduce((sum, p) => sum + p.interestPayment, 0)
  const totalPayment = flatSchedule.value.reduce((sum, p) => sum + p.monthlyPayment, 0)

  return {
    monthlyPayment: flatSchedule.value.length > 0 ? flatSchedule.value[0].monthlyPayment : 0,
    totalPayment,
    totalInterest,
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
                  <option value="annuity">Anuitas (30/360)</option>
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
              {{ calculationMethod === 'annuity' ? 'Anuitas (30/360)' : 'Flat' }}
            </h5>
          </div>
          <div class="card-body">
            <div v-if="calculationMethod === 'annuity'" class="row g-4">
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">1. Metode Anuitas (30/360)</h6>
                <p class="text-muted">
                  Menggunakan sistem angsuran tetap bulanan dengan metode perhitungan bunga 30/360
                  (setiap bulan = 30 hari, setahun = 360 hari) sesuai standard perbankan.
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
                <h6 class="fw-bold text-primary">3. Perhitungan Per Bulan (30/360)</h6>
                <ul class="text-muted">
                  <li><strong>Bunga Bulanan:</strong> Outstanding × rate tahunan × (30/360)</li>
                  <li><strong>Pokok Bulanan:</strong> Total angsuran - bunga bulanan</li>
                  <li><strong>Outstanding:</strong> Outstanding sebelumnya - pokok bulanan</li>
                </ul>

                <h6 class="fw-bold text-primary">4. Karakteristik</h6>
                <ul class="text-muted">
                  <li>Cicilan bulanan tetap (kecuali bulan terakhir)</li>
                  <li>Porsi bunga menurun, porsi pokok meningkat</li>
                  <li>Menggunakan standard perbankan 30/360</li>
                </ul>
              </div>
            </div>

            <div v-if="calculationMethod === 'flat'" class="row g-4">
              <div class="col-md-6">
                <h6 class="fw-bold text-primary">1. Metode Flat</h6>
                <p class="text-muted">
                  Bunga dihitung dari pokok pinjaman awal dan dibagi rata ke seluruh tenor. Porsi
                  pokok dan bunga tetap setiap bulan.
                </p>

                <h6 class="fw-bold text-primary">2. Rumus Flat</h6>
                <ul class="text-muted">
                  <li><strong>Pokok/Bulan:</strong> Total Pokok ÷ Tenor</li>
                  <li><strong>Bunga/Bulan:</strong> (Pokok × Rate × Tenor/12) ÷ Tenor</li>
                  <li><strong>Angsuran:</strong> Pokok/Bulan + Bunga/Bulan</li>
                </ul>
              </div>

              <div class="col-md-6">
                <h6 class="fw-bold text-primary">3. Karakteristik</h6>
                <ul class="text-muted">
                  <li>Jumlah bunga per bulan selalu sama</li>
                  <li>Jumlah pokok per bulan selalu sama</li>
                  <li>Angsuran bulanan tetap (kecuali bulan terakhir)</li>
                  <li>Total bunga lebih tinggi dari metode anuitas</li>
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
