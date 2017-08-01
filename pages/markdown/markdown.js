Page({
  data: {
    url: '',
    title: '',
    wemark: {},
    markdown: ''
  },
  onLoad(options) {
    this.loadUrl(unescape(options.url))
  },
  loadUrl(url) {
    var that = this
    this.data.url = url
    wx.$.showLoading('加载中')
    wx.request({
      url: url.replace(/\[uuid]/g, wx.$.util('user').getUuid()),
      success(res) {
        wx.$.hideLoading()
        if (res.statusCode < 400) {
          that.setData({ markdown: res.data })
          if (/(^|\n)#\s(.*)(\n|$)/.test(res.data)) {
            let title = RegExp.$2
            that.setData({ title: title })
            wx.setNavigationBarTitle({ title: title })
          }
          wx.$.util('wemark/wemark').parse(res.data, that, { name: 'wemark' })
        } else {
          wx.$.showError('页面不存在或暂无法打开 [' + res.statusCode + ']')
          wx.navigateBack()
        }
      },
      fail(res) {
        wx.$.hideLoading()
        wx.$.showError('请求超时 [' + res.errMsg + ']')
        wx.navigateBack()
      }
    })
  },
  parseLink(event) {
    var url = event.currentTarget.dataset.url
    if (/^\//.test(url)) {
      if (/^(([^\/]|\/\/)+)/.test(this.data.url)) {
        url = RegExp.$1 + url
      }
    }
    let ev = { currentTarget: { dataset: { url: url } } }
    this.open(ev)
  },
  onShareAppMessage() {
    var that = this
    return {
      title: that.data.title,
      path: '/pages/markdown/markdown?url=' + escape(that.data.url)
    }
  }
})