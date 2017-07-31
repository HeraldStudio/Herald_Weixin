module.exports = {

    key: 'schedule_custom',

    getOrUpdateAsync: function(obj) {
        obj = obj || {}
        let got = this.get()
        if (Array.isArray(got)) {
            obj.success && obj.success(got)
        } else {
            this.update(obj)
        }
    },

    get: function() {
        let storage = wx.$.userStorage(this.key)
        if (Array.isArray(storage)) {
            let nowTime = new Date().getTime()
            return storage
        } else {
            return null
        }
    },

    clear: function() {
        wx.$.userStorage(this.key, '')
    },

    update: function(obj) {
        obj.success && obj.success(this.get())
    },

    addSchedule: function(schedule) {
        schedule.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
        schedule.noticeData = {
          text: schedule.displayData.topLeft
        }
        let storage = this.get() || []
        storage.push(schedule)
        wx.$.userStorage(this.key, storage)
    },

    delete: function(id) {
        wx.$.userStorage(this.key, (this.get() || []).filter(k => k.id != id))
    }
}