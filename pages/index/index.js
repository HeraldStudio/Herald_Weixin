Page({
  data: {

  },
  onShareAppMessage() {
    return {
      title: '小猴偷米2',
      path: '/pages/index/index'
    }
  },
  reloadData() {
    wx.$.comp('login').bind(this)
    wx.$.comp('service').bind(this)
    wx.$.comp('avatar').bind(this)
    wx.$.comp('dashboard').bind(this)
    wx.$.comp('schedule').bind(this)
    wx.$.comp('jwc').bind(this)
    wx.$.comp('server_down').bind(this)
  },
  onLoad(options) {
    this.reloadData()
  },
  onShow() {
    wx.$.comp('login').bind(this)
    wx.$.comp('menu_tip').bind(this)
    wx.$.comp('schedule').bind(this)
  },
  onPullDownRefresh() {
    wx.$.comp('service').bind(this)
    wx.$.comp('avatar').bind(this)
    wx.$.comp('login').bind(this)
    wx.$.comp('dashboard').bind(this)

    // 服务器正常时刷新日程，不在线时不刷新
    wx.$.comp('schedule').bind(this, this.data.$service.serverHealth)
    wx.$.comp('jwc').bind(this)
    wx.stopPullDownRefresh()
  }
})
