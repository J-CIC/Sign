const app = getApp()
Page({
  data:{
    sign_num:0,
  },
  onLoad:function(options){
    wx.setNavigationBarTitle({
      title: "我发起的签到"
    });
    this.getMySign();
  },
  getMySign:function(){
    var that = this;
    wx.request({
      url: app.domain + 'wxuser/' + wx.getStorageSync('openId'),
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        that.setData({
          sign_num:res.data.signs.length,
          my_sign:res.data.signs,
        })
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
  goBack:function(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  }
})