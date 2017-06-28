Page({
    data: {
        domains: [ 'https://www.heraldstudio.com/', 'https://myseu.cn/' ],
        domainIndex: 0,
        methods: [ 'POST', 'GET', 'PUT', 'DELETE' ],
        methodIndex: 0,
        route: 'api/card',
        params: []
    },
    reloadData: function() {
        this.setData({ 
            logs: wx.$.logs.map(k => {
                k.collapsed = true
                return k
            }),
            uuid: wx.$.util('user').getUuid()
        })
    },
    onLoad: function() {
        this.reloadData()
        this.setData({
            params: [['uuid', wx.$.util('user').getUuid()]]
        })
    },
    onPullDownRefresh: function() {
        this.reloadData()
        wx.stopPullDownRefresh()
    },
    toggleCollapsed: function(event) {
        let index = event.currentTarget.dataset.index
        let logs = this.data.logs
        logs[index].collapsed = !logs[index].collapsed
        this.setData({
            logs: logs
        })
    },
    addParam: function(event) {
        var that = this
        this.setData({
            params: that.data.params.concat([['', '']])
        })
    },
    deleteParam: function(event) {
        var that = this
        var index = event.currentTarget.dataset.index
        this.setData({
            params: that.data.params.filter((k, i) => i != index)
        })
    },
    onDomainChange: function(event) {
        this.setData({ domainIndex: event.detail.value })
    },
    onMethodChange: function(event) {
        this.setData({ methodIndex: event.detail.value })
    },
    onRouteChange: function(event) {
        this.setData({ route: event.detail.value })
    },
    onKeyChange: function(event) {
        var that = this
        var index = event.currentTarget.dataset.index
        var params = this.data.params
        params[index][0] = event.detail.value
        this.setData({ params: params })
    },
    onValueChange: function(event) {
        var that = this
        var index = event.currentTarget.dataset.index
        var params = this.data.params
        params[index][1] = event.detail.value
        this.setData({ params: params })
    },
    send: function(event) {
        var that = this
        var data = {}
        for (let i in that.data.params) {
            let [key, value] = that.data.params[i]
            data[key] = value
        }
        wx.$.requestCompat({
            url: that.data.domains[that.data.domainIndex] + that.data.route,
            method: that.data.methods[that.data.methodIndex],
            data: data,
            complete: function() {
                that.reloadData()
                var logs = that.data.logs
                logs[logs.length - 1].collapsed = false
                that.setData({ logs: logs })
            }
        })
    }
})