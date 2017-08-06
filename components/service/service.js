exports.bind = function (page, callback) {
  let info = wx.getSystemInfoSync()
  let user = wx.$.util('user').getUser()
  wx.$.requestApi({
    url: 'https://myseu.cn/checkversion',
    // url: 'http://localhost:8080/checkversion',
    data: {
      versiontype: 'wxapp-' + info.platform,
      versionname: info.system,
      versioncode: '',
      schoolnum: (user ? user.schoolnum : '00000000')
    },
    success: function (res) {
      console.log(res)
      // 去掉下面注释可模拟服务器down状态
      // res.data.content.serverHealth = false
      res.data.content.isLogin = wx.$.util('user').isLogin()
      page.setData({ $service: res.data.content })

      let health = res.data.content.serverHealth
      callback(health)
    }
  })

  page.$service_vote = function (event) {
    if (page.data.$service.vote.voted) {
      wx.$.showError('你已参与投票，不能重复投票哦！')
      return
    }

    let attitude = event.currentTarget.dataset.attitude

    if (attitude === 'positive') {
      let animation = wx.createAnimation({ duration: 300, transformOrigin: '50% 130%' })
      animation.scale(1.2).rotate(-10).step()
      animation.rotate(10).step()
      animation.rotate(-7).step()
      animation.rotate(7).step()
      animation.scale(1).rotate(0).step()
      page.setData({ $service_voteAnimationPositive: animation.export() })
    } else if (attitude === 'negative') {
      let animation = wx.createAnimation({ duration: 300, transformOrigin: '150% 50%' })
      animation.scale(1.2).rotate(-10).step()
      animation.rotate(2).step()
      animation.rotate(-10).step()
      animation.rotate(5).step()
      animation.scale(1).rotate(0).step()
      page.setData({ $service_voteAnimationNegative: animation.export() })
    }

    wx.$.requestApi({
      url: 'https://myseu.cn/vote',
      data: {
        vote_id: page.data.$service.vote.id,
        attitude: attitude
      },
      success (res) {
        if (res.data.code !== '200') {
          wx.$.showError(res.data.content)

        } else {
          let service = page.data.$service
          service.vote = res.data.content.vote
          page.setData({ $service: service })
        }
      }
    })

  }
}