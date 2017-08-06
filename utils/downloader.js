exports.download = (url) => {
    wx.$.showActions([{
        name: '预览文件',
        action: () => {
            wx.$.showLoading("正在下载文件")
            wx.downloadFile({
                url: 'https://myseu.cn/wxapp/getfile/' + url,
                success(res) {
                    wx.openDocument({
                        filePath: res.tempFilePath,
                        success() {
                            wx.$.hideLoading()
                        },
                        fail(res) {
                            wx.$.hideLoading()
                            wx.$.showError("无法打开该文件\n" + res.errMsg)
                        }
                    })
                },
                fail(res) {
                    wx.$.hideLoading()
                    wx.$.showError("无法下载该文件\n" + res.errMsg)
                }
            })
        }
    }, {
        name: '复制链接',
        action: () => {
            wx.setClipboardData({
                data: url,
                success: function (res) {
                    wx.$.showSuccess('链接已复制')
                }
            })
        }
    }])
}