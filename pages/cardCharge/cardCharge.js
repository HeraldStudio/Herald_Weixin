Page({
  data: {
    cardnum: '',
    amount: 50,
    customAmount: null,
    password: '',
    remember: false
  },
  onLoad () {
    let that = this
    if (wx.$.util('user').isLogin()) {
      wx.$.showLoading('加载中')
      wx.$.requestApi({
        route: 'api/user',
        success(res) {
          that.setData({
            cardnum: res.data.content.cardnum,
            password: wx.getStorageSync('charge_password_' + res.data.content.cardnum),
            remember: !!wx.getStorageSync('charge_password_' + res.data.content.cardnum)
          })
          wx.$.hideLoading()
        },
        fail(res) {
          wx.$.hideLoading()
        }
      })
    } else {
      let cardnum = wx.getStorageSync('charge_cardnum')
      if (cardnum) {
        that.setData({
          cardnum: cardnum,
          password: wx.getStorageSync('charge_password_' + cardnum),
          remember: true
        })
      }
    }
  },
  onShareAppMessage () {
    return {
      title: '一卡通充值',
      path: '/pages/cardCharge/cardCharge'
    }
  },
  changeAmount (event) {
    if (event.detail.value !== undefined) {
      if (/^(([1-9]\d{0,3}|0)(\.\d{0,2})?)?$/.test(event.detail.value)) {
        this.setData({
          amount: parseFloat(event.detail.value || 0),
          customAmount: parseFloat(event.detail.value || null),
        })
      } else {
        return this.data.customAmount || ''
      }
    } else if (event.currentTarget.dataset.to) {
      this.setData({
        amount: parseFloat(event.currentTarget.dataset.to)
      })
    }
  },
  onCardnumChange(event) {
    this.data.cardnum = event.detail.value
    this.setData({
      password: ''
    })
  },
  onPasswordChange (event) {
    this.data.password = event.detail.value
  },
  onRememberChange (event) {
    this.data.remember = event.detail.value
  },
  submit () {
    let cardnum = this.data.cardnum + ''
    let password = this.data.password + ''
    let amount = this.data.amount + ''
    let remember = this.data.remember
    if (!/^2\d{8}$/.test(cardnum)) {
      wx.$.showError('请输入正确的一卡通号')
      return
    }
    if (!/^\d{6}$/.test(password)) {
      wx.$.showError('请输入正确的查询密码')
      return
    }
    if (!/^([1-9]\d{0,3}|0)(\.\d{1,2})?$/.test(amount)) {
      wx.$.showError('金额格式不正确, 只支持不超过10000的正整数或最多两位小数')
      return
    }
    wx.$.ask('充值确认', '确认从银行卡中充值' + amount + '元吗？此操作不能撤销。', () => {
      wx.$.showLoading('充值中…')
      wx.$.requestApi({
        url: 'https://myseu.cn/charge',
        data: {
          cardnum: cardnum,
          password: password,
          amount: amount
        },
        complete(res) {
          wx.$.hideLoading()
          if (res.data.errmsg === '转账成功') {
            wx.$.showSuccess('充值成功')
            if (remember) {
              wx.setStorageSync('charge_cardnum', cardnum)
              wx.setStorageSync('charge_password_' + cardnum, password)
            } else {
              wx.setStorageSync('charge_cardnum', '')
              wx.setStorageSync('charge_password_' + cardnum, '')
            }
          } else {
            wx.$.showError(res.data.errmsg || '未知错误，请稍后再试')
          }
        }
      })
    })
  }
})
