Page({
  data: {
    loaded: false,
    token: ''
  },
  onShareAppMessage () {
    return {
      title: '小猴偷米',
      path: '/pages/index/index',
      imageUrl: 'http://static.myseu.cn/2017-08-27-icon_unboxing.png'
    }
  },
  onLoad () {
    // 导入原有小程序的 Token，然后清空原有的数据存储（若不清空，每次都会导入这个 Token，导致无法切换用户）
    wx.getStorage({
      key: 'storage',
      success: res => {
        if (res && res.user && res.user.uuid) {
          this.data.token = res.user.uuid
        }
        this.setData({
          token: this.data.token,
          loaded: true
        })
        wx.clearStorage()
      },
      fail: () => {
        this.setData({
          loaded: true
        })
        wx.clearStorage()
      }
    })
  },
  onMessage (e) {
    console.log(e)
  }
})
