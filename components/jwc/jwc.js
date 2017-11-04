exports.bind = function (page) {
  page.setData({ $jwc_showAll: false })

  wx.$.requestApi({
    route: 'api/jwc',
    success: function (res) {
      let dict = res.data.content
      page.setData({
        $jwc: Object.keys(dict).map(k => {
          return k == '最新动态' ? [] : dict[k].map(item => {
            item.category = k
            return item
          })
        }).reduce((a, b) => {
          return a.concat(b)
        }, []).map(k => {
          k.isImportant = /重要/.test(k.title)
          k.isUrgent = /急/.test(k.title)
          k.isAnnouncement = /公示/.test(k.title)
          k.isLecture = /课外研学讲座/.test(k.title)
          k.isCompetition = /赛/.test(k.title)
          let [y, m, d] = k.date.split('-').map(s => parseInt(s))
          let date = new Date(y, m - 1, d);
          k.displayDate = wx.$.util('format').formatDateNatural(date.getTime())
          return k
        }).sort((a, b) => a.date > b.date ? -1 : 1) || [] 
      })
    }
  })

  page.$jwc_toggleShowAll = function () {
    page.setData({ $jwc_showAll: !page.data.$jwc_showAll })
  }
}
