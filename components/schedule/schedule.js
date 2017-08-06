const curriculum = require('../../providers/schedule/curriculum.js')
const experiment = require('../../providers/schedule/experiment.js')
const exam = require('../../providers/schedule/exam.js')
const custom = require('../../providers/schedule/custom.js')

exports.bind = function (page, forceReload) {
  if (!wx.$.util('user').isLogin()) {
    return
  }

  page.setData({
    $schedule: [],
    $schedule_loading: 0,
    $schedule_error: []
  })

  function formatSchedule (schedule) {
    let arr = schedule.filter(k => k !== null).map(k => {
      k.displayData.time = wx.$.util('format').formatTimeNatural(k.fromTime)
      k.displayData.period = wx.$.util('format').formatPeriodNatural(k.fromTime, k.toTime)

      let now = new Date().getTime()
      if (now >= k.fromTime && now < k.toTime) {
        k.displayData.goingOn = true
      } else if (now >= k.toTime) {
        k.displayData.expired = true
      }

      if (!k.displayData.image) {
        let title = k.displayData.topLeft
        k.displayData.color = wx.$.util('format').stringToColor(title)
      }
      return k
    }).sort((a, b) => a.fromTime - b.fromTime)

    return arr.filter((item, index) => arr.indexOf(item) === index)
  }

  function getCurrentWeek () {
    let startDate = wx.$.userStorage('startDate')
    if (!startDate) {
      return ''
    }
    // 计算当前周
    let now = new Date()
    now.setHours(0)
    now.setMinutes(0)
    now.setSeconds(0)
    now.setMilliseconds(0)
    let thisWeek = parseInt((now.getTime() - startDate) / 86400000 / 7 + 1)
    return (thisWeek <= 0 || thisWeek > 16 ? '' : '第' + thisWeek + '周' + wx.$.util('format').formatTime(now, 'EE'))
  }

  let reloadProvider = (p, force) => {
    page.setData({
      $schedule_loading: (page.data.$schedule_loading || 0) + 1
    })
    let obj = {
      success (result) {
        page.setData({
          $schedule: formatSchedule(page.data.$schedule.concat(result)),
          $schedule_loading: page.data.$schedule_loading - 1,
          $schedule_week: getCurrentWeek()
        })
      },
      fail () {
        page.setData({
          $schedule_error: page.data.$schedule_error.concat([p]),
          $schedule_loading: page.data.$schedule_loading - 1,
          $schedule_week: getCurrentWeek()
        })
      }
    }
    if (force) {
      p.update(obj)
    } else {
      p.getOrUpdateAsync(obj)
    }
  }

  [curriculum, experiment, exam, custom].forEach(k => reloadProvider(k, forceReload))

  page.$schedule_forceReload = function () {
    page.data.$schedule_error.forEach(reloadProvider, true)
    page.setData({
      $schedule_error: []
    })
  }

  page.$schedule_delete = function (event) {
    let id = event.currentTarget.dataset.id
    custom.delete(id)
    page.setData({
      $schedule: page.data.$schedule.map(k => {
        if (k.id === id) {
          k.deleted = true
        }
        return k
      })
    })
  }

  page.tapEgg = function () {
    this.egg = this.egg ? this.egg + 1 : 1
    if (this.egg >= 10) {
      this.egg = 0
      wx.navigateTo({ url: '/pages/logs/logs' })
    }
  }
}