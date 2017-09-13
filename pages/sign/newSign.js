//index.js
//获取应用实例
const app = getApp()
var util = require("../../utils/util.js")
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    showTopTips: false,
    loc_input:true,
    pwd_input:true,
    loc_info:"",
    pwd_info:"",
    err_msg:"",
    distance:"",
    openId: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    checkboxItems: [
      { name: '密码签到', value: 1, checked: true },
      { name: '位置签到', value: 2, checked: true }
    ],
  },
  onLoad:function(){
    wx.setNavigationBarTitle({
      title:"发起签到"
    });
    var now = util.formatTime(new Date());
    this.setData({
      date:now.substr(0,10),
      time:now.substr(11,5)
    })
    var imgUrl = wx.getStorageSync('imgUrl');
    var nickname = wx.getStorageSync('nickname');
    if(imgUrl&&nickname){
      this.setData({
        userInfo:{
          avatarUrl: imgUrl,
          nickName: nickname,
        },
      })
    }
    this.setData({
      hasUserInfo:true,
    })
  },
  checkboxChange: function (e) {
    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    if(values.length==0){
      this.showTopTips("至少选择一种签到模式");
    }
    var groups = ["pwd_input","loc_input"]
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;
      var flag = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          flag = true;
          break;
        }
      }
      this.setView(i,flag);
    } 
    this.setData({
      checkboxItems: checkboxItems
    });
  },
  showTopTips: function (msg) {
    this.setData({
      err_msg:msg
    })
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  setView:function(index,status){
    if(index==0){
      this.setData({
        pwd_input:status
      })
    }else{
      this.setData({
        loc_input: status
      })
    }
  },
  updatePwd: function (e) {
    this.setData({
      pwd_info: e.detail.value
    })
  },
  updateLoc: function (e) {
    this.setData({
      loc_info: e.detail.value
    })
  },
  checkInput:function(){
    if (!this.data.pwd_input && !this.data.loc_input){
      this.showTopTips("至少选择一种签到模式")
      return false;
    }
    if (this.data.pwd_input && this.data.pwd_info.length!=4){
      this.showTopTips("密码长度为4位")
      return false;
    }
    if (this.data.loc_input && this.data.loc_info.length == 0) {
      this.showTopTips("请获取定位")
      return false;
    }
    if (this.data.loc_input && this.data.distance.length == 0){
      this.showTopTips("请输入位置精度")
      return false;
    }
    wx.showLoading({title:"生成签到中",mask:true});
    var sign_type = 0;
    var end_time = this.data.date+" "+this.data.time+":00"
    this.data.pwd_input ? sign_type += 1 : 0;
    this.data.loc_input ? sign_type += 2 : 0;
    wx.request({
      url: 'https://withcic.cn/sign',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openId'),
        sign_type:sign_type,
        location:this.data.loc_info,
        pwd:this.data.pwd_info,
        end_time:end_time,
        distance:this.data.distance,
      },
      dataType: 'json',
      success: function (res) {
        console.log(res)
        console.log(wx.getStorageSync('openId'))
        if (res.data.err_code!=0) {
          wx.hideLoading()
          wx.showModal({
            title: '出了点状况',
            content: '服务器暂时无法提供服务，请检查网络',
            success: function (res) {

            }
          })
        } else {
          wx.hideLoading()
          wx.redirectTo({ url:"/pages/sign/signSuccess?id="+res.data.id})
        }
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '出了点状况',
          content: '服务器暂时无法提供服务，请检查网络',
          success: function (res) {

          }
        })
      }
    })
  },
  getLoc:function(){
    var that = this
    wx.showLoading({
      title: '定位中,请尽量打开GPS定位',
      mask:true,
    })
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        wx.hideLoading()
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        that.setData({
          loc_info:latitude+","+longitude
        })
      },
      fail:function(){
        console.log(arguments)
        wx.hideLoading()
        wx.showModal({
          title: '获取位置失败',
          content:'请确认是否授权小程序获取位置',
          confirmText:"去设置",
          fail:function(){
            console.log(arguments)
          },
          success:function(res){
            if (res.confirm) {
              wx.openSetting()
            } else if (res.cancel) {

            }
          }
        });
      }
    })
  },
  updateDistance: function (e) {
    this.setData({
      distance: e.detail.value
    })
  },
  goBack:function(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  }
})