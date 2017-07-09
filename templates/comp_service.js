exports.bind = function(page){
    if (!wx.$.util('user').isLogin()) {
        return
  }

  let info = wx.getSystemInfoSync()
  wx.$.requestApi({
    url: 'https://myseu.cn/checkversion',
    data: {
      uuid: wx.$.util('user').getUuid(),
      versiontype: 'wxapp-xiaoq',
      versionname: info.system,
      versioncode: ''
    }
  })

  wx.login({
    success() {
      wx.getUserInfo({
        success(info) {
          wx.$.requestApi({
            route: 'api/user',
            success(res) {
              console.log(res)
              page.setData({
                $service: {
                  url: info.userInfo.avatarUrl,
                  name: res.data.content.name
                }
              })
            }
          })
        }
      })
    }
  })
  page.$service_userMenu = function (event) {
    wx.$.showActions([
      {
        name: '退出登录',
        action: function () {
          wx.$.util('user').logout()
          page.reloadData()
        }
      }
    ])
  }
}