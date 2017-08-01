function beginCheck() {
    let user = wx.$.util('user').getUser()
    if (user.cardnum && user.password) {
        wx.request({
            url: 'https://w.seu.edu.cn/index.php/index/init',
            success: res => {
                if (res.data.status == 0) {
                    loginToService()
                } else {
                    wx.$.showError('校园网已登录，无需重复登录')
                }
            },
            fail: () => {
            }
        })
    }
}

function loginToService() {
    let user = wx.$.util('user').getUser()
    wx.request({
        method: 'POST',
        url: 'https://w.seu.edu.cn/index.php/index/login',
        data: 'username=' + user.cardnum + '&password=' + wx.arrayBufferToBase64(user.password) + '&enablemacauth=1',
        success: res => {
            wx.$.showSuccess('校园网登录成功')
        },
        fail: res => {
            wx.$.showError('校园网登录失败：' + res.data.info)
        }
    })
}

exports.check = beginCheck