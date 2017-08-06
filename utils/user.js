module.exports = {

    auth: function (user, password, callback) {
        var that = this
        if (user.length != 9) {
            wx.$.showError('请输入9位一卡通号')
            return
        }
        if (password.length == 0) {
            wx.$.showError('请输入密码')
            return
        }
        wx.$.showLoading('正在登录…')
        wx.$.requestCompat({
            route: 'uc/auth',
            method: 'POST',
            data: {
                user: user,
                password: password,
                appid: wx.$.util('appid').appid
            },
            complete: function (res1) {
                if (res1.statusCode < 400 && res1.data.length == 40) {
                    wx.$.requestApi({
                        route: 'api/user',
                        data: { uuid: res1.data },
                        complete (res2) {
                            wx.$.hideLoading()
                            if (res2.data.content.schoolnum.length == 8) {
                                let app = getApp()
                                app.storage.user = res2.data.content
                                app.storage.user.uuid = res1.data
                                app.storage.user.password = password
                                wx.$.log('Herald', 'Logged in as', user + '(' + res1.data + ')')
                                app.forceUpdateStorage()
                                callback && callback(res1)
                            } else {
                                wx.$.showError('用户不是本科生或用户信息不完善，请手动登录信息门户解决')
                            }
                        }
                    })
                } else {
                    wx.$.hideLoading()
                    wx.$.showError('无法访问信息门户或密码错误\n' + (res1.statusCode ? '[' + res1.statusCode + ']' : res1.errMsg))
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
        return this.getUuid() != '0000000000000000000000000000000000000000'
    },

    logout: function () {
        getApp().storage.user = null
        getApp().forceUpdateStorage()
    },

    changeAvatar: function (callback) {
        wx.chooseImage({
            count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFilePaths = res.tempFilePaths
                var uploadFinishCB = console.log
                wx.$.util('upload').upload(tempFilePaths, uploadFinishCB)
            }
        })
    }
}
