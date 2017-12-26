const format = wx.$.util('format')

Page({
  data: {
    people: 0,
    schoolnum: '',
    results: [],
    periods: []
  },
  curPage: 0,
  ended: false,
  onLoad(options) {
    let user = wx.$.util('user')
    if (user.isLogin()) {
      this.setData({ schoolnum: user.getUser().schoolnum.slice(0, 5) })
    }
    this.updateQuery()
  },
  onSchoolnumChange(event) {
    this.data.schoolnum
      = event.detail.value
      = event.detail.value.toUpperCase().replace(/[^0-9A-CY]/, '')
    return event.detail
  },
  appendResult(data) {
    let that = this
    let cur = Object.keys(data.curriculum).map(k => data.curriculum[k]).reduce((a, b) => a.concat(b), [])
    let curFiltered = {}
    cur.forEach(k => {
      if (k.beginPeriod) {
        for (let i = k.beginPeriod; i <= k.endPeriod; i++) {
          that.data.periods[i - 1]++
        }
        that.setData({
          periods: that.data.periods,
          periodResult: that.data.periods.map(k => k / that.data.people * 100 / 5)
        })
      }
      if (!curFiltered.hasOwnProperty(k.className)) {
        curFiltered[k.className] = k
        curFiltered[k.className].teachers = []
      }
      if (k.teacherName && !curFiltered[k.className].teachers.filter(l => l == k.teacherName).length) {
        curFiltered[k.className].teachers.push(k.teacherName)
      }
    })
    this.data.results = this.data.results.concat(Object.keys(curFiltered).map(k => curFiltered[k]))
    let resultsFiltered = {}
    this.data.results.forEach(k => {
      k.score = parseFloat(k.score) || 0
      if (!resultsFiltered.hasOwnProperty(k.className)) {
        resultsFiltered[k.className] = k
        resultsFiltered[k.className].hit = 0
      }
      resultsFiltered[k.className].hit++
    })
    let classes = Object.keys(resultsFiltered).map(k => resultsFiltered[k]).sort((a, b) => (b.hit * 100 + b.score) - (a.hit * 100 + a.score))
    classes = classes.map(k => {
      k.hitPercent = Math.round(k.hit / that.data.people * 100)
      k.weekSummary = (k.weeks || k.beginWeek + '-' + k.endWeek) + '周' + (k.flip && k.flip !== 'none' ? '隔周' : '')
      k.teacherSummary = k.teachers.slice(0, 2).join('、')
      if (k.teachers.length > 2) {
        k.teacherSummary += '等' + k.teachers.length + '个老师'
      } else if (k.teachers.length == 0) {
        k.teacherSummary = '教师未知'
      }
      return k
    }).filter(k => k.hitPercent >= 10)
    this.setData({
      classes
    })
  },
  updateQuery() {
    let that = this
    if (that.data.schoolnum.length !== 5) {
      return
    }
    let periods = []
    for (let i = 0; i < 13; i++) {
      periods.push(0)
    }
    this.setData({
      schoolnum: that.data.schoolnum,
      results: [],
      classes: [],
      periods,
      people: 0
    })
    let successTrial = 0
    let failTrial = 0
    let noSameClass = false
    let currentTerm = ''
    let fun = (i, j) => {
      i = (i + 10) % 10
      j = (j + 80) % 80
      let classnum = ('0' + i).slice(-1)
      let studentnum = ('0' + j).slice(-2)
      let schoolnum = this.data.schoolnum.slice(0, 3) + (parseInt(this.data.schoolnum.slice(3, 5)) - 1) + classnum + studentnum
      wx.$.requestSimple({
        url: 'https://boss.myseu.cn/ws3/api/curriculum?cardnum=' + schoolnum + '&term=' + currentTerm,
        success(res) {
          if (res.statusCode < 400) {
            that.appendResult(res.data)
            successTrial++
            failTrial = 0
            that.setData({ people: that.data.people + 1 })
            if (successTrial < 20) {
              fun(i, j + 1)
            } else {
              that.setData({ loading: false })
            }
          } else {
            if (failTrial < 20) {
              if (failTrial < 5) {
                fun(i, j + 1)
              } else {
                fun(i + 1, j + 33)
              }
            } else {
              that.setData({ loading: false })
            }
            failTrial++
          }
        }
      })
    }
    this.setData({ loading: true })
    wx.$.requestApi({
      route: 'api/term',
      success: function (res) {
        currentTerm = res.data.content[0].split('-')
        for (let i = 0; i < 2; i++) {
          currentTerm[2]--
          if (currentTerm[2] == 0) {
            currentTerm[2] = 3
            currentTerm[1]--
            currentTerm[0]--
          }
        }
        currentTerm = currentTerm.join('-')
        fun(1, 1)
      }
    })
  },
  onShareAppMessage() {
    return {
      title: '课表预测',
      path: '/pages/curriculumPreview/curriculumPreview'
    }
  }
})