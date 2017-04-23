module.exports = {

    key: 'schedule_curriculum',

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
            return storage.filter(k => k.toTime > nowTime && k.fromTime < nowTime + 7 * 86400000)
        } else {
            return null
        }
    },

    clear: function() {
        wx.$.userStorage(this.key, '')
    },

    update: function(obj) {
        var that = this
        obj = obj || {}
        let success = obj.success
        let fail = obj.fail

        wx.$.requestApi({
            route: 'api/term',
            complete: function(res) {
                let term = res.statusCode < 400 ? res.data.content[0] : null
                wx.$.requestApi({
                    route: 'api/curriculum',
                    data: { term },
                    complete: function(result) {
                        try {
                            wx.$.userStorage(that.key, that.format(result.data))
                            success && success(that.get())
                        } catch (e) {
                            wx.$.error(e)
                            fail && fail()
                            return
                        }
                    }
                })
            }
        })
    },

    format: function(data) {
        let sidebar = {}
        for (let i in data.sidebar) {
            sidebar[data.sidebar[i].course] = {
                teacher: data.sidebar[i].lecturer,
                credit: data.sidebar[i].credit
            }
        }

        // 读取开学日期
        let startDate = new Date()

        // 服务器端返回的startMonth已经是Java/JavaScript型的月份表示，直接设置
        startDate.setMonth(data.content.startdate.month)
        startDate.setDate(data.content.startdate.day)
        startDate.setHours(0)
        startDate.setMinutes(0)
        startDate.setSeconds(0)
        startDate.setMilliseconds(0)

        // 如果开学日期比今天晚了超过两个月，则认为是去年开学的。这里用while保证了当前周数永远大于零
        let now = new Date()
        now.setHours(0)
        now.setMinutes(0)
        now.setSeconds(0)
        now.setMilliseconds(0)
        while (startDate.getTime() - now.getTime() > 60 * 86400000) {
            startDate.setFullYear(startDate.getFullYear() - 1)
        }

        // 为了保险，检查开学日期的星期，不是周一的话往前推到周一
        if (startDate.getDay() != 1) {
            startDate.setTime(startDate.getTime() - (startDate.getDay() + 6) % 7 * 86400000)
        }

        // 保存开学日期以便其它地方使用
        wx.$.userStorage('startDate', startDate.getTime())

        // 解析和转换数据
        let startTimes = [
            8 * 60, 8 * 60 + 50, 9 * 60 + 50, 10 * 60 + 40, 11 * 60 + 30,
            14 * 60, 14 * 60 + 50, 15 * 60 + 50, 16 * 60 + 40, 17 * 60 + 30,
            18 * 60 + 30, 19 * 60 + 20, 20 * 60 + 10
        ]
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((k, i) => { // 对每一列课表进行遍历
            let dayFromMon = i
            return data.content[k].map(cell => { // 对课表上每个单元格进行遍历，转换成标准的课程数据
                let name = cell[0]
                let { teacher, credit } = sidebar[name]
                let [startWeek, endWeek, startTime, endTime] = cell[1].match(/(\d+)/g).slice(0)
                startTime = startTimes[startTime - 1]
                endTime = startTimes[endTime - 1] + 45
                let place = cell[2].replace(/^\([单双]\)/, '')
                let weekDesc = startWeek + '-' + endWeek + '周'
                let weeks = []
                for (let j = startWeek; j <= endWeek; j++) { weeks.push(j) }
                if (/^\(单\)/.test(cell[2])) { weeks = weeks.filter(s => s % 2 == 1); weekDesc += '单周' }
                if (/^\(双\)/.test(cell[2])) { weeks = weeks.filter(s => s % 2 == 0); weekDesc += '双周' }
                return { name, teacher, credit, weeks, weekDesc, dayFromMon, startTime, endTime, place }
            })
        }).reduce((a, b) => a.concat(b)/* 把转换好的每一列合并成一个数组 */, []).map(model => { // 对每一节课进行遍历
            return model.weeks.map(week => { // 对这节课的每周上课进行遍历。
                // 求这一周这一课程上下课时间
                let startTime = startDate.getTime() + (((week - 1) * 7 + model.dayFromMon) * 24 * 60 + model.startTime) * 60 * 1000
                let endTime = startDate.getTime() + (((week - 1) * 7 + model.dayFromMon) * 24 * 60 + model.endTime) * 60 * 1000
                return {
                    type: '课程',
                    fromTime: startTime,
                    toTime: endTime,
                    displayData: {
                        topLeft: model.name,
                        topRight: '',
                        bottomLeft: model.teacher + ' ' + model.place,
                        bottomRight: model.weekDesc + ' (' + model.credit + '学分)'
                    }
                }
            })
        }).reduce((a, b) => a.concat(b), []).sort((a, b) => a.fromTime - b.fromTime)
    }
}