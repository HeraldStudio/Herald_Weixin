Page({
  data: {
    swiper: [],
    activity: [],
    curIndex: 0,
    curPage: 0,
    loading: false,
    ended: false,
    timestamp: new Date().getTime()
  },
  onLoad (options) {
    this.reload()
  },
  reload() {
    this.setData({
      activity: [],
      curIndex: 0,
      curPage: 0,
      loading: false,
      ended: false
    })
    wx.$.comp('service').bind(this)
    this.loadNextPage()
  },
  loadNextPage() {
    let that = this
    if (that.data.loading || that.data.ended) {
      return
    }
    let newPage = that.data.curPage + 1
    that.data.loading = true // 这里与界面无关，用不着setData
    wx.$.requestSimple({
      url: 'https://www.heraldstudio.com/herald/api/v1/huodong/get?page=' + newPage,
      success(res) {
        that.setData({
          loading: false,
          activity: that.data.activity.concat(res.data.content.map(a => {
            let [y, m, d] = a.start_time.split('-').map(k => parseInt(k))
            let startDate = new Date(y, m - 1, d);
            [y, m, d] = a.end_time.split('-').map(k => parseInt(k))
            let endDate = new Date(y, m - 1, d);
            let today = new Date();
            a.status = today >= startDate ? today >= endDate ? 'ended' : 'ongoing' : 'upcoming'
            a.displayStatus = today >= startDate ? today >= endDate ? '已结束' : '进行中' : '未开始'
            return a
          })),
          curPage: newPage,
          ended: !res.data.content.length
        })
      }
    })
  },
  onSwiperChange (event) {
    this.setData({ curIndex: event.detail.current })
  },
  onPullDownRefresh() {
    this.reload()
    wx.stopPullDownRefresh()
  },
  onReachBottom() {
    this.loadNextPage()
  }
})