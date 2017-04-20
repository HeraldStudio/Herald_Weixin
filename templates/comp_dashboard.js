exports.bind = function(page) {
    if (!wx.$.util('user').isLogin()) {
        return
    }

    page.setData({
        $dashboard: [],
        $dashboard_expandedIndex: -1,
        $dashboard_expanded: null
    })

    function resolveData(data) {
        for (let i in page.data.$dashboard) {
            if (page.data.$dashboard[i].id == data.id) {
                page.data.$dashboard[i] = data
                page.setData({
                    $dashboard: page.data.$dashboard,
                    $dashboard_expandedIndex: -1,
                    $dashboard_expanded: null
                })
                return
            }
        }
        page.setData({
            $dashboard: page.data.$dashboard.concat([data]),
            $dashboard_expandedIndex: -1,
            $dashboard_expanded: null
        })
    }

    wx.$.util('dashboard').getCard(resolveData)
    wx.$.util('dashboard').getPe(resolveData)
    wx.$.util('dashboard').getLecture(resolveData)
    wx.$.util('dashboard').getSrtp(resolveData)

    page.$dashboard_toggleExpand = function(event) {
        let index = event.currentTarget.dataset.index
        let isExpanded = !page.data.$dashboard[index].isLong
        if (typeof page.data.$dashboard_expandedIndex === 'number' && page.data.$dashboard_expandedIndex != -1) {
            page.data.$dashboard[page.data.$dashboard_expandedIndex].isLong = false
        }
        page.data.$dashboard[index].isLong = isExpanded
        page.setData({
            $dashboard: page.data.$dashboard,
            $dashboard_expandedIndex: index,
            $dashboard_expanded: isExpanded ? page.data.$dashboard[index] : null
        })
        isExpanded && page.data.$dashboard[index].long.getter &&
        page.data.$dashboard_expanded.long.getter(function() {
            page.setData({
                $dashboard: page.data.$dashboard,
                $dashboard_expanded: page.data.$dashboard_expanded
            })
        })
    }
}