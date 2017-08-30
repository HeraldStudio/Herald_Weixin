const busService = require('../../providers/busService.js')
const polylineData = [
  [
    "118.82113|31.89210",
    "118.82113|31.89111",
    "118.81727|31.89092",
    "118.81448|31.89073",
    "118.81423|31.89069",
    "118.81408|31.89063",
    "118.81398|31.89050",
    "118.81390|31.89032",
    "118.81379|31.88882",
    "118.81379|31.88857",
    "118.81404|31.88511",
    "118.81410|31.88388",
    "118.81412|31.88364",
    "118.81455|31.88245",
    "118.81473|31.88230",
    "118.81505|31.88215",
    "118.81537|31.88212",
    "118.82206|31.88250",
    "118.82437|31.88279",
    "118.82455|31.88286",
    "118.82501|31.88575",
    "118.82501|31.88593",
    "118.82483|31.88792",
    "118.82321|31.89359",
    "118.82321|31.89374",
    "118.82331|31.89387",
    "118.83006|31.89437",
    "118.83006|31.89485"
  ],
  [
    "118.81378|31.88362",
    "118.81405|31.88368",
    "118.81390|31.88629",
    "118.81117|31.88624",
    "118.81163|31.88346",
    "118.81284|31.87973",
    "118.81426|31.87574",
    "118.81516|31.87412",
    "118.81847|31.86901",
    "118.81864|31.86895",
    "118.81878|31.86892",
    "118.81925|31.86896",
    "118.81954|31.86903",
    "118.82308|31.86921",
    "118.82306|31.86971"
  ]
]

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
    setInterval(that.updateBus, 5000)
  },
  updateBus() {
    let that = this
    busService.get(buses => {
      that.setData({
        busData: buses.map(k => {
          k.name = k.name.replace(/(.*)方向/g, '往$1')
          return k
        }),
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
              color: '#ffffff',
              fontSize: 14,
              borderRadius: 5,
              bgColor: '#3388ff',
              padding: 10
            },
            iconPath: '/images/icon_station.png',
            width: 20,
            height: 20,
            anchor: { x: 0.5, y: 1 }
          }
        }),
        lines: polylineData.map(i => i.map((k, index) => index && {
          points: [ {
            longitude: parseFloat(i[index - 1].split('|')[0]),
            latitude: parseFloat(i[index - 1].split('|')[1])
          }, {
            longitude: parseFloat(k.split('|')[0]),
            latitude: parseFloat(k.split('|')[1])
          } ],
          color: '#3388ff40',
          width: 2
        }).slice(1)).reduce((a, b) => a.concat(b), []),
        buses: buses
          .map(i => i.buses
            .map(k => {
              return {
                latitude: k.location.latitude,
                longitude: k.location.longitude,
                callout: {
                  content: k.bus.busNO + ' ' + i.name,
                  color: '#ffffff',
                  fontSize: 14,
                  borderRadius: 5,
                  bgColor: '#ffa254',
                  padding: 10,
                  display: 'ALWAYS'
                },
                iconPath: '/images/bus.png',
                width: 20,
                height: 20,
                anchor: { x: 0.5, y: 0.75 }
              }
            })
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
    return {
      title: '实时班车',
      path: '/pages/instantBus/instantBus'
    }
  }
})
