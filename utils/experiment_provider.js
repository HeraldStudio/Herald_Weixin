module.exports = {

    key: 'schedule_experiment',

    getOrUpdateAsync: function(obj) {
        obj = obj || {}
        let got = this.get()
        if (got) {
            obj.success && obj.success(got)
        } else {
            this.update(obj)
        }
    },

    get: function() {
        let storage = wx.getStorageSync(this.key)
        if (storage) {
            let nowTime = new Date().getTime()
            return storage.filter(k => k.toTime > nowTime && k.fromTime < nowTime + 7 * 86400000)
        } else {
            return null
        }
    },

    update: function(obj) {
        var that = this
        obj = obj || {}
        let success = obj.success
        let fail = obj.fail

        wx.$.requestApi({
            route: 'api/phylab',
            success: function(result) {
                try {
                    wx.setStorageSync(that.key, that.format(result.data.content))
                    success && success(that.get())
                } catch (e) {
                    wx.$.error(e)
                    fail && fail()
                    return
                }
            }
        })
    },

    format: function(data) {
        return Object.keys(data).filter(k => k.length).map(type => data[type].map(lab => {
            let [year, month, day] = lab.Date.match(/(\d+)/g).slice(0)
            let date = new Date(year, month, day)
            let hm = { '上午': 9 * 60 + 45, '下午': 13 * 60 + 45, '晚上': 18 * 60 + 15 }[lab.Day]
            return {
                fromTime: date.getTime() + hm * 60000,
                toTime: date.getTime() + hm * 60000 + 3 * 3600000,
                displayData: {
                    topLeft: lab.name,
                    topRight: '实验',
                    bottomLeft: lab.Teacher + ' ' + lab.Address,
                    bottomRight: type
                }
            }
        })).reduce((a, b) => a.concat(b)).sort((a, b) => a.fromTime - b.fromTime)
    }
}



















