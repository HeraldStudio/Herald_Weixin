//app.js
App({
  onLaunch: function (options) {
    // Wx.js
    require('utils/wx.js').beginInject()

    this.storage = wx.getStorageSync('storage') || {}
    this.scene = options.scene
  },
  interval: null,
  topBar: '',
  onShow: function (options) {
    this.scene = options.scene
    clearInterval(this.interval)
  },
  onHide: function () {
    this.forceUpdateStorage()
    this.updateTopbar()
    this.interval = setInterval(this.updateTopbar, 5000)
  },
  updateTopbar: function () {
    let text = wx.$.util('topbar').get()
    if (this.topBar !== text) {
      wx.$.log('Topbar', text)
      this.topBar = text
    }
    wx.setTopBarText && wx.setTopBarText({ text: text })
  },
  scene: 0,
  storage: {},
  forceUpdateStorage: function () {
    wx.setStorageSync('storage', this.storage)
  }
})
