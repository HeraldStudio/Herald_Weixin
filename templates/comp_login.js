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

    page.$login_submit = function(event) {
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