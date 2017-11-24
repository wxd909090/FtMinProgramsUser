const api = require('./config').api;
App({
  onLaunch: function (res) {
    // console.log('App Launch');
    //this.globalData.shareTicket = res.shareTicket;
    var that = this;
    that.checkWxUserLogin(function (ret) {
      if (ret) {
        that.wxGetMyLocation();
      }
    });
    setInterval(that.getMyLocationBy10m, 1000 * 60 * 10);
    wx.setStorageSync('msgInfo', "");
  },
  onShow: function () {
    // console.log('App Show');
    this.updateUserInfo();
  },
  onHide: function () {
    // console.log('App Hide')
    wx.setStorageSync('msgInfo', "");
  },
  globalData: {
    imageUrl:null,
    myLocation: {},
    hasLogin: false,
    openid: null,
    storeInfo: null,
    filmInfo: null,
    roomInfo: null,
    token: null,
    userSn: null,
    imagebaseUrl: null,
    depositNum: 0,
    orderInfo: {
      id: 0,
      storeId: 0,
      storeName: '',
      address: '',
      filmId: 0,
      filmName: '',
      roomId: 0,
      roomNum: '',
      roomName: '',
      roomPrice: 0,
      price: 0,
      date: ''
    },
    chooseOrderInfo:null,
    wxUserInfo: {},
    userInfo: {},
    reviews:"",
    isShowRed: {
      noPay : false,
      noReviews : false
    },
    shareTicket:'',
    playingFilmInfo : [],
    compensateData : null,
    oldStoreInfo : {},
    msgInfo:[],
    msgToOrderInfo:null,
    allFilmPageFlag:false,
    chooseRoomInfo:null,
    choosedGoodsStore: null,
    choosedSendRoom:null,
    createOrderInfo:null,
    checkOrderInfo:null,
    choosedCoupon:{
        price:0,
        type:1
    },
    goodsInfo:null
  },
  checkWxUserLogin: function (callback) {
    if (this.globalData.wxUserInfo.nickName) {
      callback(true);
      return;
    }
    try {
      var wxUserInfo = wx.getStorageSync('wxUserInfo');
      if (wxUserInfo.nickName) {
        callback(true);
        return;
      } else {
        this.wxLogin(function (ret) {
          callback(ret);
        });
      }
    } catch (e) {
      console.log("get setStorageSync wxUserInfo fail:" + e);
    }
  },
  showModal: function (content) {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      showCancel: false,
      content: content,
      success: function (res) {
        if (res.confirm) {
          that.showModal(content);
        } else if (res.cancel) {
          that.showModal(content);
        }
      }
    })
  },
  wxLogin: function (callback) {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code;
        wx.getUserInfo({
          success: function (res) {
            try {
              var ret = res.userInfo;
              // ret.code = code;
              that.globalData.wxUserInfo = ret;
              wx.setStorageSync('wxUserInfo', ret);
              callback(true);
            } catch (e) {
              console.log("set setStorageSync wxUserInfo fail:" + e);
            }
          },
          fail: function (res) {
            callback(false);
            console.log("用户没有授权");
            that.showModal('您没有授权该小程序，将不能继续下一步的操作，请删除后再次进入并授权');
          }
        })
      },
      fail: function () {
        //login fail
        console.log("wx login fail");
      }
    });
  },
  wxGetMyLocation() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        if (res.errMsg == "getLocation:ok") {
          // console.log("wxGetMyLocation success");
          that.globalData.myLocation = { latitude: res.latitude, longitude: res.longitude };
          wx.setStorageSync('myLocation', that.globalData.myLocation);
        } else {
          console.log("wxGetMyLocation fail:" + res.errMsg);
        }

      },
      fail: function (res) {
        console.log("授权获取地理位置失败");
        that.showModal('无法获取您的地理位置，请删除后再次进入并允许获取您的地理位置');
      }
    });
  },
  //获取用户token
  getToken() {
    if (this.globalData.token != null) {
      return this.globalData.token;
    }
    try {
      var userInfo = wx.getStorageSync('userInfo');
      if (userInfo.token) {
        return userInfo.token;
      }
      return 0;
    } catch (e) {
      console.log("get setStorageSync token fail:" + e);
    }
  },

  //小程序启动时就检查用户信息有没有更新
  updateUserInfo() {
    var that = this;
    var token = this.getToken();
    if (token == 0) {
      return;
    }
    wx.request({
      url: api.getUserBaseInfo,
      header: {
        "Content-Type": "application/json"
      },
      data: {
        token: token
      },
      success: function (res) {
        if (res.data.code == 0) {
          var userInfo = {};
          userInfo = res.data.data;
          userInfo.token = token;
          that.globalData.userInfo = userInfo;
          try {
            wx.setStorageSync('userInfo', userInfo);
          } catch (e) {
            console.log("app.js ->updateUserInfo: setStorageSync userInfo fail");
          }
          if (typeof callback == 'function') {
            callback(userInfo);
          }
        } else if (res.data.code == 1012) {
            that.tokenTimeOut();
        } else {
          console.log("未知错误" + res.data.msg);
          wx.showModal({title: '系统错误',content: '未知错误',showCancel:false});
        }

      }
    });
  },

  //定时任务：定时10分钟获取一次我的位置
  getMyLocationBy10m() {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        if (res.errMsg == "getLocation:ok") {
          that.globalData.myLocation = { latitude: res.latitude, longitude: res.longitude };
        } else {
          console.log("wxGetMyLocation fail:" + res.errMsg);
        }

      },
      fail: function (res) {
        console.log("获取地理位置失败");
      }
    });
  },

  //token 过期或者不存在
  tokenTimeOut: function ()  {
    // var that = this;
    // wx.showModal({
    //   title: '温馨提示',
    //   content: '您的登陆已过期，请后重新登陆',
    //   success: function (res) {
    //     if (res.confirm) {
    //       try {
    //         that.globalData.token = null;
    //         that.globalData.userInfo = {};
    //         wx.removeStorageSync('userInfo');
    //         wx.switchTab({ url: "/page/personal/index" });
    //         return;
    //       } catch (e) {
    //         console.log("removeStorageSync('userInfo') fail ");
    //       }
    //     } else if (res.cancel) {
    //       //   console.log('用户点击取消');
    //       // wx.switchTab({ url: "/page/personal/index" });
    //     }
    //   }
    // })
  }
  
})
