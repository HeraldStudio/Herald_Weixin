Page({
  data: {

  },
  onShareAppMessage: function () {
    return {
      title: '小猴偷米2',
      path: '/pages/index/index'
    }
  },
  reloadData: function() {
    wx.$.comp('slider').bind(this)
    wx.$.comp('login').bind(this)
    wx.$.comp('dashboard').bind(this)
    wx.$.comp('schedule').bind(this)
    wx.$.comp('searchbar').bind(this)
  },
  onLoad: function(options) {
    this.reloadData()
  },
  onShow: function() {
    wx.$.comp('login').bind(this)
  },
  onPullDownRefresh: function() {
    this.reloadData()
    wx.stopPullDownRefresh()
  }
})
