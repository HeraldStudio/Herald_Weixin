module.exports = {
    getCard: function(callback) {
        callback && callback({
            id: 'card',
            blocks: [{ desc: '一卡通', info: '···' }]
        })
        wx.$.requestApi({
            route: 'api/card',
            data: {
                timedelta: 1
            },
            complete: function(res) {
                callback && callback({
                    id: 'card',
                    blocks: [
                        {
                            desc: '一卡通余额',
                            info: res.data.content.cardLeft
                        },
                        {
                            desc: '一卡通状态',
                            info: res.data.content.state,
                        },
                        {
                          desc: '在线充值',
                          page: 'cardCharge',
                        }
                    ],
                    long: {
                        data: res.data.content.detial.map(k => { return {
                            topLeft: k.system,
                            topRight: k.type,
                            bottomLeft: k.date,
                            bottomRight: k.price
                        }}),
                        getter: function(callback2) {
                            var that = this
                            wx.$.requestApi({
                                route: 'api/card',
                                data: {
                                    timedelta: 14
                                },
                                complete: function(res) {
                                    if (!Array.isArray(res.data.content.detial)) {
                                        that.data = 'fail'
                                        return
                                    }
                                    that.data = that.data.concat(res.data.content.detial.map(k => { return {
                                        topLeft: k.system,
                                        topRight: k.type,
                                        bottomLeft: k.date,
                                        bottomRight: k.price
                                    }}))
                                    callback2 && callback2(that.data)
                                }
                            })
                        },
                        hint: 'i. 数据来自一卡通中心官方，由于服务器缓存、一卡通中心系统延迟等原因，显示的余额与实际余额之间可能有出入，请自行鉴别；\n\n' + 
                              'ii. 若您进行了线上充值，请在食堂或校之友超市刷卡到账；线上充值平台与小猴偷米无关，若钱款不能到账，请与校一卡通中心联系。'
                    }
                })
            }
        })
    },
    getPe: function(callback) {
        callback && callback({
            id: 'pe',
            blocks: [{ desc: '跑操', info: '···' }]
        })
        var d = new Date()
        let hm = d.getHours() * 60 + d.getMinutes()
        if (hm > 390 && hm < 440) {
            wx.$.requestApi({
                route: 'api/pc',
                complete: function(res) {
                    wx.$.requestApi({
                        route: 'api/pe',
                        complete: function(res2) {
                            callback && callback({
                                id: 'pe',
                                blocks: [
                                    {
                                        desc: '跑操预告',
                                        info: res.data.content == 'refreshing' ? '暂无' : res.data.content.replace('今天', '')
                                    },
                                    {
                                        desc: '已跑操次数',
                                        info: res2.data.content
                                    },
                                    {
                                        desc: '剩余次数',
                                        info: Math.max(0, 45 - parseInt(res2.data.content))
                                    },
                                    {
                                        desc: '预计剩余天数',
                                        info: res2.data.remain
                                    }
                                ],
                                long: {
                                    getter: function(callback2) {
                                        var that = this
                                        wx.$.requestApi({
                                            route: 'api/pedetail',
                                            complete: function(res) {
                                                if (!Array.isArray(res.data.content)) {
                                                    that.data = 'fail'
                                                    return
                                                }
                                                that.data = res.data.content.map((k, index) => { 
                                                    let comps = k.sign_time.split('.')
                                                    return {
                                                        topLeft: k.sign_date,
                                                        topRight: comps[0] + ':' + (comps[1].length == 1 ? comps[1] + '0' : comps[1]),
                                                        bottomLeft: '第' + (index + 1) + '次跑操'
                                                    }
                                                })
                                                callback2 && callback2(that.data)
                                            }
                                        })
                                    },
                                    hint: 'i. 数据来自体育系官方，由于服务器缓存、活动加跑操等原因，显示的跑操次数与跑操记录条数之间可能有出入，请自行鉴别；\n\n' + 
                                          'ii. 剩余天数由星期推算，请综合考虑天气、节假日等因素合理安排时间；\n\n' + 
                                          'iii. 跑操打卡及录入与小猴偷米无关，若打卡未到账，请与校体育系联系；\n\n' + 
                                          'iv. 跑操预告由体育系官方提供，小猴偷米不保证其正确性和及时性。'
                                }
                            })
                        }
                    })
                }
            })
        } else {
            wx.$.requestApi({
                route: 'api/pe',
                complete: function(res) {
                    callback && callback({
                        id: 'pe',
                        blocks: [
                            {
                                desc: '已跑操次数',
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
                                desc: '预计剩余天数',
                                info: res.data.remain
                            }
                        ],
                        long: {
                            getter: function(callback2) {
                                var that = this
                                wx.$.requestApi({
                                    route: 'api/pedetail',
                                    complete: function(res) {
                                        if (!Array.isArray(res.data.content)) {
                                            that.data = 'fail'
                                            return
                                        }
                                        that.data = res.data.content.map((k, index) => { 
                                            let comps = k.sign_time.split('.')
                                            return {
                                                topLeft: k.sign_date + ' ' + comps[0] + ':' + (comps[1].length == 1 ? comps[1] + '0' : comps[1]),
                                                topRight: '第' + (index + 1) + '次打卡'
                                            }
                                        })
                                        callback2 && callback2(that.data)
                                    }
                                })
                            },
                            hint: 'i. 数据来自体育系官方，由于服务器缓存、活动加跑操等原因，显示的跑操次数与跑操记录条数之间可能有出入，请自行鉴别；\n\n' + 
                                  'ii. 剩余天数由星期推算，请综合考虑天气、节假日等因素合理安排时间；\n\n' + 
                                  'iii. 跑操打卡及录入与小猴偷米无关，若打卡未到账，请与校体育系联系；\n\n' + 
                                  'iv. 跑操预告由体育系官方提供，小猴偷米不保证其正确性和及时性。'
                        }
                    })
                }
            })
        }
    },
    getLecture: function(callback) {
        callback && callback({
            id: 'lecture',
            blocks: [{ desc: '人文讲座', info: '···' }]
        })
        wx.$.requestApi({
            route: 'api/lecture',
            complete: function(res) {
                callback && callback({
                    id: 'lecture',
                    blocks: [
                        {
                            desc: '讲座打卡数',
                            info: res.data.content.count,
                        }
                    ],
                    long: {
                        data: res.data.content.detial.map((k, i) => {
                            return {
                                topLeft: k.date,
                                topRight: k.place
                            }
                        }),
                        hint: '数据来自学校官方，可能包含除人文讲座打卡之外的冗余数据，请自行鉴别。'
                    }
                })
            }
        })
    },
    getSrtp: function(callback) {
        callback && callback({
            id: 'srtp',
            blocks: [{ desc: 'SRTP', info: '···' }]
        })
        wx.$.requestApi({
            route: 'api/srtp',
            complete: function(res) {
                callback && callback({
                    id: 'srtp',
                    blocks: [
                        {
                            desc: 'SRTP学分数',
                            info: res.data.content[0].total
                        },
                        {
                            desc: 'SRTP状态',
                            info: res.data.content[0].score
                        },
                    ],
                    long: {
                        data: res.data.content.slice(1).map((k, i) => {
                            return {
                                topLeft: k.project,
                                bottomLeft: k.credit + (k.proportion ? ' (' + k.proportion + ')' : ''),
                                bottomRight: k.date + ' · ' + k.type
                            }
                        })
                    }
                })
            }
        })
    },
}