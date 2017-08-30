function transformPosition (positionObj) {
  positionObj.longitude += 0.0051
  positionObj.latitude -= 0.00205
  return positionObj
}

let lines = []

exports.get = (callback) => {
  if (lines.length === 0) {
    wx.$.requestSimple({
      route: 'busservice/lines',
      complete (res) {
        if (!Array.isArray(res.data.data.lines)) {
          callback([])
        }
        lines = res.data.data.lines
        let threads = 0
        for (let line of lines) {
          threads++
          wx.$.requestSimple({
            route: 'busservice/lineDetail?lineId=' + line.id,
            complete (res) {
              line.linePoints = res.data.data.line.linePoints.map(k => {
                k.station = transformPosition(k.station)
                return k
              })
              exports.getBus(line.id, buses => {
                line.buses = buses
                threads--
                if (threads === 0) {
                  callback(lines)
                }
              })
            }
          })
        }
      }
    })
  } else {
    let threads = 0
    for (let line of lines) {
      threads++
      exports.getBus(line.id, buses => {
        line.buses = buses
        threads--
        if (threads === 0) {
          callback(lines)
        }
      })
    }
  }
}

exports.getBus = (id, callback) => {
  wx.$.requestSimple({
    route: 'busservice/queryBus?lineId=' + id,
    complete (res) {
      let buses = res.data.data.buses
      buses.forEach(k => k.location = transformPosition(k.location))
      callback(buses)
    }
  })
}
