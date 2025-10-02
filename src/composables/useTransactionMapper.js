import { aitParameter } from '@/utils/data-ait'
import { formatReadableDate } from '@/utils/dayjs'
import { Utils } from '@/utils/doc-utils'
import { useToast } from './useToast'

const getFormatTransaction = (
  aitCode,
  aitLineGt,
  contract,
  docNoApp = Utils.generateDocNoApp('A'),
  postingDate = formatReadableDate(new Date().toLocaleDateString()),
  costCenter = '000',
  instalment = 1,
  amount,
) => {
  return {
    AIT_CODE: aitCode,
    AIT_LINE_GT: aitLineGt,
    AIT_DOC_NO_APP: docNoApp,
    AIT_POSTING_DATE: postingDate,
    AIT_AMOUNT1: amount,
    AIT_COST_CENTER: costCenter,
    AIT_ASSIGNTMENT: contract,
    AIT_REF_KEY_L1: instalment,
  }
}

const getEventFromAit = (aitCode) => {
  return aitParameter.find((param) => (param.aitCode = aitCode))
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return year + month + day
}

export const transactionMapper = (
  contractUploaded,
  transform,
  contNo,
  instalment,
  docNoApp,
  dateTransaction,
  defaultPokok = 1000000,
  defaultBunga = 1000000 * 0.2,
) => {
  let dataTransform = null
  const toast = useToast()

  let bunga = defaultBunga
  let pokok = defaultPokok
  let transactionAmount

  if (contractUploaded.bunga) {
    if (+contractUploaded.bunga !== 0) {
      bunga = contractUploaded.bunga
    }
  }

  if (contractUploaded.pokok) {
    if (+contractUploaded.pokok !== 0) {
      pokok = contractUploaded.pokok
    }
  }

  if (transform.amountType.trim() === 'BUNGA') {
    transactionAmount = bunga
  }

  if (transform.amountType.trim() === 'POKOK') {
    transactionAmount = pokok
  }

  if (transform.amountType.trim() === 'SOLD') {
    if (+transform.lineGt === 1) {
      if (contractUploaded.sold && contractUploaded.sold !== '' && +contractUploaded.sold !== 0) {
        transactionAmount = contractUploaded.sold
      }
    }
  }

  if (transform.amountType.trim() === 'DENDA') {
    if (+transform.lineGt === 10) {
      if (
        contractUploaded.denda &&
        contractUploaded.denda !== '' &&
        +contractUploaded.denda !== 0
      ) {
        transactionAmount = contractUploaded.denda
      }
    }
  }

  if (transform.amountType.trim() === 'EXPENSE') {
    if (+transform.lineGt === 17) {
      if (
        contractUploaded.expense &&
        contractUploaded.expense !== '' &&
        +contractUploaded.expense !== 0
      ) {
        transactionAmount = contractUploaded.expense
      }
    }
  }

  if (transactionAmount) {
    dataTransform = getFormatTransaction(
      transform.aitCode,
      transform.lineGt,
      contNo,
      docNoApp,
      formatDate(dateTransaction),
      '000',
      contractUploaded.instalment ||
        contractUploaded.inst_no ||
        contractUploaded.instalment_number ||
        instalment,
      transactionAmount,
    )
  }

  return dataTransform
}
