Page({
  data: {},
  onShareAppMessage() {
    return {
      title: '小猴偷米',
      path: '/pages/index/index',
      imageUrl: 'http://static.myseu.cn/2017-08-27-icon_unboxing.png'
    }
  },
  reloadData() {
    wx.$.comp('service').bind(this)
    wx.$.comp('jwc').bind(this)
  },
  onLoad() {
    this.reloadData()
  },
  onPullDownRefresh() {
    this.reloadData()
    wx.stopPullDownRefresh()
  }
})
