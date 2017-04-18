//app.js
App({
  onLaunch: function () {
    // Wx.js
    require('utils/wx.js').beginInject()

    this.storage = wx.getStorageSync('storage') || {}
  },
  onHide: function () {
    this.forceUpdateStorage()
  },
  storage: {},
  forceUpdateStorage: function() {
    wx.setStorageSync('storage', this.storage)
  }
})
