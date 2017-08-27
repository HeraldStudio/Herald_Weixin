Page({
  data: {

  },
  onLoad () {
    wx.$.util('user').requireLogin(this)

    let that = this
    this.loadMap()
    wx.$.requestApi({
      route: 'api/schoolbus',
      success (res) {
        let day = '周' + ['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]
        that.setData({
          schoolbus: res.data.content,
          day: day,
          dayType: day >= 1 && day <= 5 ? 'weekday' : 'weekend'
        })
      }
    })
  },
  onShareAppMessage () {
    return {
      title: '校车',
      path: '/pages/oldBus/oldBus'
    }
  },
  loadMap () {
    let that = this
    wx.$.requestApi({
      route: 'api/newbus',
      success (res) {
        let theBuses = res.data.content.filter(k => k.id === 1)
        if (theBuses.length !== 1) {
          return
        }
        let bus = theBuses[0]
        that.setData({
          points: bus.stops.map(k => {
            return {
              latitude: k.latitude,
              longitude: k.longitude,
              callout: {
                content: k.name,
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
            let fromStop = bus.stops.filter(i => i.id === k[0])
            if (fromStop.length !== 1) {
              return null
            }
            fromStop = fromStop[0]
            let toStop = bus.stops.filter(i => i.id === k[1])
            if (toStop.length !== 1) {
              return null
            }
            toStop = toStop[0]
            return {
              points: [fromStop, toStop],
              color: '#1296db80',
              dottedLine: true,
              width: 3
            }
          }).filter(k => k !== null)
        })
      }
    })
  }
})