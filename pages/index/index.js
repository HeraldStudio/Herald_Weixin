Page({
  data: {},
  onShareAppMessage () {
    return {
      title: '小猴偷米',
      path: '/pages/index/index'
    }
  },
  reloadData (force) {
    wx.$.comp('service').bind(this, (serverHealth) => {
      if (serverHealth) {
        wx.$.comp('login').bind(this)
        wx.$.comp('avatar').bind(this)
        wx.$.comp('dashboard').bind(this)
        wx.$.comp('schedule').bind(this, force)
      } else {
        wx.$.comp('server_down').bind(this)
        wx.$.comp('schedule').bind(this)
      }
    })
  },
  onLoad () {
    this.reloadData(false)
  },
  onShow () {
    wx.$.comp('menu_tip').bind(this)
    wx.$.comp('login').bind(this)
    wx.$.comp('schedule').bind(this)
    wx.$.comp('server_down').bind(this)
  },
  onPullDownRefresh () {
    this.reloadData(false)
    wx.stopPullDownRefresh()
  }
})
