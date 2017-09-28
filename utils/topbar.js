const curriculum = require('../providers/schedule/curriculum.js')
const experiment = require('../providers/schedule/experiment.js')
const exam = require('../providers/schedule/exam.js')
const custom = require('../providers/schedule/custom.js')

exports.get = function (callback) {
  wx.$.util('seunet').check(text => {
    if (text) {
      callback && callback(text)
    } else {
      callback && callback((() => {
        let nextOrExpiredEvents = [curriculum, experiment, exam, custom].map(p => {
          return p.get() || []
        }).filter(k => k).reduce((a, b) => a.concat(b), []).filter(k => k.noticeData).sort((a, b) => {
          return a.fromTime - b.fromTime
        })

        let now = new Date().getTime()
        let nextEvents = nextOrExpiredEvents.filter(k => k.toTime > now)
        let nextEvent = nextEvents[0]
        let expiredCount = nextOrExpiredEvents.length - nextEvents.length

        if (!nextEvent || new Date(nextEvent.fromTime).toLocaleString().split(' ')[0] !== new Date(now).toLocaleString().split(' ')[0]) {
          if (expiredCount) {
            return expiredCount + '个日程已过期'
          } else {
            return '小猴偷米 · 今天没有日程'
          }
        }

        let time = wx.$.util('format').formatTimeNatural(nextEvent.fromTime)
        if (nextEvent.fromTime > now) {
          return time + '：' + nextEvent.noticeData.text
        }
        if (nextEvent.toTime > now) {
          return '现在：' + nextEvent.noticeData.text
        }
      })())
    }
  })
}