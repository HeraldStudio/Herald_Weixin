Page({
  data: {},
  onShareAppMessage () {
    return {
      title: '小猴偷米',
      path: '/pages/index/index',
      imageUrl: 'http://static.myseu.cn/2017-08-27-icon_unboxing.png'
    }
  },
  reloadData (force) {
    wx.$.comp('loading').bind(this)
    wx.$.comp('service').bind(this, (serverHealth) => {
      if (serverHealth) {
        wx.$.comp('login').bind(this)
        wx.$.comp('avatar').bind(this)
        wx.$.comp('dashboard').bind(this)
        wx.$.comp('jwc').bind(this)
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
    this.reloadData(true)
    wx.stopPullDownRefresh()
  }
})
