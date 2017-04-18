module.exports = {

  appid: '9f9ce5c3605178daadc2d85ce9f8e064',

  auth: function(user, password) {
    var that = this
    wx.$.requestCompat({
      route: 'uc/auth',
      method: 'POST',
      data: {
        user: user,
        password: password,
        appid: that.appid
      },
      success: function(res) {
        getApp().storage.uuid = res.data
        wx.$.log('Herald', 'Logged in as', user + '(' + res.data + ')')
        getApp().forceUpdateStorage()
      }
    })
  },

  logout: function() {
    getApp().storage.uuid = null
    wx.$.log('Herald', 'Logged out')
    getApp().forceUpdateStorage()
  }
}
