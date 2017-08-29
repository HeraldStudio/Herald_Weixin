const busService = require('../../providers/busService.js')

Page({
  data: {
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
  onLoad(options) {
    let that = this
    this.setData({ id: options.id })
    wx.$.showLoading('加载中')

    busService.getAll(lines => {
      let theBuses = lines.filter(k => parseInt(k.id) === parseInt(that.data.id))
      if (theBuses.length !== 1) {
        wx.$.showError('线路不存在')
        return
      }
      let bus = theBuses[0]
      that.setData({
        name: bus.name,
        stops: bus.linePoints.map(k => {
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
        lines: bus.linePoints.map(k => k.parentIds.map(i => [i, k.id])).reduce((a, b) => a.concat(b), []).map(k => {
          let fromStop = bus.linePoints.filter(i => i.id === k[0])
          if (fromStop.length !== 1) {
            return null
          }
          fromStop = fromStop[0]
          let toStop = bus.linePoints.filter(i => i.id === k[1])
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
      })
      that.concatPoints()
      wx.$.hideLoading()
      that.updateBus()
      setInterval(that.updateBus, 5000)
    })
  },
  updateBus() {
    let that = this
    busService.getBus(this.data.id, buses => {
      that.setData({
        buses: buses.map(k => {
          return {
            latitude: k.location.latitude,
            longitude: k.location.longitude,
            callout: {
              content: k.bus.busNO,
              color: '#ffffff',
              fontSize: 14,
              borderRadius: 5,
              bgColor: '#3388ff',
              padding: 10,
              display: 'ALWAYS'
            },
            iconPath: '/images/bus.png',
            width: 20,
            height: 20,
            anchor: { x: 0.5, y: 0.5 }
          }
        })
      })
      that.concatPoints()
    })
  },
  concatPoints() {
    let that = this
    that.setData({ points: that.data.stops.concat(that.data.buses) })
  },
  onShareAppMessage() {
    let that = this
    return {
      title: '校车',
      path: '/pages/busDetail/busDetail?id=' + that.data.id
    }
  }
})
