Page({
  onLoad (options) {
    let href = decodeURIComponent(options.href)
    
    if (/^(https?:\/*)?mp\.weixin\.qq\.com/.test(href)) {
      wx.redirectTo({
        url: '/pages/wechatPush/wechatPush?url=' + options.href
      })
    } else {
      wx.setClipboardData({
        data: href
      })
      wx.navigateBack()
    }
  }
})