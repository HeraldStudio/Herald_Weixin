exports.bind = function (page) {
  if (!wx.$.util('user').isLogin()) {
    return
  }

  page.setData({
    $dashboard: [],
    $dashboard_expandedIndex: -1,
    $dashboard_expanded: null
  })

  function resolveData (data) {
    if (page.data.$dashboard_expanded
      && page.data.$dashboard_expanded.id === data.id) {
      page.setData({
        $dashboard_expanded: data
      })
    }
    for (let i in page.data.$dashboard) {
      if (page.data.$dashboard[i].id === data.id) {
        data.isLong = page.data.$dashboard[i].isLong
        page.data.$dashboard[i] = data
        page.setData({
          $dashboard: page.data.$dashboard
        })
        return
      }
    }
    page.setData({
      $dashboard: page.data.$dashboard.concat([data])
    })
  }

  let providers = require('../../providers/dashboard/dashboard.js')
  providers.getCard(resolveData)
  providers.getPe(resolveData)
  providers.getLecture(resolveData)
  providers.getSrtp(resolveData)

  page.$dashboard_toggleExpand = function (event) {
    let index = event.currentTarget.dataset.index
    let isExpanded = !page.data.$dashboard[index].isLong
    if (typeof page.data.$dashboard_expandedIndex === 'number' && page.data.$dashboard_expandedIndex !== -1) {
      page.data.$dashboard[page.data.$dashboard_expandedIndex].isLong = false
    }
    page.data.$dashboard[index].isLong = isExpanded
    page.setData({
      $dashboard: page.data.$dashboard,
      $dashboard_expandedIndex: index,
      $dashboard_expanded: isExpanded ? page.data.$dashboard[index] : null
    })
    if (isExpanded
      && page.data.$dashboard_expanded
      && page.data.$dashboard_expanded.long
      && !page.data.$dashboard[index].long.data
      && page.data.$dashboard[index].long.getter
      && !page.data.$dashboard_expanded.long.getting) {

      page.data.$dashboard_expanded.long.getting = true
      page.data.$dashboard_expanded.long.getter(function (data) {
        if (page.data.$dashboard_expandedIndex === index) {
          page.data.$dashboard[index].long.data = data
          page.setData({
            $dashboard: page.data.$dashboard,
            $dashboard_expanded: page.data.$dashboard_expanded
          })
        }
      })
    }
  }
}