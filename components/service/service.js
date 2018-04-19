exports.bind = function (page, callback) {
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
    success (res) {
      if (res.data && res.data.content) {
        res.data.content.isLogin = wx.$.util('user').isLogin()
        page.setData({ $service: res.data.content })

        let health = res.data.content.serverHealth
        callback && callback(health)
      } else {
        page.setData({ 
          $service: {
            isLogin: wx.$.util('user').isLogin()
          }
        })
        callback(false)
      }
    },
    fail() {
      page.setData({
        $service: {
          isLogin: wx.$.util('user').isLogin()
        }
      })
      callback(false)
    }
  })
}