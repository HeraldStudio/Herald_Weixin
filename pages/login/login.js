Page({
  loginRedirectPage: null,
  loginRedirectOptions: {},
  onLoad (options) {
    if (!options.loginRedirectPage) {
      wx.reLaunch('/page/index/index')
    }
    this.loginRedirectPage = options.loginRedirectPage
    delete options.loginRedirectPage
    this.loginRedirectOptions = options
    this.reloadData()
  },
  reloadData() {
    let that = this
    if (wx.$.util('user').isLogin()) {
      let url = that.loginRedirectPage
      for (let key in this.loginRedirectOptions) {
        if (this.loginRedirectOptions.hasOwnProperty(key)) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + key + '=' + this.loginRedirectOptions[key];
        }
      }
      wx.redirectTo({ url })
      return
    }
    wx.$.comp('service').bind(this, (serverHealth) => {
      if (serverHealth) {
        wx.$.comp('login').bind(this)
      } else {
        wx.$.comp('server_down').bind(this)
      }
    })
  }
})