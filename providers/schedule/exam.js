module.exports = {

  key: 'schedule_exam',

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
      route: 'api/exam',
      complete: function (result) {
        console.log(result)
        try {
          wx.$.userStorage(that.key, that.format(result.data.content))
          success && success(that.get())
        } catch (e) {
          wx.$.error(e)
          fail && fail()

        }
      }
    })
  },

  format: function (data) {
    return data.map(exam => {
      let [year, month, day, hour, minute] = exam.time.match(/(\d+)/g).slice(0)
      let date = new Date(year, month - 1, day, hour, minute)
      let minutes = exam.hour
      return {
        type: '考试',
        typeId: 'exam',
        fromTime: date.getTime(),
        toTime: date.getTime() + minutes * 60 * 1000,
        displayData: {
          topLeft: exam.course,
          topRight: '考试',
          bottomLeft: exam.location,
          bottomRight: ''
        },
        noticeData: {
          text: '[' + exam.location + '] ' + exam.course
        }
      }
    }).sort((a, b) => a.fromTime - b.fromTime)
  }
}