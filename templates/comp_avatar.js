exports.bind = function (page) {
  if (!wx.$.util('user').isLogin()) {
    return
  }
  wx.login({
    success() {
      wx.getUserInfo({
        success(info) {
          wx.$.requestApi({
            route: 'api/user',
            success(res) {
              console.log(res)
              page.setData({
                $avatar: {
                  url: info.userInfo.avatarUrl,
                  name: res.data.content.name,
                  identity: {
                    '21': '东南大学本科生', 
                    '22': '东南大学研究生'
                  }[res.data.content.cardnum.substr(0, 2)] || '未知身份'
                }
              })
            }
          })
        }
      })
    }
  })
  page.$avatar_userMenu = function (event) {
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