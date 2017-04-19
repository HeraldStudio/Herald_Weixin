Page({
  data: {

  },
  reloadData: function() {
    wx.$.comp('slider').bind(this)
    wx.$.comp('login').bind(this)
    wx.$.comp('dashboard').bind(this)
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
