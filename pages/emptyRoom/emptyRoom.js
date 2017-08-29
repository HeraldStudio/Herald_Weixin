const format = wx.$.util('format')

Page({
  data: {
    fields: [
      {
        key: 'date',
        options: 'date',
        select: format.formatTime(new Date().getTime(), 'yyyy-MM-dd')
      },
      {
        key: 'buildingId',
        options: [
          { name: '教一 ~ 教八', key: ''   },
          { name: '教一',     key: '9'  },
          { name: '教二',     key: '10' },
          { name: '教三',     key: '11' },
          { name: '教四',     key: '12' },
          { name: '教五',     key: '13' },
          { name: '教六',     key: '14' },
          { name: '教七',     key: '15' },
          { name: '教八',     key: '45' }
        ],
        select: 0
      },
      '第',
      {
        key: 'startSequence',
        options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        select: 0
      },
      '~',
      {
        key: 'endSequence',
        options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        select: 0
      },
      '节'
    ],
    results: [],
  },
  curPage: 0,
  ended: false,
  onLoad (options) {
    wx.$.util('user').requireLogin(this, options)

    this.updateQuery()
  },
  onPullDownRefresh() {
    this.reloadData()
    setTimeout(wx.stopPullDownRefresh, 500)
  },
  onPickerChange (event) {
    this.data.fields[event.currentTarget.dataset.index].select = event.detail.value
    this.reloadData()
  },
  reloadData () {
    let that = this
    this.setData({
      fields: that.data.fields,
      results: []
    })
    this.curPage = 0
    this.ended = false
    this.updateQuery()
  },
  updateQuery () {
    let that = this
    let data = {}
    for (let field of that.data.fields) {
      if (field.hasOwnProperty('key')) {
        data[field.key] = field.options === 'date' ? field.select : (field.options[field.select].hasOwnProperty('key') ? field.options[field.select].key : field.options[field.select])
      }
    }
    if (data.startSequence > data.endSequence) {
      wx.$.showError('起止节数不正确，请修改')
      return
    }
    wx.$.showLoading('正在查询')
    data.page = this.curPage + 1
    data.pageSize = 15
    wx.$.requestApi({
      route: 'api/newemptyroom',
      data: data,
      complete (res) {
        wx.$.hideLoading()
        if (!Array.isArray(res.data.content.rows)) {
          wx.$.showError('查询失败，请重试')
          return
        }
        that.curPage++
        that.setData({ results: that.data.results.concat(res.data.content.rows.filter(k => that.data.results.indexOf(k) === -1)) })
        if (res.data.content.rows.length === 0) {
          that.ended = true
        }
      }
    })
  },
  onReachBottom () {
    if (!this.ended) {
      this.updateQuery()
    }
  },
  onShareAppMessage () {
    return {
      title: '空闲教室',
      path: '/pages/emptyRoom/emptyRoom'
    }
  }
})