Page({
  data: {
    bus: {}
  },
  onLoad (options) {
    let id = options.id
    let that = this
    wx.$.requestApi({
      route: 'api/newbus',
      success (res) {
        let theBuses = res.data.content.filter(k => k.id == id)
        if (theBuses.length != 1) {
          wx.$.showError('班车不存在')
          return
        }
        let bus = theBuses[0]
        wx.setNavigationBarTitle({ title: bus.name })
        that.setData({
          bus,
          points: bus.stops.map(k => {
            return {
              latitude: k.latitude,
              longitude: k.longitude,
              callout: {
                content: k.name + '站',
                color: '#333333',
                fontSize: 14,
                borderRadius: 5,
                bgColor: '#ffffff',
                padding: 10
              },
              iconPath: '/images/location_point.png',
              width: 20,
              height: 20,
              anchor: { x: 0.5, y: 0.5 }
            }
          }),
          lines: bus.stops.map(k => k.parentIds.map(i => [i, k.id])).reduce((a, b) => a.concat(b), []).map(k => {
            let fromStop = bus.stops.filter(i => i.id == k[0])
            if (fromStop.length != 1) {
              return null
            }
            fromStop = fromStop[0]
            let toStop = bus.stops.filter(i => i.id == k[1])
            if (toStop.length != 1) {
              return null
            }
            toStop = toStop[0]
            return {
              points: [fromStop, toStop],
              color: '#1296db80',
              dottedLine: true,
              width: 3
            }
          }).filter(k => k != null)
        })
      },
      fail (res) {
        wx.$.showError('暂时无法获取班车信息，请重试')
      }
    })
  },
  onShareAppMessage () {
  
  }
})