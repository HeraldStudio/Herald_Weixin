exports.bind = function(page) {
    page.setData({ $jwc: [], $jwc_showAll: false })

    let info = wx.getSystemInfoSync()
    wx.$.requestApi({
        route: 'api/jwc',
        success: function(res) {
            page.setData({ $jwc: res.data.content['教务信息'] || [] })
        }
    })

    page.$jwc_toggleShowAll = function() {
        page.setData({ $jwc_showAll: !page.data.$jwc_showAll })
    }
}