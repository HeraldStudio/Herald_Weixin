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
          // 以下标记用加号转换成整数型，方便后续位运算
          k.isImportant = +/重要/.test(k.title)
          k.isUrgent = +/急/.test(k.title)
          k.isLecture = +/课外研学讲座/.test(k.title)
          k.isCompetition = +/赛/.test(k.title)

          // 重要性量度，用位运算进行
          k.flag = (k.isUrgent << 1) + k.isImportant << 1

          let [y, m, d] = k.date.split('-').map(s => parseInt(s))
          let date = new Date(y, m - 1, d);
          k.displayDate = wx.$.util('format').formatDateNatural(date.getTime())
          return k
        }).sort((a, b) => (b.flag - a.flag) || (a.date > b.date ? -1 : 1)) || [] 
      })
    }
  })

  page.$jwc_toggleShowAll = function () {
    page.setData({ $jwc_showAll: !page.data.$jwc_showAll })
  }
}
