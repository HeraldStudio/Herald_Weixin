Page({
    data: {
        item: {
            type: '自定日程',
            fromTime: 0,
            toTime: 0,
            displayData: {
                topLeft: '',
                bottomLeft: '',
                bottomRight: '',
                period: ''
            }
        }
    },
    onLoad: function(options) {
        this.data.item.fromTime = new Date().getTime()
        this.data.item.toTime = new Date().getTime()
        this.setData({
            item: this.data.item
        })
        if (options.item) {
            this.setData({ item: JSON.parse(options.item) })
        }
        this.data.item.displayData.color = wx.$.util('format').stringToColor(this.data.item.displayData.topLeft)
        this.loadDateTime()
    },
    loadDateTime: function() {
        let format = wx.$.util('format')
        let [fd, ft] = format.formatTime(this.data.item.fromTime, 'yyyy-M-d H:mm').split(' ')
        let [td, tt] = format.formatTime(this.data.item.toTime, 'yyyy-M-d H:mm').split(' ')
        this.data.item.displayData.period = wx.$.util('format').formatPeriodNatural(this.data.item.fromTime, this.data.item.toTime)
        this.setData({
            displayFromDate: fd,
            displayFromTime: ft,
            displayToDate: td,
            displayToTime: tt,
            item: this.data.item
        })
    },
    saveDateTime: function() {

        // 由于 parseInt 可接受两个参数，直接用 map(parseInt) 会导致部分平台出现问题
        // 参见 https://ruby-china.org/topics/17151
        function int(str) {
            return parseInt(str)
        }

        // 此处为了兼容性，不能直接用 Date(String) 构造方法
        let [y1, M1, d1] = this.data.displayFromDate.split('-').map(int)
        let [h1, m1] = this.data.displayFromTime.split(':').map(int)
        this.data.item.fromTime = new Date(y1, M1 - 1, d1, h1, m1, 0).getTime()
        let [y2, M2, d2] = this.data.displayToDate.split('-').map(int)
        let [h2, m2] = this.data.displayToTime.split(':').map(int)
        this.data.item.toTime = new Date(y2, M2 - 1, d2, h2, m2, 0).getTime()

        // 更新时段显示
        this.data.item.displayData.period = wx.$.util('format').formatPeriodNatural(this.data.item.fromTime, this.data.item.toTime)
        this.setData({
            item: this.data.item
        })
    },
    onTopLeftChange: function(event) {
        let title = event.detail.value
        this.data.item.displayData.topLeft = title
        this.data.item.displayData.color = wx.$.util('format').stringToColor(title)
    },
    onBottomLeftChange: function(event) {
        this.data.item.displayData.bottomLeft = event.detail.value
    },
    onBottomRightChange: function(event) {
        this.data.item.displayData.bottomRight = event.detail.value
    },
    onFromDateChange: function(event) {
        this.setData({
            displayFromDate: event.detail.value
        })
        this.saveDateTime()
        this.loadDateTime()
        if (this.data.item.fromTime > this.data.item.toTime) {
            this.data.item.toTime = this.data.item.fromTime
            this.loadDateTime()
        }
    },
    onFromTimeChange: function(event) {
        this.setData({
            displayFromTime: event.detail.value
        })
        this.saveDateTime()
        this.loadDateTime()
        if (this.data.item.fromTime > this.data.item.toTime) {
            this.data.item.toTime = this.data.item.fromTime
            this.loadDateTime()
        }
    },
    onToDateChange: function(event) {
        this.setData({
            displayToDate: event.detail.value
        })
        this.saveDateTime()
        this.loadDateTime()
        if (this.data.item.fromTime > this.data.item.toTime) {
            this.data.item.fromTime = this.data.item.toTime
            this.loadDateTime()
        }
    },
    onToTimeChange: function(event) {
        this.setData({
            displayToTime: event.detail.value
        })
        this.saveDateTime()
        this.loadDateTime()
        if (this.data.item.fromTime > this.data.item.toTime) {
            this.data.item.fromTime = this.data.item.toTime
            this.loadDateTime()
        }
    },
    submit: function() {
        if (!this.data.item.displayData.topLeft.trim().length) {
            wx.$.showError('请输入日程标题')
            return
        }
        wx.$.util('custom_provider').addSchedule(this.data.item)
        wx.navigateBack()
    }
})