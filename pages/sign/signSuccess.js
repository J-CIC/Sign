Page({
  onLoad:function(options){
    this.setData({
      id:options.id
    })
    wx.setNavigationBarTitle({
      title: "发起签到成功"
    });
  },
  onShareAppMessage:function(res){
    return {
      title: wx.getStorageSync('nickname')+'发起的签到',
      imageUrl: wx.getStorageSync('imgUrl'),
      path: '/pages/sign/attendSign?id='+this.data.id,
      success: function (res) {

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  mySign:function(){
    wx.redirectTo({
      url: '/pages/sign/mySign',
    })
  }
});