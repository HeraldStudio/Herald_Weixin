exports.bind = function(page) {
    if (!wx.$.util('user').isLogin()) {
        return
    }

    page.setData({
        $schedule: [],
        $schedule_loading: [],
        $schedule_error: []
    })

    function stringToBytes(str) {
        var ch, st, re = [];
        for (var i = 0; i < str.length; i++) {
            ch = str.charCodeAt(i); st = [];
            do { st.push(ch & 0xFF); ch = ch >> 8 } while (ch)
            re = re.concat(st.reverse())
        }  
        return re;  
    }

    function formatSchedule(schedule) {
        return schedule.map(k => {
            k.displayData.time = wx.$.util('format').formatTimeNatural(k.fromTime)
            k.displayData.period = wx.$.util('format').formatPeriodNatural(k.fromTime, k.toTime)

            let now = new Date().getTime()
            if (now >= k.fromTime && now < k.toTime) {
                k.displayData.goingOn = true
            }

            if (!k.displayData.image) {
                let title = k.displayData.topLeft
                k.displayData.color = [
                    '#b271cf', '#fb6e6e', '#fca538', 
                    '#acc625', '#60c2b3', '#73b4dc', 
                    '#7497f0', '#9f73e5'
                ][(stringToBytes(title).length * 2 + title.length) % 8]
            }
            return k
        }).sort((a, b) => a.fromTime - b.fromTime)
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
                    $schedule_loading: page.data.$schedule_loading.filter(q => q != p)
                })
            }, 
            fail: function() { 
                page.setData({
                    $schedule_error: page.data.$schedule_error.concat([p]),
                    $schedule_loading: page.data.$schedule_loading.filter(q => q != p)
                })
            }
        })
    }

    ['curriculum_provider', 'experiment_provider'].forEach(reloadProvider)

    page.$schedule_forceReload = function() {
        page.data.$schedule_error.forEach(reloadProvider, true)
        page.setData({
            $schedule_error: []
        })
    }
}