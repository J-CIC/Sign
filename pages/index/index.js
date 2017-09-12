//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    openId:null,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "签到中心"
    });
    this.checkLogin();
  },
  checkLogin:function(){
    var that = this
    var openId = wx.getStorageSync('openId') 
    if(openId){
      this.setData({
        openId: openId
      })
      wx.setStorageSync('openId', openId)
      that.getUserBasicInfo();
    }else{
      wx.login({
        success: function (res) {
          that.getOpenId(res.code);
        },
      })
    }
  },
  //跳转设置页面授权
  openSetting: function () {
    var that = this
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          //尝试再次登录
          wx.login({
            success: function (res) {
              that.getOpenId(res.code);
            },
          })
          that.getUserBasicInfo();
        },
        fail:function(){
          console.log(arguments)
        },
      })
    } else {
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
      })
    }
  },
  newSign:function(){
    wx.redirectTo({
      url: '../sign/newSign'
    })
  },
  getOpenId:function(code){
    var that = this;
    //发起网络请求
    wx.request({
      url: 'https://withcic.cn/getOpenid',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data: {
        js_code: code
      },
      dataType: 'json',
      success: function (res) {
        if (!res.data.openid) {
          wx.showModal({
            title: '出了点状况',
            content: '服务器暂时无法提供服务，请检查网络：No id',
            success: function (res) {

            }
          })
        }else{
          that.setData({
            openId: res.data.openid,
          })
          wx.setStorageSync('openId', res.data.openid)
          that.getUserBasicInfo();
        }
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
  getUserBasicInfo:function(){
    var that = this;
    // 获取用户信息
    wx.getUserInfo({
      success: res => {
        wx.setStorageSync('imgUrl', res.userInfo.avatarUrl)
        wx.setStorageSync('nickname', res.userInfo.nickName)
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        that.sendRegister();
      }
    })
  },
  sendRegister:function(){
    var that = this
    wx.request({
      url: 'https://withcic.cn/wxuser',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openId'),
        imgUrl: that.data.userInfo.avatarUrl,
        nickname: that.data.userInfo.nickName,
      },
      dataType: 'json',
      success: function (res) {
        if (res.data.err_code!=0) {
          wx.showModal({
            title: '出了点状况',
            content: '服务器暂时无法提供服务，请检查网络：'+res.data.err_msg,
            success: function (res) {

            }
          })
        }
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
  mySign:function(){
    wx.redirectTo({
      url: '/pages/sign/mySign',
    })
  }
})
