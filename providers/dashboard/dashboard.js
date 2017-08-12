module.exports = {
  getCard (callback) {
    callback && callback({
      id: 'card',
      blocks: [{ desc: '一卡通', info: '···' }]
    })
    wx.$.requestApi({
      route: 'api/card',
      data: {
        timedelta: 1
      },
      complete: function (res) {
        callback && callback({
          id: 'card',
          blocks: [
            {
              desc: '卡余额',
              info: res.data.content.cardLeft
            },
            {
              desc: '一卡通状态',
              info: res.data.content.state,
            }
          ],
          long: {
            data: res.data.content.detial.map(k => {
              return {
                topLeft: k.system,
                topRight: k.type,
                bottomLeft: k.date,
                bottomRight: k.price
              }
            }),
            getter: function (callback2) {
              let that = this
              wx.$.requestApi({
                route: 'api/card',
                data: {
                  timedelta: 14
                },
                complete: function (res) {
                  if (!Array.isArray(res.data.content.detial)) {
                    that.data = 'fail'
                    callback2 && callback2(that.data)
                    return
                  }
                  that.data = that.data.concat(res.data.content.detial.map(k => {
                    return {
                      topLeft: k.system,
                      topRight: k.type,
                      bottomLeft: k.date,
                      bottomRight: k.price
                    }
                  }))
                  callback2 && callback2(that.data)
                }
              })
            },
            hint: 'i. 数据来自一卡通中心官方，由于服务器缓存、一卡通中心系统延迟等原因，显示的余额与实际余额之间可能有出入，请自行鉴别；\n\n' +
            'ii. 若您在小猴进行了线上充值，请在食堂或校之友超市刷卡到账；线上充值平台与小猴偷米无关，若钱款不能到账，请与校一卡通中心联系。'
          }
        })
      }
    })
  },
  getPe (callback) {
    callback && callback({
      id: 'pe',
      blocks: [{ desc: '跑操', info: '···' }]
    })
    let d = new Date()
    let hm = d.getHours() * 60 + d.getMinutes()
    if (hm > 390 && hm < 440) { // 跑操期间的情况
      wx.$.requestApi({
        route: 'api/pc',
        complete: function (res) {
          wx.$.requestApi({
            route: 'api/pe',
            complete: function (res2) {
              callback && callback({
                id: 'pe',
                blocks: [
                  {
                    desc: '跑操预告',
                    info: res.data.content === 'refreshing' ? '暂无' : res.data.content.replace('今天', '')
                  },
                  {
                    desc: '跑操次数',
                    info: res2.data.content
                  },
                  {
                    desc: '剩余次数',
                    info: Math.max(0, 45 - parseInt(res2.data.content))
                  },
                  {
                    desc: '剩余天数',
                    info: res2.data.remain
                  }
                ],
                long: {
                  getter: function (callback2) {
                    let that = this
                    wx.$.requestApi({
                      route: 'api/pedetail',
                      complete: function (res) {
                        if (!Array.isArray(res.data.content) || res.data.code >= 400) {
                          that.data = 'fail'
                          callback2 && callback2(that.data)
                          return
                        }
                        that.data = res.data.content.map((k, index) => {
                          let comps = k.sign_time.split('.')
                          return {
                            topLeft: k.sign_date + ' ' + comps[0] + ':' + (comps[1].length === 1 ? comps[1] + '0' : comps[1]),
                            topRight: '第' + (index + 1) + '次跑操'
                          }
                        })
                        callback2 && callback2(that.data)
                      }
                    })
                  },
                  hint: 
                  '跑操是大一大二必修的早锻炼项目，需要在无雨的工作日 6:40 ~ 7:20 期间到指定位置打卡，每学期跑满45次，体育才准予及格。\n\n声明：\n' +
                  'i. 数据来自体育系官方，由于服务器缓存、活动加跑操等原因，显示的跑操次数与跑操记录条数之间可能有出入，请自行鉴别；\n\n' +
                  'ii. 剩余天数由星期推算，请综合考虑天气、节假日等因素合理安排时间；\n\n' +
                  'iii. 跑操打卡及录入与小猴偷米无关，若打卡未到账，请与校体育系联系；\n\n' +
                  'iv. 跑操预告由体育系官方提供，小猴偷米不保证其正确性和及时性。'
                }
              })
            }
          })
        }
      })
    } else { // 非跑操期间的情况
      wx.$.requestApi({
        route: 'api/pe',
        complete: function (res) {
          callback && callback({
            id: 'pe',
            blocks: [
              {
                desc: '跑操次数',
                info: res.data.content
              },
              {
                desc: '击败人数',
                info: res.data.rank + '%'
              },
              {
                desc: '剩余次数',
                info: Math.max(0, 45 - parseInt(res.data.content))
              },
              {
                desc: '剩余天数',
                info: res.data.remain
              }
            ],
            long: {
              getter: function (callback2) {
                let that = this
                wx.$.requestApi({
                  route: 'api/pedetail',
                  complete: function (res) {
                    if (!Array.isArray(res.data.content)) {
                      that.data = 'fail'
                      callback2 && callback2(that.data)
                      return
                    }
                    that.data = res.data.content.map((k, index) => {
                      let comps = k.sign_time.split('.')
                      return {
                        topLeft: k.sign_date + ' ' + comps[0] + ':' + (comps[1].length === 1 ? comps[1] + '0' : comps[1]),
                        topRight: '第' + (index + 1) + '次跑操'
                      }
                    })
                    callback2 && callback2(that.data)
                  }
                })
              },
              hint: 
                '跑操是大一大二必修的早锻炼项目，需要在无雨的工作日 6:40 ~ 7:20 期间到指定位置打卡，每学期跑满45次，体育才准予及格。\n\n声明：\n' +
                'i. 数据来自体育系官方，由于服务器缓存、活动加跑操等原因，显示的跑操次数与跑操记录条数之间可能有出入，请自行鉴别；\n\n' +
                'ii. 剩余天数由星期推算，请综合考虑天气、节假日等因素合理安排时间；\n\n' +
                'iii. 跑操打卡及录入与小猴偷米无关，若打卡未到账，请与校体育系联系；\n\n' +
                'iv. 跑操预告由体育系官方提供，小猴偷米不保证其正确性和及时性。'
            }
          })
        }
      })
    }
  },
  getLecture (callback) {
    callback && callback({
      id: 'lecture',
      blocks: [{ desc: '人文讲座', info: '···' }]
    })
    wx.$.requestApi({
      route: 'api/lecture',
      complete: function (res) {
        callback && callback({
          id: 'lecture',
          blocks: [
            {
              desc: '讲座次数',
              info: res.data.content.count,
            }
          ],
          long: {
            data: res.data.content.detial.map((k) => {
              return {
                topLeft: k.date,
                topRight: k.place
              }
            }),
            hint: '人文讲座是学校规定的课外活动，本科期间需要听够8次人文讲座，并在毕业前完成一份讲座报告，即可准予毕业。\n\n声明：以上数据来自一卡通通用考勤记录，可能不全是讲座打卡，请自行鉴别。'
          }
        })
      }
    })
  },
  getSrtp (callback) {
    callback && callback({
      id: 'srtp',
      blocks: [{ desc: 'SRTP', info: '···' }]
    })
    wx.$.requestApi({
      route: 'api/srtp',
      complete: function (res) {
        callback && callback({
          id: 'srtp',
          blocks: [
            {
              desc: 'SRTP学分',
              info: res.data.content[0].total
            },
            {
              desc: 'SRTP状态',
              info: res.data.content[0].score
            },
          ],
          long: {
            data: res.data.content.slice(1).map((k) => {
              return {
                topLeft: k.project,
                bottomLeft: k.credit + (k.proportion ? ' (' + k.proportion + ')' : ''),
                bottomRight: k.date + ' · ' + k.type
              }
            }),
            hint: 'SRTP是学校规定的课外研学活动，本科期间申请并完成各类SRTP竞赛或项目即可得分，毕业要求SRTP达到及格分2.0分，但很多大三大四的大神已经拿到十多分啦，赶快加油吧~'
          }
        })
      }
    })
  }
  // getLibrary(callback) {
  //     callback && callback({
  //         id: 'library',
  //         blocks: [{ desc: '图书馆', info: '···' }]
  //     })
  //     wx.$.requestApi({
  //         route: 'api/library',
  //         complete: function(res) {
  //             callback && callback({
  //                 id: 'library',
  //                 blocks: [
  //                     {
  //                         desc: '已借图书',
  //                         info: res.data.code == 401 ? '0' : res.data.content.length
  //                     }
  //                 ],
  //                 long: {
  //                     hint: res.data.code == 401 ? '图书馆认证失败，需要您登录图书馆账号。' : ''
  //                     // data: res.data.content.map((k, i) => {
  //                     //     return {
  //                     //         topLeft: k.title,
  //                     //         topRight: k.author,
  //                     //         bottomLeft: '借于' + k.render_date + ' / ' + k.due_date + '到期'
  //                     //     }
  //                     // })
  //                 }
  //             })
  //         }
  //     })
  // },
}