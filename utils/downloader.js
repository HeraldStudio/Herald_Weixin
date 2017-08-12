exports.download = (url) => {
  wx.$.showActions([{
    name: '复制文件链接',
    action: () => {
      wx.setClipboardData({
        data: url,
        success: function () {
          wx.$.showSuccess('链接已复制')
        }
      })
    }
  }])
}