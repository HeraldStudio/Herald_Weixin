exports.bind = function(page){
    if (!wx.$.util('user').isLogin()) {
        return
    }
    
    page.setData({ $slider: [] })

    let info = wx.getSystemInfoSync()
    wx.$.requestApi({
        url: 'https://myseu.cn/checkversion',
        data: {
            versiontype: 'wxapp-' + info.platform,
            versionname: info.system,
            versioncode: ''
        },
        success: function(res) {
            page.setData({ $slider: res.data.content.sliderviews })
        }
    })
}