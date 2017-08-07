const curriculum = require('../../providers/schedule/curriculum.js')
const experiment = require('../../providers/schedule/experiment.js')
const exam = require('../../providers/schedule/exam.js')
const custom = require('../../providers/schedule/custom.js')
const ONE_DAY = 1000 * 60 * 60 * 24

Page({
  data: {},
  onLoad () {
    this.loadCurriculumForYear()
  },
  showEvent(event) {
    event = event.currentTarget.dataset.event

    wx.showActionSheet({
      itemList: [
        event.type + '详情',
        wx.$.util('format').formatPeriodNatural(event.fromTime, event.toTime),
        event.displayData.topLeft,
        event.displayData.topRight,
        event.displayData.bottomLeft,
        event.displayData.bottomRight
      ].filter(k => k.trim() !== ''),
    })
  },
  loadCurriculumForYear() {
    let that = this
    curriculum.updateFullYear({
      success: that.loadSchedule
    })
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

    // 粗略限制数据量不超过两年，即不超过去年今天到明年今天
    if (firstDay.getTime() < today.getTime() - 365 * ONE_DAY) {
      firstDay = new Date(today.getTime() - 365 * ONE_DAY)
    }
    if (lastDay.getTime() > today.getTime() + 365 * ONE_DAY) {
      lastDay = new Date(today.getTime() + 365 * ONE_DAY)
    }

    let firstMonday = new Date(firstDay.getTime() - ((firstDay.getDay() + 6) % 7 + 7) * ONE_DAY)
    let lastSunday = new Date(lastDay.getTime() + ((7 - lastDay.getDay()) % 7 + 7) * ONE_DAY)

    let curWeek = []

    // 遍历每一天
    let curDayStart = firstMonday.getTime() // 哇今天从这个时间开始
    let curDayEnd = curDayStart + ONE_DAY // 哇今天从这个时间结束

    // 本周的最小开始时间和最大结束时间
    let minFromHour = 12
    let maxToHour = 12

    while (curDayStart <= lastSunday.getTime()) { // 哇今天我还活着，起来看看有啥要干的
      let date = new Date(curDayStart)

      /* 这里因为连续多天的事件需要分别放在每一天的数组里，所以只能用filter，超线性算法，暂时没有比较快的优化办法 */

      let curDay = bucket.filter(k => k.fromTime < curDayEnd && k.toTime >= curDayStart).map(k => {

        // 为了减少向ui层传输数据量，尽可能防止数据量超限，这里附加的字段都用一个字母命名
        k.f/* ==fromHour */ = (k.fromTime / 1000 / 60 / 60 + 8) % 24
        k.t/* ==toHour */ = (k.toTime / 1000 / 60 / 60 + 8) % 24
        if (k.f/* ==fromHour */ < minFromHour) {
          minFromHour = k.f/* ==fromHour */
        }
        if (k.t/* ==toHour */ > maxToHour) {
          maxToHour = k.t/* ==toHour */
        }
        return k
      })

      // 不管有没有事做，今天都是新的一天
      curWeek.push({
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        e/* ==events */: curDay,
        o/* ==oddOrEven */: (date.getMonth() + 1) % 2 === 0 ? 'e' : 'o'
      })

      // 看看今天是不是周日了
      if (date.getDay() === 0) {

        // 哇明天是新的一周，这周要结束啦
        weeks.push({
          d/* ==days */: curWeek,
          f/* ==minFromHour */: Math.floor(minFromHour),
          t/* ==maxToHour */: Math.ceil(maxToHour)
        })
        curWeek = []
        minFromHour = 12
        maxToHour = 12
      }

      curDayStart = curDayEnd
      curDayEnd = curDayStart + ONE_DAY
    }

    try {
      this.setData({ weeks })
    } catch (e) {
      wx.$.showError('数据量过大，由于小程序限制无法展示，请删除持续时间较长的自定义日程，或者清空小程序数据后重试')
    }

    let scroll = () => {
      wx.createSelectorQuery().select('#current').boundingClientRect(rect => {
        if (!rect) {
          setTimeout(scroll, 100)
        } else {
          wx.pageScrollTo({ scrollTop: rect.top - 30 })
          wx.$.hideLoading()
        }
      }).exec()
    }

    scroll()
  }
})