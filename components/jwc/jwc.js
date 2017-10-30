exports.bind = function (page) {
  if (!wx.$.util('user').isLogin()) {
    return
  }

  page.setData({ $jwc_showAll: false })

  wx.$.requestApi({
    route: 'api/jwc',
    success: function (res) {
      page.setData({ $jwc: res.data.content['教务信息'].map(k => {
        k.isImportant = /紧急|重要/.test(k.title)
        return k
      }).sort((a, b) => (a.isImportant ? 0 : 1) - (b.isImportant ? 0 : 1)) || [] })
    }
  })

  page.$jwc_toggleShowAll = function () {
    page.setData({ $jwc_showAll: !page.data.$jwc_showAll })
  }
}
