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
    wx.$.requestApi({
      route: 'api/user',
      success (res) {
        that.setData({
          cardnum: res.data.content.cardnum,
          password: wx.$.userStorage('card_charge_password_' + res.data.content.cardnum),
          remember: wx.$.userStorage('card_charge_password_' + res.data.content.cardnum) !== ''
        })
      }
    })
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
  onPasswordChange (event) {
    this.data.password = event.detail.value
  },
  onRememberChange (event) {
    this.data.remember = event.detail.value
    if (!this.data.remember) {
      this.setData({
        password: ''
      })
    }
  },
  submit () {
    let cardnum = this.data.cardnum + ''
    let password = this.data.password + ''
    let amount = this.data.amount + ''
    let remember = this.data.remember
    if (!/^\d{6}$/.test(password)) {
      wx.$.showError('请输入正确的查询密码')
      return
    }
    if (!/^([1-9]\d{0,3}|0)(\.\d{1,2})?$/.test(amount)) {
      wx.$.showError('金额格式不正确, 只支持不超过10000的正整数或最多两位小数')
      return
    }
    wx.$.ask('充值确认', '确认从银行卡中充值' + amount + '元吗？此操作不能撤销。', () => {
      wx.$.requestApi({
        url: 'https://myseu.cn/charge',
        data: {
          cardnum: cardnum,
          password: password,
          amount: amount
        },
        complete (res) {
          if (res.data.errmsg === '转账成功') {
            wx.$.showSuccess('充值成功')
            if (remember) {
              wx.$.userStorage('card_charge_password_' + cardnum, password)
            } else {
              wx.$.userStorage('card_charge_password_' + cardnum, '')
            }
          } else {
            wx.$.showError(res.data.errmsg || '未知错误，请稍后再试')
          }
        }
      })
    })
  }
})