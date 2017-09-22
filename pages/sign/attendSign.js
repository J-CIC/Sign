const app = getApp()
Page({
  data:{
    loc_info:"",
    pwd_info:"",
    real_name:"",
    record_type:true,
    record_info:"签到",
    p_num:0,
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    wx.setNavigationBarTitle({
      title: "参加签到"
    });
    var that = this;
    this.checkLogin();
    this.getSignInfo();
  },
  getSignInfo:function(){
    var that = this;
    wx.request({
      url: app.domain + 'sign/' + this.data.id,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        var num = res.data.records ? res.data.records.length:0;
        that.setData({
          userInfo: {
            avatarUrl: res.data.wx_user.imgUrl,
            nickName: res.data.wx_user.nickname,
          },
          p_num: num,
          sign_list: res.data.records,
          end_time: res.data.end_time,
          distance: res.data.distance,
        })
        if (res.data.sign_type == 1) {
          that.setData({
            pwd_input: true,
          })
        } else if (res.data.sign_type == 2) {
          that.setData({
            loc_input: true,
          })
        } else {
          that.setData({
            pwd_input: true,
            loc_input: true,
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
  getRecordType:function(){
    var that = this;
    wx.request({
      url: app.domain + 'record/getType',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data:{
        openId: wx.getStorageSync("openId"),
        sign_id: this.data.id,
      },
      dataType: 'json',
      success: function (res) {
        if(res.data.err_code==1){
          that.setData({
            record_type:false,
            record_info:"签到"
          })
        }else if(res.data.err_code==0){
          //已签到
          that.setData({
            record_type: true,
            record_info: "已签到"
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
  getLoc: function () {
    var that = this
    wx.showLoading({
      title: '定位中',
    })
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy
        that.setData({
          loc_info: latitude + "," + longitude
        })
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  updatePwd: function (e) {
    this.setData({
      pwd_info: e.detail.value
    })
  },
  updateName: function (e) {
    this.setData({
      real_name: e.detail.value
    })
  },
  checkInput: function () {
    var that = this;
    if (this.data.pwd_input && this.data.pwd_info.length != 4) {
      this.showTopTips("密码长度为4位")
      return false;
    }
    if (this.data.loc_input && this.data.loc_info.length==0) {
      this.showTopTips("请获取定位")
      return false;
    }
    if (this.data.real_name.length==0){
      this.showTopTips("请填写姓名")
      return false;
    }
    wx.showLoading({title:"签到中",mask:true});
    that.setData({
      record_type: true,
    }) 
    wx.request({
      url: app.domain + 'record',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openId'),
        location: this.data.loc_info,
        pwd: this.data.pwd_info,
        id:this.data.id,
        real_name:this.data.real_name,
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();          
        if (res.data.err_code != 0) {
          that.setData({
            record_type: false,
          }) 
          wx.showModal({
            title: '签到失败',
            content: res.data.err_msg,
            success: function (res) {
              
            },
          })
        } else {
          that.getSignInfo();
          wx.showToast({
            title: '签到已完成',
            icon: 'success',
            duration: 3000
          });
        }
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading();        
        wx.showModal({
          title: '出了点状况',
          content: '服务器暂时无法提供服务，请检查网络',
          success: function (res) {

          }
        })
      }
    })
  },
  showTopTips: function (msg) {
    this.setData({
      err_msg: msg
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
  checkLogin: function () {
    var that = this
    var openId = wx.getStorageSync('openId')
    if (openId) {
      this.setData({
        openId: openId
      })
      wx.setStorageSync('openId', openId)
      that.getUserBasicInfo();
      that.getRecordType();
    } else {
      that.openSetting();
    }
  },
  //跳转设置页面授权
  openSetting: function () {
    // console.log("openSetting")
    var that = this
    wx.login({
      success: function (res) {
        that.getOpenId(res.code);
      },
      fail: function () {
        console.log(arguments)
      }
    })
  },
  getOpenId: function (code) {
    var that = this;
    // console.log("getOpenId")
    //发起网络请求
    wx.request({
      url: app.domain + 'getOpenid',
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
        } else {
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
  getUserBasicInfo: function () {
    // console.log("getUserBasicInfo")
    var that = this;
    // 获取用户信息
    wx.getUserInfo({
      success: function (res) {
        // console.log(res)
        wx.setStorageSync('imgUrl', res.userInfo.avatarUrl)
        wx.setStorageSync('nickname', res.userInfo.nickName)
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // console.log(that.data)
        that.sendRegister();
      },
      fail: function () {
        wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userInfo'] == false) {
              that.confirmSetting();
            }
          }
        })
        console.log(arguments)
      }
    })
  },
  confirmSetting: function () {
    var that = this;
    wx.showModal({
      title: '获取用户信息失败',
      content: '请确认是否授权小程序获取信息',
      confirmText: "去设置",
      fail: function () {
        console.log(arguments)
      },
      success: function (res) {
        if (res.confirm) {
          that.changeSetting()
        } else if (res.cancel) {

        }
      }
    });
  },
  changeSetting: function () {
    var that = this;
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
        fail: function () {
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
  sendRegister: function () {
    var that = this
    wx.request({
      url: app.domain + 'wxuser',
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
        // console.log(res)
        if (res.data.err_code != 0) {
          wx.showModal({
            title: '出了点状况',
            content: '服务器暂时无法提供服务，请检查网络：' + res.data.err_msg,
            success: function (res) {

            }
          })
        }else{
          that.getRecordType();
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
});