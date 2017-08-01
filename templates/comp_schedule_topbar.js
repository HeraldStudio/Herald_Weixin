exports.get = function() {
  let nextOrExpiredEvents = ['curriculum_provider', 'experiment_provider', 'exam_provider', 'custom_provider'].map(p => {
    return wx.$.util(p).get()
  }).filter(k => k).reduce((a, b) => a.concat(b), []).filter(k => k.noticeData).sort((a, b) => {
    return a.fromTime - b.fromTime
  })

  let now = new Date().getTime()

  let nextEvents = nextOrExpiredEvents.filter(k => k.toTime > now)

  let nextEvent = nextEvents[0]

  let expiredCount = nextOrExpiredEvents.length - nextEvents.length

  if (!nextEvent || Math.floor(nextEvent.fromTime / 1000 / 60 / 60 / 24) != Math.floor(now / 1000 / 60 / 60 / 24)) {
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
}