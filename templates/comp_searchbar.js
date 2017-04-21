exports.bind = function(page) {
    if (!wx.$.util('user').isLogin()) {
        return
    }
    page.$searchbar_userMenu = function(event) {
        wx.$.showActions([
            {
                name: '退出登录',
                action: function() {
                    wx.$.util('user').logout()
                    page.reloadData()
                }
            }
        ])
    }
}