let data = {
    cardnum: '',
    password: ''
}

exports.bind = function(page){
    page.setData({
        $login: {
            isLogin: wx.$.util('user').isLogin()
        }
    })

    page.$login_onCardnumChange = function(event) {
        data.cardnum = event.detail.value
    }

    page.$login_onPasswordChange = function(event) {
        data.password = event.detail.value
    }

    page.$login_submit = function (event) {
      if (data.cardnum.trim() == '') {
        wx.$.showError('请输入一卡通号')
        return
      }
      if (data.password.trim() == '') {
        wx.$.showError('请输入密码')
        return
      }
        if (data.cardnum.substr(0, 2) != '21') {
            wx.$.showError('仅支持东南大学本科生登录，请检查一卡通号')
            return
        }
        wx.$.util('user').auth(data.cardnum, data.password, function() {
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
        })
    }
}