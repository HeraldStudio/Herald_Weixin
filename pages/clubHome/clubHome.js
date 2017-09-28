Page({
  data: {
    club: {
      name: '小猴偷米工作室',
      type: '学生组织',
      shortType: '组织',
      headPhoto: 'http://static.myseu.cn/2017-09-08-2017-zhaoxin.png',
      avatar: 'http://static.myseu.cn/2017-09-08-60%403x.png',
      pictures: [
        'https://wallpapers.wallhaven.cc/wallpapers/thumb/small/th-12845.jpg',
        'https://wallpapers.wallhaven.cc/wallpapers/thumb/small/th-60425.jpg',
        'https://wallpapers.wallhaven.cc/wallpapers/thumb/small/th-545183.jpg',
        'https://wallpapers.wallhaven.cc/wallpapers/thumb/small/th-517055.jpg',
        'https://wallpapers.wallhaven.cc/wallpapers/thumb/small/th-493057.jpg',
        'https://wallpapers.wallhaven.cc/wallpapers/thumb/small/th-552048.jpg'
      ],
      description: '连通热爱，连接彼此',
      intro: 'https://mp.weixin.qq.com/s?__biz=MjM5NDI3NDc2MQ==&tempkey=OTIxX3ZFK3ZnSCtvcms5WCtHSHluR3ZrSGxTVzBITjBWeVBNZFg2WFNSdjBEU3diazJ6TG1Nb3pqeWhZSDgtTW5WNERJbmxzN05FeExKUlhKOU1OSTlLRC0weWVHb0xVUXRjckJVZm9XcnZ4QmpzblFRSjlqa2VraU9PbVgxb2cyR3ZOVVk3ak5TdUtET0VzeTdvVExCWmNmTlVKeUZmZWM0a21SbDNIdGd%2Bfg%3D%3D&chksm=3d789a9b0a0f138d0223a4d14b8fcba38aeffde8f747cdcfa80db0e823ea416dc3266c56915b#rd'
    }
  },
  onLoad (options) {
      let that = this
    wx.setNavigationBarTitle({ title: that.data.club.name })

    wx.$.showLoading('加载中')
    wx.$.requestSimple({
      url: that.data.club.intro.replace(/^http:/, 'https:'),
      method: 'GET',
      success (res) {
        wx.$.hideLoading()
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
        that.loadMarkdown('# 访问页面失败\n\n错误信息：' + res.errMsg)
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

  },
  onImageLongTap () {
    wx.showModal({
      title: '唔，你长按了',
      content: '小程序内不支持长按识别二维码，请截图后在微信扫一扫中打开图片进行识别~'
    })
  },
})
