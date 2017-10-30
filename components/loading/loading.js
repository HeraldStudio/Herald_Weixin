const seunet = wx.$.util('seunet')

exports.bind = function(page) {
  if (!page.data.$loading_title && !page.data.$loading_content) {
    page.setData({
      $loading_title: '正在召唤小猴',
      $loading_content: '稍等一下就好啦'
    })
  }

  seunet.reset()
  seunet.check(result => {
    if (result) {
      page.setData({
        $loading_title: '当前处于校园网',
        $loading_content: result
      })
      setTimeout(page.reloadData, 3000)
    } else {
      setTimeout(() => {
        page.setData({
          $loading_title: '网络状况不太好',
          $loading_content: '请下拉刷新或尝试重启微信'
        })
      }, 5000)
    }
  })
}