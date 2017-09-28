module.exports = {

  auth: function (user, password, callback) {
    let that = this
    if (user.length !== 9) {
      wx.$.showError('请输入9位一卡通号')
      return
    }
    if (password.length === 0) {
      wx.$.showError('请输入密码')
      return
    }
    wx.$.showLoading('正在登录…')
    wx.$.requestSimple({
      route: 'uc/auth',
      method: 'POST',
      data: {
        user: user,
        password: password,
        appid: wx.$.util('appid').appid
      },
      complete: function (res) {
        if (res.statusCode < 400 && /[0-9a-f]{40}/.test(res.data)) {
          that.uuidAuth(res.data, password, () => callback(res))
        } else {
          wx.$.hideLoading()
          wx.$.showError('无法访问信息门户或密码错误\n' + (res1.statusCode ? '[' + res1.statusCode + ']' : res1.errMsg))
        }
      }
    })
  },

  uuidAuth (uuid, password, callback) {
    wx.$.requestApi({
      route: 'api/user',
      data: { uuid },
      complete (res) {
        wx.$.hideLoading()
        if (res.data.content.schoolnum.length === 8) {
          let app = getApp()
          app.storage.user = res.data.content
          app.storage.user.uuid = uuid
          app.storage.user.password = password
          wx.$.log('Herald', 'Logged in as', user + '(' + uuid + ')')
          app.forceUpdateStorage()
          callback && callback(res)
        } else {
          wx.$.showError('用户不是本科生或用户信息不完善，请手动登录信息门户解决')
        }
      }
    })
  },

  getUser: function () {
    return getApp().storage.user || {}
  },

  getUuid: function () {
    return this.getUser().uuid || '0000000000000000000000000000000000000000'
  },

  isLogin: function () {
    return this.getUuid() !== '0000000000000000000000000000000000000000'
  },

  isGraduate: function () {
    return this.getUser().cardnum.substr(0, 2) === '22'
  },

  logout: function () {
    getApp().storage.user = null
    getApp().forceUpdateStorage()
  },

  checkSession: function () {
    let that = this
    wx.$.requestApi({
      route: 'api/user',
      data: { uuid: that.getUuid() },
      complete (res2) {
        if (parseInt(res2.statusCode) === 401) {
          wx.$.ask('提示', '登录已过期，请重新登录', () => {
            that.logout()
            wx.relaunch()
          })
        }
      }
    })
  },

  resetLibPassword: function(callback) {
    this.setLibPassword(this.getUser().cardnum, callback)
  },

  setLibPassword: function(password, callback) {
    let user = this.getUser()
    wx.$.requestApi({
      route: 'uc/update',
      data: {
        cardnum: user.cardnum,
        password: user.password,
        lib_username: user.cardnum,
        lib_password: password
      },
      complete (res) {
        callback && callback(res)
      }
    })
  },

  requireLogin (page, options = {}) {
    if (!wx.$.util('user').isLogin()) {
      options.loginRedirectPage = '/' + page.__route__
      let url = wx.$.config.pageFormatter('login')
      for (let key in options) {
        if (options.hasOwnProperty(key)) {
          url += (url.indexOf('?') === -1 ? '?' : '&') + key + '=' + options[key];
        }
      }
      wx.redirectTo({ url })
    }
  }
}
