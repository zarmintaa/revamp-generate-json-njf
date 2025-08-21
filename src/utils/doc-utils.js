export class Utils {
  static generateSenderDocNo() {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear()).slice(-2)
    const randomNum = String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')
    return `${day}${month}${year}R${randomNum}`
  }

  static generateDocNoApp(prefix = 'J') {
    const year = new Date().getFullYear().toString().slice(-2) // "25"
    const randomNum = Math.floor(100000 + Math.random() * 900000) // 6-digit random
    const paddedNum = randomNum.toString().padStart(12, '0') // "000000123456"
    return year + prefix + paddedNum
  }
  static sideBarConfig() {
    return [
      {
        routeName: {
          name: 'setting-template-disburse',
        },
        pageTitle: 'Setting Template Disburse',
      },
      {
        routeName: {
          name: 'setting-template-penerusan',
        },
        pageTitle: 'Setting Template Penerusan',
      },
      {
        routeName: {
          name: 'master',
        },
        pageTitle: 'Master',
      },
      {
        routeName: {
          name: 'penerusan',
        },
        pageTitle: 'Penerusan',
      },
      {
        routeName: {
          name: 'schedule',
        },
        pageTitle: 'Schedule',
      },
    ]
  }
}
