Page({
  data: {

  },
  onShareAppMessage() {
    return {
      title: '小猴偷米',
      path: '/pages/index/index'
    }
  },
  reloadData() {
    wx.$.comp('login').bind(this)
    wx.$.comp('service').bind(this)
    wx.$.comp('avatar').bind(this)
    wx.$.comp('dashboard').bind(this)
    wx.$.comp('schedule').bind(this)
  },
  onLoad(options) {
    this.reloadData()
  },
  onShow() {
    wx.$.comp('login').bind(this)
  },
  onPullDownRefresh() {
    wx.$.comp('service').bind(this)
    wx.$.comp('avatar').bind(this)
    wx.$.comp('login').bind(this)
    wx.$.comp('dashboard').bind(this)
    wx.$.comp('schedule').bind(this, true)
    wx.stopPullDownRefresh()
  }
})
