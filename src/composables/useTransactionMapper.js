const aitParameter = [
  {
    event: 'Angsuran',
    aitCode: 'F000002',
    description: 'SETTLEMENT ANGSURAN',
  },
  {
    event: 'Angsuran',
    aitCode: 'F000003',
    description: 'OVERBOOK TO AR',
  },
  {
    event: 'Cancel Angsuran',
    aitCode: 'F100002',
    description: 'REVERSAL ANGSURAN',
  },
  {
    event: 'Cancel Angsuran',
    aitCode: 'F100003',
    description: 'OVERBOOK TO TITIPAN',
  },
]

const aitParameterTransform = [
  {
    aitCode: 'F000002',
    lineGt: 2,
    amountType: 'POKOK',
  },
  {
    aitCode: 'F000002',
    lineGt: 3,
    amountType: 'BUNGA',
  },
  {
    aitCode: 'F000003',
    lineGt: 2,
    amountType: 'POKOK',
  },
  {
    aitCode: 'F000003',
    lineGt: 3,
    amountType: 'BUNGA',
  },
  //
  {
    aitCode: 'F100002',
    lineGt: 2,
    amountType: 'POKOK',
  },
  {
    aitCode: 'F100002',
    lineGt: 3,
    amountType: 'BUNGA',
  },
  {
    aitCode: 'F100003',
    lineGt: 2,
    amountType: 'POKOK',
  },
  {
    aitCode: 'F100003',
    lineGt: 3,
    amountType: 'BUNGA',
  },
]
