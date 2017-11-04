function uploadFail () {
  wx.$.hideLoading()
  wx.$.showError('图片上传失败，请稍后重试')
}

function uploadFile (index, filePath, uploadList, callback) {
  wx.$.showLoading('正在上传第' + (index + 1) + '个文件')
  wx.$.requestApi({
    url: 'https://myseu.cn/qiniu',
    method: 'GET',
    success: function (res) {
      if (res.statusCode !== 200) {
        uploadFail()
        return
      }
      let domain = res.data.domain
      let Qiniu_UploadUrl = 'https://up.qbox.me'
      wx.uploadFile({
        url: Qiniu_UploadUrl,
        filePath: filePath,
        name: 'file',
        formData: {
          'key': res.data.key,
          'token': res.data.token
        },
        success: function (r) {
          let data = r.data
          if (typeof data === 'string') data = JSON.parse(data.trim())
          if (data.key) {
            let imageUrl = domain + data.key
            uploadList.push(imageUrl)
          }
          wx.$.hideLoading()
          callback && callback()
        },
        fail: function (failRes) {
          uploadFail()
        }
      })
    },
    fail: function () {
      uploadFail()
    }
  })
}

exports.upload = (files, callback) => {
  wx.$.log('Uploader', 'Uploading Files', files)
  let uploadList = []
  let i = 0
  let len = files.length
  let receiveCB = function () {
    if (i >= len - 1) {
      wx.$.log('Uploader', 'Upload Success', uploadList)
      wx.$.hideLoading()
      callback(uploadList)
    } else {
      i++
      uploadFile(i, files[i], uploadList, receiveCB)
    }
  }
  uploadFile(i, files[i], uploadList, receiveCB)
}
