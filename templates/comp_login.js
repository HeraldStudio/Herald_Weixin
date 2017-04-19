exports.bind = function(page){
    page.setData({
        $login: {
            isLogin: wx.$.util('user').isLogin()
        }
    })

    let data = {
        cardnum: '',
        password: ''
    }

    page.$login_onCardnumChange = function(event) {
        data.cardnum = event.detail.value
        console.log(data)
    }

    page.$login_onPasswordChange = function(event) {
        data.password = event.detail.value
        console.log(data)
    }

    page.$login_submit = function(event) {
        wx.$.util('user').auth(data.cardnum, data.password, function() {
            page.setData({
                $login: {
                    isLogin: wx.$.util('user').isLogin()
                }
            })
        })
    }
}