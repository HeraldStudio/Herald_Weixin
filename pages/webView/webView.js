Page({
  data: {
    url: ''
  },
  onLoad (options) {
    console.log(options)
    this.setData({
      url: 'https://myseu.cn/wxapp/webview?url=' + encodeURIComponent(options.url)
    })
    console.log(this.data.url)
  },
  onShareAppMessage () {
  
  }
})