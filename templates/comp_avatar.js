exports.bind = function (page) {
  if (!wx.$.util('user').isLogin()) {
    return
  }
  wx.login({
    success() {
      wx.getUserInfo({
        complete(info) {
          let user = wx.$.util('user').getUser()
          page.setData({
            $avatar: {
              url: info.userInfo ? info.userInfo.avatarUrl : '',
              name: user.name,
              identity: {
                '21': '东南大学本科生', 
                '22': '东南大学研究生'
              }[user.cardnum.substr(0, 2)] || '未知身份'
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