Page({
  data: {
    url: '',
    notice: null,
    filename: ''
  },
  onLoad(options) {
    this.setData({ filename: unescape(options.filename || '') })
    this.loadUrl(unescape(options.url))
  },
  loadUrl(url) {
    var that = this
    this.data.url = url
    wx.$.requestApi({
      url: 'https://myseu.cn/jwc/' + that.data.url,
      success(res) {
        that.setData({ notice: res.data })
      }
    })
  },
  openAsFile() {
    var that = this
    wx.$.showLoading("正在下载文件")
    wx.downloadFile({
      url: 'https://myseu.cn/jwc/' + that.data.notice.url,
      success(res) {
        wx.openDocument({
          filePath: res.tempFilePath,
          success() {
            wx.$.hideLoading()
          },
          fail(res) {
            wx.$.hideLoading()
            wx.$.showError("无法打开该文件，请点击原文链接查看\n" + res.errMsg)
          }
        })
      },
      fail(res) {
        wx.$.hideLoading()
        wx.$.showError("无法下载该文件，请点击原文链接查看\n" + res.errMsg)
      }
    })
  },
  link(event) {
    var pages = getCurrentPages()
    var url = escape(event.currentTarget.dataset.url)
    var filename = escape(event.currentTarget.dataset.filename || '')
    if (pages.length < 5) {
      wx.navigateTo({ url: '/pages/jwcDetail/jwcDetail?filename=' + filename + '&url=' + url })
    } else {
      wx.redirectTo({ url: '/pages/jwcDetail/jwcDetail?filename=' + filename + '&url=' + url })
    }
  },
  onShareAppMessage() {
    var that = this
    var url = escape(this.data.url)
    var filename = escape(this.data.filename || '')
    return {
      title: that.data.notice.title,
      path: '/pages/jwcDetail/jwcDetail?filename=' + filename + '&url=' + url
    }
  }
})