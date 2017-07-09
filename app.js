//app.js
App({
  onLaunch: function (options) {
    // Wx.js
    require('utils/wx.js').beginInject()

    this.storage = wx.getStorageSync('storage') || {}
    // this.scene = options.scene
  },
  onShow: function (options) {
    // this.scene = options.scene
  },
  onHide: function () {
    this.forceUpdateStorage()
  },
  scene: 0,
  storage: {},
  forceUpdateStorage: function() {
    wx.setStorageSync('storage', this.storage)
  }
})
