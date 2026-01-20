// utils/vehicleNumberGenerator.js

class VehicleNumberGenerator {
  constructor() {
    this.generatedNumbers = {}
    this.history = []
    this.currentBatch = []

    this.brands = {
      car: [
        'Toyota',
        'Honda',
        'Suzuki',
        'Daihatsu',
        'Mitsubishi',
        'Nissan',
        'Mazda',
        'Hyundai',
        'KIA',
      ],
      motorcycle: ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'TVS', 'Benelli', 'Royal Enfield'],
      truck: ['Hino', 'Mitsubishi', 'Isuzu', 'UD Trucks', 'Volvo', 'Scania'],
      bus: ['Mercedes-Benz', 'Hino', 'Mitsubishi', 'Isuzu', 'Scania', 'Volvo'],
    }

    this.regionCodes = ['JKT', 'BDG', 'SBY', 'MDN', 'DPS', 'PLB', 'PKU', 'BTM', 'MLG', 'SMG']

    this.vehicleTypeMap = {
      car: 'Mobil',
      motorcycle: 'Motor',
      truck: 'Truk',
      bus: 'Bus',
    }
  }

  // Get brands by vehicle type
  getBrands(vehicleType) {
    return this.brands[vehicleType] || []
  }

  // Generate chassis number
  generateChassisNumber(vehicleType, brand, userId) {
    const year = new Date().getFullYear()
    const regionCode = this.regionCodes[Math.floor(Math.random() * this.regionCodes.length)]
    const brandCode = brand.substring(0, 3).toUpperCase()
    const typeCode = vehicleType.substring(0, 1).toUpperCase()
    const yearCode = year.toString().slice(-2)

    let chassisNumber
    let attempts = 0
    const maxAttempts = 1000

    do {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
      chassisNumber = `${regionCode}${brandCode}${yearCode}${typeCode}${randomPart}`
      attempts++

      if (attempts >= maxAttempts) {
        throw new Error('Tidak dapat menghasilkan nomor rangka yang unik')
      }
    } while (this.isNumberUsed(userId, chassisNumber, 'chassis'))

    return chassisNumber
  }

  // Generate engine number
  generateEngineNumber(vehicleType, brand, userId) {
    const year = new Date().getFullYear()
    const brandCode = brand.substring(0, 2).toUpperCase()
    const engineType = this.getEngineType(vehicleType)
    const yearCode = year.toString().slice(-2)

    let engineNumber
    let attempts = 0
    const maxAttempts = 1000

    do {
      const randomPart = Math.floor(Math.random() * 999999)
        .toString()
        .padStart(6, '0')
      engineNumber = `${brandCode}${engineType}${yearCode}${randomPart}`
      attempts++

      if (attempts >= maxAttempts) {
        throw new Error('Tidak dapat menghasilkan nomor mesin yang unik')
      }
    } while (this.isNumberUsed(userId, engineNumber, 'engine'))

    return engineNumber
  }

  getEngineType(vehicleType) {
    const engineTypes = {
      car: 'A',
      motorcycle: 'M',
      truck: 'T',
      bus: 'B',
    }
    return engineTypes[vehicleType] || 'X'
  }

  isNumberUsed(userId, number, type) {
    if (!this.generatedNumbers[userId]) {
      this.generatedNumbers[userId] = { chassis: new Set(), engine: new Set() }
    }
    return this.generatedNumbers[userId][type].has(number)
  }

  storeGeneratedNumber(userId, number, type) {
    if (!this.generatedNumbers[userId]) {
      this.generatedNumbers[userId] = { chassis: new Set(), engine: new Set() }
    }
    this.generatedNumbers[userId][type].add(number)
  }

  // Generate vehicle numbers for single PK
  generateVehicleNumbers(userId, vehicleType, brand) {
    const chassisNumber = this.generateChassisNumber(vehicleType, brand, userId)
    const engineNumber = this.generateEngineNumber(vehicleType, brand, userId)

    this.storeGeneratedNumber(userId, chassisNumber, 'chassis')
    this.storeGeneratedNumber(userId, engineNumber, 'engine')

    return {
      chassisNumber,
      engineNumber,
    }
  }

  // Generate single number
  generateSingleNumber(userId, vehicleType, brand) {
    try {
      const { chassisNumber, engineNumber } = this.generateVehicleNumbers(
        userId,
        vehicleType,
        brand,
      )

      const result = {
        timestamp: new Date(),
        userId,
        vehicleType,
        brand,
        chassisNumber,
        engineNumber,
        type: 'single',
      }

      this.history.unshift(result)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // ⭐ NEW: Generate vehicle numbers untuk setiap PK
  generateForPKNumbers(pkNumbers, userId, vehicleType, brand, onProgress) {
    const results = []

    try {
      pkNumbers.forEach((pkData, index) => {
        const { chassisNumber, engineNumber } = this.generateVehicleNumbers(
          userId,
          vehicleType,
          brand,
        )

        results.push({
          sequence: pkData.sequence,
          pkNumber: pkData.pkNumber,
          chassisNumber,
          engineNumber,
          vehicleType,
          brand,
          userId,
          timestamp: new Date(),
        })

        // Progress callback
        if (onProgress && (index % 10 === 0 || index === pkNumbers.length - 1)) {
          const progress = ((index + 1) / pkNumbers.length) * 100
          onProgress({
            current: index + 1,
            total: pkNumbers.length,
            progress: Math.round(progress),
          })
        }
      })

      this.currentBatch = results

      this.history.unshift({
        timestamp: new Date(),
        userId,
        vehicleType,
        brand,
        quantity: results.length,
        type: 'bulk',
      })

      return {
        success: true,
        data: results,
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Generate bulk numbers (original method)
  async generateBulkNumbers(userId, vehicleType, brand, quantity, onProgress) {
    this.currentBatch = []
    let successCount = 0

    try {
      for (let i = 0; i < quantity; i++) {
        try {
          const { chassisNumber, engineNumber } = this.generateVehicleNumbers(
            userId,
            vehicleType,
            brand,
          )

          this.currentBatch.push({
            no: i + 1,
            chassisNumber,
            engineNumber,
            vehicleType,
            brand,
            userId,
            timestamp: new Date(),
          })

          successCount++

          if (onProgress && (i % 10 === 0 || i === quantity - 1)) {
            const progress = ((i + 1) / quantity) * 100
            onProgress({
              current: i + 1,
              total: quantity,
              progress: Math.round(progress),
            })
            await new Promise((resolve) => setTimeout(resolve, 1))
          }
        } catch (error) {
          console.warn(`Failed to generate number ${i + 1}:`, error.message)
        }
      }

      this.history.unshift({
        timestamp: new Date(),
        userId,
        vehicleType,
        brand,
        quantity: successCount,
        type: 'bulk',
      })

      return {
        success: true,
        data: {
          successCount,
          totalRequested: quantity,
          batch: this.currentBatch,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Export to CSV dengan PK Number
  exportToCSV(filename, includePK = false) {
    if (this.currentBatch.length === 0) {
      throw new Error('Tidak ada data untuk di-export')
    }

    let csvContent = includePK
      ? 'Sequence,PK Number,User ID,Jenis Kendaraan,Merk,Nomor Rangka,Nomor Mesin,Tanggal Generate\n'
      : 'No,User ID,Jenis Kendaraan,Merk,Nomor Rangka,Nomor Mesin,Tanggal Generate\n'

    this.currentBatch.forEach((item) => {
      if (includePK && item.pkNumber) {
        csvContent += `${item.sequence},"${item.pkNumber}","${item.userId}","${this.vehicleTypeMap[item.vehicleType]}","${item.brand}","${item.chassisNumber}","${item.engineNumber}","${item.timestamp.toLocaleString('id-ID')}"\n`
      } else {
        const no = item.no || item.sequence || ''
        csvContent += `${no},"${item.userId}","${this.vehicleTypeMap[item.vehicleType]}","${item.brand}","${item.chassisNumber}","${item.engineNumber}","${item.timestamp.toLocaleString('id-ID')}"\n`
      }
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename || `vehicle_numbers_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Get user statistics
  getUserStats(userId) {
    if (!this.generatedNumbers[userId]) {
      return { chassis: 0, engine: 0 }
    }
    return {
      chassis: this.generatedNumbers[userId].chassis.size,
      engine: this.generatedNumbers[userId].engine.size,
    }
  }

  // Get history
  getHistory(limit = 10) {
    return this.history.slice(0, limit)
  }

  // Clear current batch
  clearCurrentBatch() {
    this.currentBatch = []
  }

  // Get vehicle type display name
  getVehicleTypeDisplay(vehicleType) {
    return this.vehicleTypeMap[vehicleType] || vehicleType
  }
}

// Create singleton instance
const vehicleGenerator = new VehicleNumberGenerator()

// Export sebagai composable untuk Vue 3
export function useVehicleGenerator() {
  return {
    generator: vehicleGenerator,
    getBrands: (type) => vehicleGenerator.getBrands(type),
    generateSingle: (userId, vehicleType, brand) =>
      vehicleGenerator.generateSingleNumber(userId, vehicleType, brand),
    generateBulk: (userId, vehicleType, brand, quantity, onProgress) =>
      vehicleGenerator.generateBulkNumbers(userId, vehicleType, brand, quantity, onProgress),
    // ⭐ NEW: Generate untuk PK numbers
    generateForPKs: (pkNumbers, userId, vehicleType, brand, onProgress) =>
      vehicleGenerator.generateForPKNumbers(pkNumbers, userId, vehicleType, brand, onProgress),
    exportCSV: (filename, includePK) => vehicleGenerator.exportToCSV(filename, includePK),
    getUserStats: (userId) => vehicleGenerator.getUserStats(userId),
    getHistory: (limit) => vehicleGenerator.getHistory(limit),
    clearBatch: () => vehicleGenerator.clearCurrentBatch(),
    getVehicleTypeDisplay: (type) => vehicleGenerator.getVehicleTypeDisplay(type),
    getCurrentBatch: () => vehicleGenerator.currentBatch,
  }
}

// ⭐ NEW: Mapping function untuk convert ke format form data
export function mapToFormData(pkVehicleData, additionalFields = {}) {
  if (!pkVehicleData) {
    throw new Error('Data PK dan vehicle number tidak boleh kosong')
  }

  // Extract branch code dari PK Number (asumsi 4 digit pertama)
  const branchCode = pkVehicleData.pkNumber ? pkVehicleData.pkNumber.substring(0, 4) : '0000'

  // Default form structure
  const defaultFormData = {
    FUND_ADV_ARR: '1',
    FUND_BR_ID: branchCode, // ⭐ dari kode cabang
    FUND_TOP_SEASONAL: 30,
    FUND_CONT_DATE: new Date().toISOString().split('T')[0],
    FUND_CONT_NO: pkVehicleData.pkNumber || '', // ⭐ dari PK Number
    COST_CENTER: '00000',
    FUND_CUST_NAME: 'Fulan',
    FUND_ADMF_PRIN: 35000000,
    FUND_INSR_CODE: 'ZURICH',
    FUND_ADMF_EFF_RATE: 12.5,
    FUND_DUE_DATE: new Date().toISOString().split('T')[0],
    FUND_LAST_DATE: new Date().toISOString().split('T')[0],
    FUND_FIRST_DATE: new Date().toISOString().split('T')[0],
    FUND_ADMF_TOP: 36,
    FUND_OBJT_BRAND: pkVehicleData.brand?.toUpperCase() || 'TOYOTA',
    FUND_OBJT_CHASIS_NO: pkVehicleData.chassisNumber || '', // ⭐ dari nomor rangka
    FUND_OBJT_CODE: 'AVANZA',
    FUND_OBJT_ENGINE_NO: pkVehicleData.engineNumber || '', // ⭐ dari nomor mesin
    FUND_OBJT_GROUP: pkVehicleData.vehicleType?.toUpperCase() || 'CAR',
    FUND_OBJT_PRICE: 200000000,
    FUND_OBJT_TYPE: '001',
    FUND_CARA_PEMBIAYAAN: '01',
    FUND_KEGIATAN_USAHA: '003',
    FUND_PPD_DATE: new Date().toISOString().split('T')[0],
    FUND_PPD_NO: 'PPD123456',
    FUND_REASON: '',
    FUND_SALES_THROUGH: '01',
    FUND_UPP_ADM: null,
    FUND_ADV_BENEFIT: null,
    FUND_ADV_INSF: null,
    FUND_ASSIGN_TYPE: '',
    FUND_BP_NASABAH: 'AU26110001',
    FUND_BPKB_STAT: 'O',
    FUND_BRAND_DESC: 'TOY',
    FUND_BUSINESS_SECTOR: null,
    FUND_CHANNEL: '001',
    FUND_CL_ID: null,
    FUND_COLA_STATUS: 'TBO',
    FUND_COLA_TYPE: '01',
    FUND_COMM_AMT: null,
    FUND_COMM_INSR: null,
    FUND_CUST_ADDR1: '',
    FUND_CUST_ADDR2: '',
    FUND_CUST_BIRTH: '2000-01-01',
    FUND_CUST_CITY: 'BEKASI',
    FUND_CUST_GENRE: '01',
    FUND_CUST_OID: null,
    FUND_KTP_NO: '3173066412930003',
    FUND_NPWP_NO: null,
    CUST_OCCUPATION: null,
    FUND_CUST_TYPE: 'PER',
    FUND_DEAL_CODE: '',
    FUND_DEAL_COMM: null,
    FUND_DEF_ADM: null,
    FUND_DESC: 'NEW AVANZA G 1.3 MT',
    FUND_GROSS_DP: '50000000',
    FUND_NET_DP: '35000000',
    FUND_DP_REAL: '25',
    DSR: '',
    FUND_FIN_TYPE: '1',
    FUND_FLAG_INPUT: '5',
    FUND_INSF_AMT: null,
    FUND_INSF_INSR: null,
    FUND_INSR_EXT_TOP: null,
    FUND_INSR_NAME: 'ZURICH',
    FUND_INSR_TYPE: '1',
    FUND_INSR_TYPE_DESC: 'TOTAL LOSS ONLY (TLO)',
    FUND_ADMF_INST_AMT: null,
    FUND_INT_TYPE: '01',
    FUND_LEASE_TYPE: '01',
    LTV: null,
    FUND_MKPP_ID: '000',
    FUND_OBJT_ENGINE_CAPACITY: '1200',
    FUND_OBJT_DOC: 'N',
    FUND_OBJT_MODEL: '44C',
    FUND_CUST_OWNER_NAME: null,
    FUND_CUST_OWNER_KTP_NO: null,
    FUND_CUST_OWNER_NPWP_NO: null,
    FUND_OBJT_PROD_YEAR: '2026',
    FUND_OBJT_PURPOSE: '05',
    FUND_OBJT_YEAR: '2026',
    FUND_OLD_CONT_NO: '',
    FUND_PAY_TYPE: null,
    FUND_PORTFOLIO: '0000U',
    FUND_PRODUCT_ID: '106',
    FUND_PRODUCT_MATRIX: '0001A',
    FUND_PROGRAM: null,
    FUND_PROV_AMT: null,
    FUND_REGION_ID: null,
    FUND_REHAB_TYPE: null,
    FUND_REFUND_PROV: null,
    FUND_RESCHD_TYPE: null,
    FUND_SUBS_AMT: null,
    FUND_SUBT_FIDS: null,
    FUND_TYPE_DESC: null,
    FUND_UPP_INTR: null,
  }

  // Merge dengan additional fields jika ada
  return {
    ...defaultFormData,
    ...additionalFields,
  }
}

// ⭐ NEW: Batch mapping untuk multiple data
export function mapBatchToFormData(pkVehicleBatch, additionalFields = {}) {
  if (!Array.isArray(pkVehicleBatch) || pkVehicleBatch.length === 0) {
    throw new Error('Batch data tidak valid atau kosong')
  }

  return pkVehicleBatch.map((item) => mapToFormData(item, additionalFields))
}

// Export default untuk penggunaan biasa
export default vehicleGenerator
