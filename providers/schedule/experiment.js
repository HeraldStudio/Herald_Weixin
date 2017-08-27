module.exports = {

  key: 'schedule_experiment',

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

    if (wx.$.util('user').isGraduate()) {
      success && success([])
      return
    }

    wx.$.requestApi({
      route: 'api/phylab',
      complete: function (result) {
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
    return Object.keys(data).filter(k => data[k].length).map(type => data[type].map(lab => {
      let [year, month, day] = lab.Date.match(/(\d+)/g).slice(0)
      let date = new Date(year, month - 1, day)
      let hm = { '上午': 9 * 60 + 45, '下午': 13 * 60 + 45, '晚上': 18 * 60 + 15 }[lab.Day]
      return {
        type: '实验',
        typeId: 'experiment',
        fromTime: date.getTime() + hm * 60000,
        toTime: date.getTime() + hm * 60000 + 3 * 3600000,
        displayData: {
          topLeft: lab.name,
          topRight: '',
          bottomLeft: lab.Teacher + ' ' + lab.Address,
          bottomRight: type
        },
        noticeData: {
          text: '[' + lab.Address + '] ' + lab.name
        }
      }
    })).reduce((a, b) => a.concat(b), []).sort((a, b) => a.fromTime - b.fromTime)
  }
}