exports.bind = function(page) {
    if (!wx.$.util('user').isLogin()) {
        return
    }

    page.setData({
        $schedule: [],
        $schedule_loading: [],
        $schedule_error: [],
        $schedule_week: wx.$.userStorage('schedule_week')
    })

    function formatSchedule(schedule) {
        return schedule.filter(k => k !== null).map(k => {
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
    }

    function getCurrentWeek() {
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
        return (thisWeek <= 0 ? '假日' : '第' + thisWeek + '周' + wx.$.util('format').formatTime(now, 'EE'))
    }

    let reloadProvider = (p, force) => {
        page.setData({
            $schedule_loading: page.data.$schedule_loading.concat(p)
        })
        if (force) {
            wx.$.util(p).clear()
        }
        wx.$.util(p).getOrUpdateAsync({ 
            success: function(result) {
                page.setData({
                    $schedule: formatSchedule(page.data.$schedule.concat(result)),
                    $schedule_loading: page.data.$schedule_loading.filter(q => q != p),
                    $schedule_week: getCurrentWeek()
                })
            }, 
            fail: function() { 
                page.setData({
                    $schedule_error: page.data.$schedule_error.concat([p]),
                    $schedule_loading: page.data.$schedule_loading.filter(q => q != p),
                    $schedule_week: getCurrentWeek()
                })
            }
        })
    }

    ['curriculum_provider', 'experiment_provider', 'custom_provider'].forEach(k => reloadProvider(k, false))

    page.$schedule_forceReload = function() {
        page.data.$schedule_error.forEach(reloadProvider, true)
        page.setData({
            $schedule_error: []
        })
    }

    page.$schedule_delete = function(event) {
        let id = event.currentTarget.dataset.id
        wx.$.util('custom_provider').delete(id)
        page.setData({
            $schedule: page.data.$schedule.map(k => {
                if (k.id == id) {
                    k.deleted = true
                }
                return k
            })
        })
    }
}