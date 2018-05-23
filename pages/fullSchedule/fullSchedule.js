const schedule = require('../../components/schedule/schedule.js')
const format = require('../../utils/format.js')
const curriculum = require('../../providers/schedule/curriculum.js')
const experiment = require('../../providers/schedule/experiment.js')
const exam = require('../../providers/schedule/exam.js')
const custom = require('../../providers/schedule/custom.js')
const ONE_DAY = 1000 * 60 * 60 * 24

Page({
  data: {},
  onLoad () {
    wx.$.util('user').requireLogin(this)
  },
  onShow () {
    this.loadSchedule()
  },
  showPreview (event) {
    event = event.currentTarget.dataset.event
    event = schedule.formatEvent(event)

    this.setData({ previewing: true, previewItem: event })
  },
  hidePreview () {
    this.setData({ previewing: false })
  },
  delPreviewingEvent () {
    wx.$.showLoading()
    let id = this.data.previewItem.id
    custom.delete(id)
    this.setData({ previewing: false })
    this.loadSchedule()
  },
  loadSchedule () {
    wx.$.showLoading('正在加载日程')

    // 取所有事件合并排序
    let bucket = [curriculum, experiment, exam, custom]
      .map(p => p.getAll() || [])
      .reduce((a, b) => a.concat(b), [])
      .sort((a, b) => a.fromTime - b.fromTime)

    let today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    this.setData({
      curYear: today.getFullYear(),
      curMonth: today.getMonth() + 1,
      curDate: today.getDate()
    })

    let weeks = []

    // 首先至少要包含当前一整月
    let firstFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    let lastTo = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    if (bucket.length > 0) {
      firstFrom = new Date(Math.min(firstFrom.getTime(), bucket[0].fromTime))
      lastTo = new Date(Math.max(lastTo.getTime(), bucket.slice(-1)[0].toTime))
    }

    // 求首日和末日
    let firstTime = firstFrom
    let firstDay = new Date(firstTime.getFullYear(), firstTime.getMonth(), firstTime.getDate())
    let lastTime = lastTo
    let lastDay = new Date(lastTime.getFullYear(), lastTime.getMonth(), lastTime.getDate())

    // 粗略限制数据量不超过前后一年；如果数据量太大，触发省内存模式，则限制数据量不超过前后半年
    let limit = this.data.memorySaveMode ? 182 : 365
    if (firstDay.getTime() < today.getTime() - limit * ONE_DAY) {
      firstDay = new Date(today.getTime() - limit * ONE_DAY)
    }
    if (lastDay.getTime() > today.getTime() + limit * ONE_DAY) {
      lastDay = new Date(today.getTime() + limit * ONE_DAY)
    }

    let firstMonday = new Date(firstDay.getTime() - ((firstDay.getDay() + 6) % 7 + 7) * ONE_DAY)
    let lastSunday = new Date(lastDay.getTime() + ((7 - lastDay.getDay()) % 7 + 7) * ONE_DAY)

    let curWeek = []

    // 遍历每一天
    let curDayStart = firstMonday.getTime() // 哇今天从这个时间开始
    let curDayEnd = curDayStart + ONE_DAY // 哇今天从这个时间结束

    // 本周的最小开始时间和最大结束时间
    // let minFromHour = 12
    // let maxToHour = 12
    let thisWeek = 0

    while (curDayStart <= lastSunday.getTime()) { // 哇今天我还活着，起来看看有啥要干的
      let date = new Date(curDayStart)

      /* 这里因为连续多天的事件需要分别放在每一天的数组里，所以只能用filter，超线性算法，暂时没有比较快的优化办法 */

      let curDay = bucket.filter(k => k.fromTime < curDayEnd && k.toTime >= curDayStart).map(k => {

        // 为了减少向ui层传输数据量，尽可能防止数据量超限，这里附加的字段都用一个字母命名
        k.f/* ==fromHour */ = (k.fromTime / 1000 / 60 / 60 + 8) % 24
        k.t/* ==toHour */ = (k.toTime / 1000 / 60 / 60 + 8) % 24
        // if (k.f/* ==fromHour */ < minFromHour) {
        //   minFromHour = k.f/* ==fromHour */
        // }
        // if (k.t/* ==toHour */ > maxToHour) {
        //   maxToHour = k.t/* ==toHour */
        // }
        k.c = format.stringToColor(k.displayData.topLeft)
        return k
      })

      if (date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()) {

        thisWeek = weeks.length
      }

      // 不管有没有事做，今天都是新的一天
      curWeek.push({
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        e/* ==events */: curDay,
        // o/* ==oddOrEven */: (date.getMonth() + 1) % 2 === 0 ? 'e' : 'o'
      })

      // 看看今天是不是周日了
      if (date.getDay() === 0) {

        // 哇明天是新的一周，这周要结束啦
        weeks.push({
          d/* ==days */: curWeek,
          f/* ==minFromHour */: /*Math.floor(minFromHour)*/ 8,
          t/* ==maxToHour */: /*Math.ceil(maxToHour)*/21
        })
        curWeek = []
        // minFromHour = 12
        // maxToHour = 12
      }

      curDayStart = curDayEnd
      curDayEnd = curDayStart + ONE_DAY
    }

    try {
      this.setData({ weeks, thisWeek })
    } catch (e) {
      if (this.data.memorySaveMode) {
        wx.$.showError('您的日程数据量过大，由于小程序限制无法展示，请清除小程序数据后重试')
      } else {
        this.setData({ memorySaveMode: true })
        this.loadSchedule()
        return
      }
    }

    if (this.data.memorySaveMode) {
      wx.$.showError('您的日程数据量过大，已开启低占用模式，将只展示前后半年内的日程')
    }

    setTimeout(wx.$.hideLoading, 1000)
  }
})
