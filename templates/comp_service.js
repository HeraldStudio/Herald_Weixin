exports.bind = function(page){
    if (!wx.$.util('user').isLogin()) {
        return
    }
    
    page.setData({ $service: {} })

    let info = wx.getSystemInfoSync()
    wx.$.requestApi({
        url: 'https://myseu.cn/checkversion',
        data: {
            uuid: wx.$.util('user').getUuid(),
            versiontype: 'wxapp-xiaoq',
            versionname: info.system,
            versioncode: ''
        }// ,
        // success: function(res) {
        //     page.setData({ $service: res.data.content })
        // }
    })
}