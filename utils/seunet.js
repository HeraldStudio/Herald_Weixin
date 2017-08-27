function beginCheck (callback) {
  let user = wx.$.util('user').getUser()
  if (user.cardnum && user.password) {
    let finished = false
    setTimeout(() => {
      if (!finished) {
        finished = true
        callback && callback()
      }
    }, 1000)
    wx.request({
      url: 'https://w.seu.edu.cn/index.php/index/init',
      success: res => {
        finished = true
        if (parseInt(res.data.status) === 0) {
          loginToService(callback)
        } else {
          callback && callback()
        }
      },
      fail: () => {
        if (!finished) {
          finished = true
          callback && callback()
        }
      }
    })
  }
}

let ignored = false

function loginToService (callback) {
  if (ignored) {
    callback && callback()
    return
  }
  let user = wx.$.util('user').getUser()
  wx.$.requestCompat({
    method: 'POST',
    url: 'https://w.seu.edu.cn/index.php/index/login',
    data: 'username=' + user.cardnum + '&password=' + wx.$.util('base64').encode(user.password) + '&enablemacauth=1',
    complete: res => {
      if (res.data.status === 1) {
        callback && callback('校园网登录成功')
      } else {
        callback && callback('校园网登录失败，请到 nic.seu.edu.cn 开通或续费')
        ignored = true
      }
    }
  })
}

exports.reset = () => ignored = false
exports.check = beginCheck