Page({
  data: {
    url: '',
    title: '',
    markdown: {},
    markdownText: ''
  },
  onLoad (options) {
    this.setData({ title: options.title })
    this.loadUrl(decodeURIComponent(options.url))
  },
  loadUrl (url) {
    let that = this
    this.data.url = url

    if (/\[uuid]/.test(url) && !wx.$.util('user').isLogin()) {
      wx.$.ask('需要登录', '请先登录再使用本功能', () => wx.reLaunch({ url: '/pages/index/index' }))
      return
    }

    wx.$.showLoading('加载中')
    let parsedUrl = url.replace(/\[uuid]/g, wx.$.util('user').getUuid())

    if (/\.md$/.test(parsedUrl)) { // markdown 直接加载
      wx.request({
        url: parsedUrl,
        success (res) {
          wx.$.hideLoading()
          if (res.statusCode < 400) {
            that.loadMarkdown(res.data)
          } else {
            that.loadMarkdown('# ' + res.statusCode + '\n\n页面不存在或暂无法打开')
          }
        },
        fail (res) {
          wx.$.hideLoading()
          that.loadMarkdown('# 访问页面失败\n\n错误信息：' + res.errMsg)
        }
      })
    } else { // 服务器转换加载
      wx.request({
        //url: 'http://localhost:8080/wxapp/tomd',
        url: 'https://myseu.cn/ws3/api/notice',
        method: 'POST',
        data: { url: parsedUrl },
        success (res) {
          wx.$.hideLoading()
          if (res.data.result) {
            that.loadMarkdown('# ' + that.data.title + '\n\n' + res.data.result + '\n\n---\n\n页面由小猴偷米转码，部分格式可能丢失 [原文链接](' + parsedUrl + ')')
          } else {
            that.loadMarkdown('# 解析失败\n\n页面不存在或暂无法打开')
          }
        },
        fail (res) {
          wx.$.hideLoading()
          that.loadMarkdown('# 访问页面失败\n\n错误信息：' + res.errMsg)
        }
      })
    }
  },
  loadMarkdown (data) {
    this.setData({ markdownText: data })
    wx.$.util('wemark/wemark').parse(data, this, { name: 'markdown' })
  },
  onPullDownRefresh () {
    this.loadUrl(this.data.url)
    wx.stopPullDownRefresh()
  },
  parseLink (event) {
    let url = event.currentTarget.dataset.url
    if (/^\//.test(url)) {
      if (/^(([^\/]|\/\/)+)/.test(this.data.url)) {
        url = RegExp.$1 + url
      }
    }
    let ev = { currentTarget: { dataset: { url: url } } }
    this.open(ev)
  },
  adjustImage(event) {
    let width = event.detail.width
    let height = event.detail.height
    let blockIndex = parseInt(event.currentTarget.dataset.blockIndex)
    let inlineIndex = parseInt(event.currentTarget.dataset.inlineIndex)
    this.data.markdown.renderList[blockIndex].content[inlineIndex].style = 'max-width: ' + width + 'rpx; max-height: ' + height + 'rpx; margin: 25rpx auto'
    let that = this
    this.setData({ markdown: that.data.markdown })
  },
  onImageLongTap () {
    this.longTapped = true
    let that = this
    wx.showModal({
      title: '唔，你长按了',
      content: '小程序内不支持长按识别二维码，请点击大图长按保存到相册，然后在微信扫一扫中打开图片进行识别~'
    })
  },
  onShareAppMessage () {
    let that = this
    return {
      title: that.data.title,
      path: '/pages/jwcNotice/jwcNotice?url=' + escape(that.data.url)
    }
  }
})
