Page({
    data: {

    },
    logout: function(event) {
        wx.$.util('user').logout()
        wx.navigateBack()
    }
})