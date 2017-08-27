//app.js
App({
  onLaunch: function (options) {
    // Wx.js
    require('utils/wx.js').beginInject()

    this.storage = wx.getStorageSync('storage') || {}
    this.scene = options.scene
  },
  topBarLooping: false,
  topBar: '',
  onShow: function (options) {
    this.scene = options.scene
    this.topBarLooping = false
  },
  onHide: function () {
    this.forceUpdateStorage()
    this.topBarLooping = true
    wx.$.util('seunet').reset()
    this.updateTopbar()
  },
  updateTopbar: function () {
    wx.$.util('topbar').get(text => {
      if (this.topBar !== text) {
        wx.$.log('Topbar', text)
        this.topBar = text
      }
      wx.setTopBarText && wx.setTopBarText({ text: text })
      if (this.topBarLooping) {
        setTimeout(this.updateTopbar, 5000)
      }
    })
  },
  scene: 0,
  storage: {},
  forceUpdateStorage: function () {
    wx.setStorageSync('storage', this.storage)
  }
})
