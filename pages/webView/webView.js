Page({
  data: {
    url: ''
  },
  onLoad (options) {
    this.setData({
      url: 'https://myseu.cn/wxapp/webview?url=' + options.url.replace(/^http:/, 'https:')
    })
  },
  onShareAppMessage () {
  
  }
})