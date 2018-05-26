Page({
  data: {},
  onShareAppMessage () {
    return {
      title: '小猴偷米',
      path: '/pages/index/index',
      imageUrl: 'http://static.myseu.cn/2017-08-27-icon_unboxing.png'
    }
  },
  onLoad () {
  },
  onMessage (e) {
    console.log(e)
  }
})
