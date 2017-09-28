let data = {
  cardnum: '',
  password: ''
}

exports.bind = function (page) {
  if (page.data.$service && !wx.$.util('user').isLogin()) {
    page.setData({
      $login_regexHint: (page.data.$service.matchers || [])
      .filter(k => new RegExp(k.regex).test(data.cardnum))
      .slice(-1).map(k => k.hint).join('')
    })
  }

  page.setData({
    $login: {
      isLogin: wx.$.util('user').isLogin()
    }
  })

  page.$login_onCardnumChange = function (event) {
    data.cardnum = event.detail.value
    page.setData({
      $login_regexHint: (page.data.$service.matchers || [])
                          .filter(k => new RegExp(k.regex).test(data.cardnum))
                          .slice(-1).map(k => k.hint).join('')
    })
  }

  page.$login_onPasswordChange = function (event) {
    data.password = event.detail.value
  }

  page.$login_reload = function () {
    page.setData({
      $login: {
        isLogin: wx.$.util('user').isLogin()
      }
    })
    page.reloadData()
    data = {
      cardnum: '',
      password: ''
    }
  }

  page.$login_submit = function () {
    if (/[0-9a-f]{40}/.test(data.password)) {
      wx.$.util('user').uuidAuth(data.password, '', page.$login_reload)
      return
    }
    if (data.password === '+debug') {
      wx.setEnableDebug({ enableDebug: true })
      return
    }
    if (data.password === '-debug') {
      wx.setEnableDebug({ enableDebug: false })
      return
    }
    if (data.cardnum.trim() === '') {
      wx.$.showError('请输入一卡通号')
      return
    }
    if (data.password.trim() === '') {
      wx.$.showError('请输入密码')
      return
    }
    wx.$.util('user').auth(data.cardnum, data.password, page.$login_reload)
  }
}
