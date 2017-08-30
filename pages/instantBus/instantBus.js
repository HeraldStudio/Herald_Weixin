const busService = require('../../providers/busService.js')

Page({
  data: {
    busData: [],
    stops: [],
    lines: [],
    buses: [],
    points: [],
    timetableJson: {
      "双休节假日": [
        { "time":"8:00-9:30", "bus":"每 30min 一班"},
        { "time":"9:30-11:30", "bus":"每 1h 一班"},
        { "time":"11:30-13:30", "bus":"每 30min 一班"},
        { "time":"13:30-16:30", "bus":"每 1h 一班"},
        { "time":"16:30-19:00", "bus":"每 30min 一班"},
        { "time":"19:00-22:00", "bus":"每 1h 一班"}
      ],
      "工作日": [
        { "time":"7:10-10:00", "bus":"每 10min 一班"},
        { "time":"10:00-11:30", "bus":"每 30min 一班"},
        { "time":"11:30-13:30", "bus":"每 10min 一班"},
        { "time":"14:00-15:00", "bus":"每 1h 一班"},
        { "time":"15:00-16:00", "bus":"每 10min 一班"},
        { "time":"17:00-18:30", "bus":"每 10min 一班"},
        { "time":"18:30-22:00", "bus":"每 30min 一班"}
      ]
    }
  },
  onLoad() {
    let that = this
    wx.$.showLoading('加载中')
    that.updateBus()
    setInterval(that.updateBus, 3000)
  },
  updateBus() {
    let that = this
    busService.get(buses => {
      that.setData({
        busData: buses,
        stops: buses
          .filter(i => i.id % 2 === 0)
          .map(k => k.linePoints)
          .reduce((a, b) => a.concat(b), [])
          .map(k => {

          return {
            latitude: k.station.latitude,
            longitude: k.station.longitude,
            callout: {
              content: k.station.name,
              color: '#333333',
              fontSize: 14,
              borderRadius: 5,
              bgColor: '#ffffff',
              padding: 10
            },
            iconPath: '/images/icon_station.png',
            width: 20,
            height: 20,
            anchor: { x: 0.5, y: 1 }
          }
        }),
        lines: buses
          .filter(i => i.id % 2 === 0)
          .map(i => i.linePoints
            .map(k => k.parentIds.map(i => [i, k.id]))
            .reduce((a, b) => a.concat(b), []).map(k => {

              let fromStop = i.linePoints.filter(i => i.id === k[0])
              if (fromStop.length !== 1) {
                return null
              }
              fromStop = fromStop[0]
              let toStop = i.linePoints.filter(i => i.id === k[1])
              if (toStop.length !== 1) {
                return null
              }
              toStop = toStop[0]
              return {
                points: [fromStop.station, toStop.station],
                color: '#3388ff80',
                dottedLine: true,
                width: 2
              }
            }).filter(k => k !== null)
          ).reduce((a, b) => a.concat(b))
      })
      that.concatPoints()
      wx.$.hideLoading()
    })
  },
  concatPoints() {
    let that = this
    that.setData({ points: that.data.stops.concat(that.data.buses) })
  },
  onShareAppMessage() {
    let that = this
    return {
      title: '实时班车：' + that.data.name,
      path: '/pages/busDetail/busDetail?id=' + that.data.id
    }
  }
})
