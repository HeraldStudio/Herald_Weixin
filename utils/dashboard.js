module.exports = {
    getCard: function(callback) {
        callback && callback({
            id: 'card',
            desc: '一卡通',
            info: '···'
        })
        wx.$.requestApi({
            route: 'api/card',
            data: {
                timedelta: 1
            },
            success: function(res) {
                callback && callback({
                    id: 'card',
                    desc: '一卡通余额',
                    info: res.data.content.cardLeft,
                    intro: '查看消费流水',
                    long: {
                        desc: '一卡通状态',
                        info: res.data.content.state,
                        getter: function(callback2) {
                            var that = this
                            wx.$.requestApi({
                                route: 'api/card',
                                data: {
                                    timedelta: 14
                                },
                                success: function(res) {
                                    if (!Array.isArray(res.data.content.detial)) {
                                        that.data = 'fail'
                                        return
                                    }
                                    that.data = res.data.content.detial.map(k => { return {
                                        topLeft: k.system,
                                        topRight: k.type,
                                        bottomLeft: k.date,
                                        bottomRight: k.price
                                    }})
                                    callback2 && callback2()
                                },
                                fail: function(res) {
                                    that.data = 'fail'
                                }
                            })
                        }
                    }
                })
            }
        })
    },
    getPe: function(callback) {
        callback && callback({
            id: 'pe',
            desc: '跑操',
            info: '···'
        })
        var d = new Date()
        let hm = d.getHours() * 60 + d.getMinutes()
        if (hm > 390 && hm < 440) {
            wx.$.requestApi({
                route: 'api/pc',
                success: function(res) {
                    wx.$.requestApi({
                        route: 'api/pe',
                        success: function(res2) {
                            callback && callback({
                                id: 'pe',
                                desc: '跑操预告',
                                info: res.data.content == 'refreshing' ? '暂无' : res.data.content,
                                intro: '查询打卡记录',
                                long: {
                                    desc: '跑操次数',
                                    info: res2.data.content,
                                    getter: function(callback2) {
                                        var that = this
                                        wx.$.requestApi({
                                            route: 'api/pedetail',
                                            success: function(res) {
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
                                                callback2 && callback2()
                                            },
                                            fail: function(res) {
                                                that.data = 'fail'
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            })
        } else {
            wx.$.requestApi({
                route: 'api/pe',
                success: function(res) {
                    callback && callback({
                        id: 'pe',
                        desc: '跑操次数',
                        info: res.data.content,
                        intro: '查询打卡记录',
                        long: {
                            desc: '击败人数',
                            info: res.data.rank + '%',
                            getter: function(callback2) {
                                var that = this
                                wx.$.requestApi({
                                    route: 'api/pedetail',
                                    success: function(res) {
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
                                        callback2 && callback2()
                                    },
                                    fail: function(res) {
                                        that.data = 'fail'
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    },
    getLecture: function(callback) {
        callback && callback({
            id: 'lecture',
            desc: '人文讲座',
            info: '···'
        })
        wx.$.requestApi({
            route: 'api/lecture',
            success: function(res) {
                callback && callback({
                    id: 'lecture',
                    desc: '讲座打卡次数',
                    info: res.data.content.count,
                    intro: '查看详情',
                    long: {
                        data: res.data.content.detial.map((k, i) => {
                            return {
                                topLeft: k.date,
                                topRight: k.place,
                                bottomLeft: '第' + (i + 1) + '次打卡'
                            }
                        })
                    }
                })
            }
        })
    },
}