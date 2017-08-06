exports.bind = function (page) {
  page.$serverDown_click = function () {
    let animation = wx.createAnimation({
      transformOrigin: "50% 100%",
      duration: 300
    })

    animation.rotate(-6).step()
    animation.rotate(3).step()
    animation.rotate(-1).step()
    animation.rotate(0).step()

    page.setData({ $serverDown_iconAnimation: animation.export() })
  }

  function animateZzz () {
    let animation = wx.createAnimation({
      duration: 700
    })

    animation.translate(10, -10).scale(1.4).opacity(0.5).step()
    animation.translate(15, -30).scale(1.6).opacity(1).step()
    animation.translate(20, -40).scale(1).opacity(0).step()
    animation.translate(0, 0).step({ duration: 0 })

    page.setData({ $serverDown_zzzAnimation1: animation.export() })

    animation = wx.createAnimation({
      duration: 700
    })

    animation.translate(1, 1).step()
    animation.translate(20, -5).scale(1.3).opacity(0.5).step()
    animation.translate(30, -15).scale(1.5).opacity(1).step()
    animation.translate(35, -35).scale(1).opacity(0).step()
    animation.translate(0, 0).step({ duration: 0 })

    page.setData({ $serverDown_zzzAnimation2: animation.export() })
  }

  if (page.data.$serverDown_interval) {
    clearInterval(page.data.$serverDown_interval)
  }
  page.data.$serverDown_interval = setInterval(animateZzz, 2500)
}