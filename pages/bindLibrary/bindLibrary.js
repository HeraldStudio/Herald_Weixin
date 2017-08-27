Page({

  data: {
    password: ''
  },
  onChange (event) {
    this.data.password = event.detail.value
  },
  onSubmit () {
    if (!this.data.password.length) {
      wx.$.showError('请输入密码')
      return
    }
    wx.$.showLoading('正在绑定')
    wx.$.util('user').setLibPassword(this.data.password, () => {
      wx.$.requestApi({
        route: 'api/library',
        complete: function (res) {
          wx.$.hideLoading()
          if (res.data.code === 401) {
            wx.$.showError('密码不正确，请重试或到图书馆网站（lib.seu.edu.cn）重置密码。')
          } else {
            wx.$.showSuccess('绑定成功')
            wx.navigateBack()
          }
        }
      })
    })
  }
})