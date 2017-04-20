exports.bind = function(page) {
    if (!wx.$.util('user').isLogin()) {
        return
    }

    page.setData({
        $schedule: []
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

            if (!k.displayData.image) {
                let title = k.displayData.topLeft
                k.displayData.color = [
                    '#b271cf', '#fb6e6e', '#fca538', 
                    '#acc625', '#60c2b3', '#73b4dc', 
                    '#7497f0', '#9f73e5'
                ][(stringToBytes(title).length * 2 + title.length) % 8]
            }
            return k
        })
    }

    function parseResult(result) {
        console.log(result)
        page.setData({
            $schedule: formatSchedule(page.data.$schedule.concat(result))
        })
    }

    wx.$.util('curriculum_provider').getOrUpdateAsync({ success: parseResult })
    wx.$.util('experiment_provider').getOrUpdateAsync({ success: parseResult })
}