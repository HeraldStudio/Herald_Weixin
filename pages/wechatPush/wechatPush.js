Page({
  data: {
  },
  onLoad (options) {
    let that = this
    let url = unescape(options.url).replace(/^http:/, 'https:')
    that.setData({ url: url })
    wx.$.showLoading('加载中')
    wx.$.requestSimple({
      url: url,
      method: 'GET',
      success (res) {
        wx.$.hideLoading()
        let titleMatch = /[^.]rich_media_title[^>]*>\s*([^<]*)\s*</img.exec(res.data)
        if (titleMatch) {
          that.setData({ title: titleMatch[1] })
        }

        let html = res.data
          .replace(/<!([^<>]*<[^<>]*>)*[^<>]*>/g, '')
          .replace(/<(script|style|title|h2)[\s\S]*?<\/\s*\1>/img, '')
          .replace(/(<div\s+id="meta_content"[^>]*>)[\s\S]*?(<div\s+class="rich_media_content)/img, '$1$2')
          .replace(/([>^])\s+([<$])/g, '$1$2')
          .replace(/[\r\n]/g, '')
          .replace(/<\/?\s*(html|head|body|meta|link)(?=[^A-Za-z\-]).*?>/img, '')
          .replace(/(<\/?\s*)section(?=[^A-Za-z\-])(.*?>)/img, '$1p$2')
          .replace(/(<\/?\s*)em(?=[^A-Za-z\-])(.*?>)/img, '$1strong$2')
          .replace(/(<img[^>]+)data-src=/img, '$1 src=')
          .replace(/(<img[^>]+style=")([^>]+>)/img, '$1max-width: 100%;$2')
          .replace(/(<img[^>]*?)(\/?>)/img, '$1 style="max-width: 100%;"$2')
          .replace(/width:\s*([\d\.]+px|auto)(;?)/img, 'width: 100%;$2')
          .replace(/(width|height)="[^"]+"/img, '')
          .replace(/<a[^>]*?>阅读原文<\/\s*a>/img, '')

        html = '<div class="font-size: 80%">' + html + '</div>'
        that.setData({ html: html })
      },
      fail (res) {
        wx.$.hideLoading()
        wx.$.showError('不是微信推送页面')
      }
    })
  },
  loadMarkdown (data) {
    this.setData({ markdownText: data })
    wx.$.util('wemark/wemark').parse(data, this, { name: 'markdown' })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onShareAppMessage () {
    let that = this
    return {
      title: that.data.title,
      path: '/pages/wechatPush/wechatPush?url=' + escape(that.data.url)
    }
  },
  // onImageLongTap () {
  //   wx.showModal({
  //     title: '唔，你长按了',
  //     content: '小程序内不支持长按识别二维码，请截图后在微信扫一扫中打开图片进行识别~'
  //   })
  // },
})
