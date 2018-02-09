Page({
  data: {
    gpa: [],
    newItem: {
      name: '',
      credit: '',
      score: '',
    },
    result: [0, 0],
    methods: ["东大计算方法", "WES计算方法（满绩4.0，出国党参考）"],
    mode: 0
  },
  onLoad(options) {
    wx.$.util('user').requireLogin(this)
    wx.$.showLoading('加载中')
    wx.$.requestApi({
      route: 'api/gpa',
      complete: (res) => {
        wx.$.hideLoading()
        let list = res.data.content.slice(1)
        if (list.length) {
          let includeShortSemester = /2$/.test(list[0].semester)
          let included = list[0].semester.replace(/2$/, '1')
          this.setData({
            gpa: list.filter(k => k.extra.trim() === '' && k.semester === list[0].semester || includeShortSemester && k.semester === included)
          })
          this.updatePoints()
        }
      }
    })
  },
  scoreToPoints (score) {
    if (/优/.test(score)) {
      score = 95
    } else if (/良/.test(score)) {
      score = 85
    } else if (/中/.test(score)) {
      score = 75
    } else if (/不及格/.test(score)) {
      score = 0
    } else if (/及格/.test(score)) {
      score = 60
    }
    score = parseFloat(score)
    if (score >= 96) { return 4.8 }
    if (score >= 93) { return 4.5 }
    if (score >= 90) { return 4.0 }
    if (score >= 86) { return 3.8 }
    if (score >= 83) { return 3.5 }
    if (score >= 80) { return 3.0 }
    if (score >= 76) { return 2.8 }
    if (score >= 73) { return 2.5 }
    if (score >= 70) { return 2.0 }
    if (score >= 66) { return 1.8 }
    if (score >= 63) { return 1.5 }
    if (score >= 60) { return 1.0 }
    return 0
  },
  scoreToPoints_WES (score) {
    if (/优/.test(score)) {
      score = 95
    } else if (/良/.test(score)) {
      score = 85
    } else if (/中/.test(score)) {
      score = 75
    } else if (/不及格/.test(score)) {
      score = 0
    } else if (/及格/.test(score)) {
      score = 60
    }
    score = parseInt(score)
    if (score >= 85) { return 4 }
    if (score >= 75) { return 3 }
    if (score >= 60) { return 2 }
    return 0
  },
  updatePoints () {
    let total = 0, total_wes = 0, totalCredit = 0
    this.data.gpa.map(k => {
      k.point = this.scoreToPoints(k.score)
      k.point_wes = this.scoreToPoints_WES(k.score)
      total += k.point * k.credit
      total_wes += k.point_wes * k.credit
      totalCredit += parseFloat(k.credit)
    })
    let result = []
    result.push((totalCredit === 0 ? '0' : total / totalCredit).toFixed(3))
    result.push((totalCredit === 0 ? '0' : total_wes / totalCredit).toFixed(3))
    this.setData({
      gpa: this.data.gpa,
      result
    })
  },
  modeChange (e) {
    this.setData({
      mode: e.detail.value
    })
  },
  onNameInput(e) {
    this.data.newItem.name = e.detail.value
  },
  onCreditInput(e) {
    let { newItem } = this.data
    let { value } = e.detail
    value = value.match(/([1-9][0-9]?)?(\.[05]?)?/)[0]
    console.log(value)
    newItem.credit = value
    this.setData({ newItem })
    return value
  },
  onScoreInput(e) {
    this.data.newItem.score = e.detail.value
  },
  remove(e) {
    this.data.gpa.splice(e.currentTarget.dataset.index, 1)
    this.updatePoints()
  },
  add() {
    let { newItem } = this.data
    if (!newItem.name.trim() || !newItem.credit.trim() || !newItem.score.trim()) {
      return
    }
    if (!/^([1-9][0-9]?(\.[05])?)$/.test(newItem.credit)) {
      wx.$.showError('无法识别学分“' + newItem.credit + '”，请修改')
      return
    }
    if (!/^([1-9][0-9]?(\.[05])?|100|优|良|中|不?及格)$/.test(newItem.score)) {
      wx.$.showError('无法识别成绩“' + newItem.score + '”，请修改')
      return
    }
    this.setData({
      gpa: this.data.gpa.concat([ newItem ]),
      newItem: {
        name: '',
        credit: '',
        score: ''
      }
    })
    this.updatePoints()
  },
  onShareAppMessage () {
  
  }
})