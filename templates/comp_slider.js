exports.bind = function(page){
    page.setData({ $slider: [] })

    wx.$.requestApi({
        url: 'https://myseu.cn/checkversion',
        data: {
            versiontype: 'wxapp',
            versionname: '',
            versiontype: ''
        },
        success: function(res) {
            page.setData({ $slider: res.data.content.sliderviews })
        }
    })
}