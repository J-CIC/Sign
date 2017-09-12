//app.js
App({
  onLaunch: function () {
    var that = this
    if (wx.getStorageSync('openId')){

    }else{
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.request({
            url: 'https://withcic.cn/getOpenid',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: 'POST',
            data: {
              js_code: res.code
            },
            dataType: 'json',
            success: function (res) {
              if (!res.data.openid) {
                wx.showModal({
                  title: '出了点状况',
                  content: '服务器暂时无法提供服务，请检查网络',
                  success: function (res) {

                  }
                })
              }
              that.globalData.openId = res.data.openid;
              wx.setStorageSync('openId', res.data.openid)
            },
            fail: function (res) {
              console.log(res)
              wx.showModal({
                title: '出了点状况',
                content: '服务器暂时无法提供服务，请检查网络',
                success: function (res) {

                }
              })
            }
          })
        },
        fail: function () {
          console.log(arguments)
        }
      })
    }
  },
  globalData: {
    openId:null,
  }
})