exports.bind = function (page) {
  if (!wx.$.util('user').isLogin()) {
    return
  }
  let user = wx.$.util('user').getUser()
  page.setData({
    $avatar: {
      url: '',
      name: user.name,
      identity: {
        '21': '东南大学本科生',
        '22': '东南大学研究生'
      }[user.cardnum.substr(0, 2)] || '未知身份',
      cardnum: user.cardnum,
      schoolnum: user.schoolnum,
      showAll: false
    }
  })
  wx.login({
    success () {
      wx.getUserInfo({
        complete (info) {
          page.data.$avatar.url = info.userInfo ? info.userInfo.avatarUrl : ''
          page.setData({ $avatar: page.data.$avatar })
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
  page.$avatar_toggle = function (event) {
    page.data.$avatar.showAll = !page.data.$avatar.showAll
    page.setData({ $avatar: page.data.$avatar })
  }
}