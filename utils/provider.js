module.exports = function (key, refresher) {
    this.key = key

    this.getOrUpdateAsync = function(obj) {
        obj = obj || {}
        let got = this.get()
        if (got) {
            obj.success && obj.success(got)
        } else {
            refresher(obj)
        }
    }

    this.get = function() {
        let storage = wx.getStorageSync(this.key)
        if (storage) {
            let nowTime = new Date().getTime()
            return storage.filter(k => k.toTime > nowTime && k.fromTime < nowTime + 7 * 86400000)
        } else {
            return null
        }
    }
}