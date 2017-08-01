exports.bind = function(page, callback){
    let info = wx.getSystemInfoSync()
    let user = wx.$.util('user').getUser()
    wx.$.requestApi({
        url: 'https://myseu.cn/checkversion',
        data: {
            versiontype: 'wxapp-' + info.platform,
            versionname: info.system,
            versioncode: '',
            schoolnum: (user ? user.schoolnum : '00000000')
        },
        success: function(res) {
            console.log(res)
            // 去掉下面注释可模拟服务器down状态
            // res.data.content.serverHealth = false
            res.data.content.isLogin = wx.$.util('user').isLogin()
            page.setData({ $service: res.data.content })

            let health = res.data.content.serverHealth
            callback(health)
        }
    })
}