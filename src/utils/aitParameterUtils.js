// src/utils/aitParameterUtils.js

/**
 * Utility functions untuk AIT Parameter
 */

// Mapping amount type ke field name dalam contract data
export const amountTypeFieldMap = {
  POKOK: ['pokok', 'principal', 'amount_pokok'],
  BUNGA: ['bunga', 'interest', 'amount_bunga'],
  DENDA: ['denda', 'penalty', 'amount_denda'],
  SOLD: ['sold', 'amount_sold'],
  EXPENSE: ['expense', 'amount_expense', 'biaya'],
}

/**
 * Mendapatkan amount berdasarkan type dari contract data
 * @param {Object} contract - Data contract
 * @param {string} amountType - Type amount (POKOK, BUNGA, etc.)
 * @param {number} defaultAmount - Default amount jika tidak ditemukan
 * @returns {number} Amount value
 */
export const getAmountByType = (contract, amountType, defaultAmount = 0) => {
  const possibleFields = amountTypeFieldMap[amountType.toUpperCase()] || []

  for (const field of possibleFields) {
    // Check original field name
    if (contract[field] !== undefined && contract[field] !== null) {
      const value = Number(contract[field])
      return isNaN(value) ? defaultAmount : value
    }

    // Check lowercase version
    const lowerField = field.toLowerCase()
    if (contract[lowerField] !== undefined && contract[lowerField] !== null) {
      const value = Number(contract[lowerField])
      return isNaN(value) ? defaultAmount : value
    }

    // Check uppercase version
    const upperField = field.toUpperCase()
    if (contract[upperField] !== undefined && contract[upperField] !== null) {
      const value = Number(contract[upperField])
      return isNaN(value) ? defaultAmount : value
    }
  }

  return defaultAmount
}

/**
 * Validasi apakah AIT parameter lengkap
 * @param {Object} aitParam - AIT parameter object
 * @returns {Object} Validation result
 */
export const validateAitParameter = (aitParam) => {
  const errors = []

  if (!aitParam) {
    errors.push('AIT parameter is null or undefined')
    return { isValid: false, errors }
  }

  // Validate header
  if (!aitParam.aitCode) errors.push('AIT Code is required')
  if (!aitParam.event) errors.push('Event is required')

  // Validate transforms/details
  if (!aitParam.transforms || !Array.isArray(aitParam.transforms)) {
    errors.push('Transforms array is required')
  } else if (aitParam.transforms.length === 0) {
    errors.push('At least one transform is required')
  } else {
    // Validate each transform
    aitParam.transforms.forEach((transform, index) => {
      if (!transform.aitCode) errors.push(`Transform ${index + 1}: AIT Code is required`)
      if (transform.lineGt === undefined || transform.lineGt === null) {
        errors.push(`Transform ${index + 1}: Line GT is required`)
      }
      if (!transform.amountType) errors.push(`Transform ${index + 1}: Amount Type is required`)
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format AIT parameter untuk display
 * @param {Object} aitParam - AIT parameter object
 * @returns {Object} Formatted parameter
 */
export const formatAitParameterForDisplay = (aitParam) => {
  if (!aitParam) return null

  return {
    ...aitParam,
    displayName: `${aitParam.event} (${aitParam.aitCode})`,
    shortDescription:
      aitParam.description?.substring(0, 50) + (aitParam.description?.length > 50 ? '...' : ''),
    transformsCount: aitParam.transforms?.length || 0,
    hasOptionalTransforms: aitParam.transforms?.some((t) => t.isOptional) || false,
    requiredTransforms: aitParam.transforms?.filter((t) => !t.isOptional) || [],
    optionalTransforms: aitParam.transforms?.filter((t) => t.isOptional) || [],
  }
}

/**
 * Group AIT parameters by event
 * @param {Array} aitParameters - Array of AIT parameters
 * @returns {Object} Grouped parameters
 */
export const groupAitParametersByEvent = (aitParameters) => {
  return aitParameters.reduce((groups, param) => {
    const event = param.event
    if (!groups[event]) {
      groups[event] = []
    }
    groups[event].push(param)
    return groups
  }, {})
}

/**
 * Generate dropdown options untuk AIT parameters
 * @param {Array} aitHeaders - Array of AIT headers
 * @returns {Array} Options array untuk select dropdown
 */
export const generateAitParameterOptions = (aitHeaders) => {
  return aitHeaders.map((header) => ({
    value: header.aitCode,
    label: `${header.event} - ${header.description}`,
    aitCode: header.aitCode,
    event: header.event,
    description: header.description,
  }))
}

/**
 * Filter AIT parameters berdasarkan search term
 * @param {Array} aitParameters - Array of AIT parameters
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered parameters
 */
export const filterAitParameters = (aitParameters, searchTerm) => {
  if (!searchTerm) return aitParameters

  const term = searchTerm.toLowerCase()
  return aitParameters.filter(
    (param) =>
      param.event?.toLowerCase().includes(term) ||
      param.aitCode?.toLowerCase().includes(term) ||
      param.description?.toLowerCase().includes(term),
  )
}

/**
 * Check apakah contract data memiliki field yang dibutuhkan untuk amount type
 * @param {Object} contract - Contract data
 * @param {string} amountType - Amount type
 * @returns {boolean} True if contract has required field
 */
export const hasRequiredAmountField = (contract, amountType) => {
  const possibleFields = amountTypeFieldMap[amountType.toUpperCase()] || []

  return possibleFields.some((field) => {
    return (
      contract[field] !== undefined ||
      contract[field.toLowerCase()] !== undefined ||
      contract[field.toUpperCase()] !== undefined
    )
  })
}

/**
 * Get missing amount types untuk contract
 * @param {Object} contract - Contract data
 * @param {Array} transforms - Array of transforms
 * @returns {Array} Array of missing amount types
 */
export const getMissingAmountTypes = (contract, transforms) => {
  return transforms
    .filter((transform) => !transform.isOptional)
    .filter((transform) => !hasRequiredAmountField(contract, transform.amountType))
    .map((transform) => transform.amountType)
}

/**
 * Validate contract data terhadap AIT parameter
 * @param {Object} contract - Contract data
 * @param {Object} aitParam - AIT parameter
 * @returns {Object} Validation result
 */
export const validateContractForAitParameter = (contract, aitParam) => {
  const missingAmountTypes = getMissingAmountTypes(contract, aitParam.transforms || [])
  const hasRequiredFields = missingAmountTypes.length === 0

  return {
    isValid: hasRequiredFields,
    missingAmountTypes,
    warnings: missingAmountTypes.map((type) => `Missing required amount type: ${type}`),
  }
}
