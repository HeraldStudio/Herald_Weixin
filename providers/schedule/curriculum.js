module.exports = {

  key: 'schedule_curriculum',

  getOrUpdateAsync: function (obj) {
    obj = obj || {}
    let got = this.get()
    if (Array.isArray(got)) {
      obj.success && obj.success(got)
    } else {
      this.update(obj)
    }
  },

  get: function () {
    let storage = wx.$.userStorage(this.key)
    if (Array.isArray(storage)) {
      let nowTime = new Date().getTime()
      return storage.filter(k => k.toTime > nowTime && k.fromTime < nowTime + 7 * 86400000)
    } else {
      return null
    }
  },

  getAll: function () {
    let storage = wx.$.userStorage(this.key)
    if (Array.isArray(storage)) {
      return storage
    } else {
      return null
    }
  },

  clear: function () {
    wx.$.userStorage(this.key, '')
  },

  update: function (obj) {
    let that = this
    obj = obj || {}
    let success = obj.success
    let fail = obj.fail

    wx.$.requestApi({
      route: 'api/term',
      complete: function (res) {
        let term = res.statusCode < 400 ? res.data.content[0] : null
        wx.$.requestApi({
          route: 'api/curriculum',
          data: { term },
          complete: function (result) {
            try {
              // 此处属于在首页下拉刷新课表，这种情况下，清空原有的所有课表数据，更新当前学期课表进行填充
              // 即刷新结束后，只留下当前学期课表
              // 在 fullSchedule 中会补充获取当前一整年的课表
              wx.$.userStorage(that.key, that.format(result.data))
              wx.$.userStorage('schedule_terms', [term])
              success && success(that.get())
            } catch (e) {
              wx.$.error(e)
              fail && fail()
            }
          }
        })
      }
    })
  },

  updateFullYear: function (obj) {
    let today = new Date()
    let curYear = today.getFullYear()
    let curMonth = today.getMonth() + 1
    let curYearShort = curYear.toString().slice(2)
    let lastLastYearShort = (curYear - 2).toString().slice(2)
    let lastYearShort = (curYear - 1).toString().slice(2)
    let nextYearShort = (curYear + 1).toString().slice(2)
    let termsAvailable = []
    if (curMonth <= 6) { // 前半年展示去年短学期、去年秋季学期、春季学期课表
      termsAvailable = [
        lastLastYearShort + '-' + lastYearShort + '-2',
        lastLastYearShort + '-' + lastYearShort + '-3',
        lastYearShort + '-' + curYearShort + '-1',
        lastYearShort + '-' + curYearShort + '-2',
        lastYearShort + '-' + curYearShort + '-3'
      ]
    } else { // 后半年展示春季学期、短学期、秋季学期课表
      termsAvailable = [
        lastYearShort + '-' + curYearShort + '-1',
        lastYearShort + '-' + curYearShort + '-2',
        lastYearShort + '-' + curYearShort + '-3',
        curYearShort + '-' + nextYearShort + '-1',
        curYearShort + '-' + nextYearShort + '-2'
      ]
    }
    let storedTerms = wx.$.userStorage('schedule_terms') || []
    let threads = 0
    let that = this
    wx.$.showLoading('初始化全年课表')
    for (let term of termsAvailable) {
      if (storedTerms.filter(k => k === term).length === 0) {
        threads++
        wx.$.requestApi({
          route: 'api/curriculum',
          data: { term },
          success (result) {
            let data = that.format(result.data)
            wx.$.userStorage(that.key, (that.getAll() || []).concat(data))
            storedTerms = storedTerms.concat([ term ])
            wx.$.userStorage('schedule_terms', storedTerms)
            threads--
            if (threads === 0) {
              wx.$.hideLoading()
              obj.success && obj.success()
            }
          }
        })
      }
    }
    if (threads === 0) {
      wx.$.hideLoading()
      obj.success && obj.success()
    }
  },

  format: function (data) {
    let sidebar = {}
    for (let item of data.sidebar) {
      sidebar[item.course] = {
        teacher: item.lecturer,
        credit: item.credit
      }
    }

    // 读取开学日期
    let startDate = new Date()

    // 服务器端返回的startMonth已经是Java/JavaScript型的月份表示，直接设置不用减一
    let split = data.term.split('-')
    startDate.setFullYear(parseInt('20' + split[0]) + (split[2] === 3 ? 1 : 0))
    startDate.setMonth(data.content.startdate.month)
    startDate.setDate(data.content.startdate.day)
    startDate.setHours(0)
    startDate.setMinutes(0)
    startDate.setSeconds(0)
    startDate.setMilliseconds(0)

    // 为了保险，检查开学日期的星期，不是周一的话往前推到周一
    if (startDate.getDay() !== 1) {
      startDate.setTime(startDate.getTime() - (startDate.getDay() + 6) % 7 * 86400000)
    }

    // 保存开学日期以便其它地方使用
    wx.$.userStorage('startDate', startDate.getTime())

    // 解析和转换数据
    let startTimes = [
      8 * 60, 8 * 60 + 50, 9 * 60 + 50, 10 * 60 + 40, 11 * 60 + 30,
      14 * 60, 14 * 60 + 50, 15 * 60 + 50, 16 * 60 + 40, 17 * 60 + 30,
      18 * 60 + 30, 19 * 60 + 20, 20 * 60 + 10
    ]
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((k, i) => { // 对每一列课表进行遍历
      let dayFromMon = i
      return data.content[k].map(cell => { // 对课表上每个单元格进行遍历，转换成标准的课程数据
        let name = cell[0]
        let { teacher, credit } = sidebar[name]

        // 这里不要忘了用 parseInt 否则会导致数值比较变成字符串比较，丢失部分课程
        // 另外由于 parseInt 可接受两个参数，直接用 map(parseInt) 会导致部分平台出现问题
        // 参见 https://ruby-china.org/topics/17151
        let [startWeek, endWeek, startTime, endTime] = cell[1].match(/(\d+)/g).slice(0).map(k => parseInt(k))

        startTime = startTimes[startTime - 1]
        endTime = startTimes[endTime - 1] + 45
        let place = cell[2].replace(/^\([单双]\)/, '')
        let weekDesc = startWeek + '-' + endWeek + '周'
        let weeks = []
        for (let j = startWeek; j <= endWeek; j++) {
          weeks.push(j)
        }
        if (/^\(单\)/.test(cell[2])) {
          weeks = weeks.filter(s => s % 2 === 1);
          weekDesc += '单周'
        }
        if (/^\(双\)/.test(cell[2])) {
          weeks = weeks.filter(s => s % 2 === 0);
          weekDesc += '双周'
        }
        return { name, teacher, credit, weeks, weekDesc, dayFromMon, startTime, endTime, place }
      })
    }).reduce((a, b) => a.concat(b)/* 把转换好的每一列合并成一个数组 */, []).map(model => { // 对每一节课进行遍历
      return model.weeks.map(week => { // 对这节课的每周上课进行遍历。
        // 求这一周这一课程上下课时间
        let startTime = startDate.getTime() + (((week - 1) * 7 + model.dayFromMon) * 24 * 60 + model.startTime) * 60 * 1000
        let endTime = startDate.getTime() + (((week - 1) * 7 + model.dayFromMon) * 24 * 60 + model.endTime) * 60 * 1000
        return {
          type: '课程',
          typeId: 'curriculum',
          fromTime: startTime,
          toTime: endTime,
          displayData: {
            topLeft: model.name,
            topRight: '',
            bottomLeft: model.teacher + ' ' + model.place,
            bottomRight: model.weekDesc + ' (' + model.credit + '学分)'
          },
          noticeData: {
            text: '[' + model.place + '] ' + model.name
          }
        }
      })
    }).reduce((a, b) => a.concat(b), []).sort((a, b) => a.fromTime - b.fromTime)
  }
}