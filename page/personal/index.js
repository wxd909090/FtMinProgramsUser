var api = require('../../config').api;
var app = getApp();
const common = require('../common/js/common.js');
Page({
  data: {
    hidden: true,
    wxUserInfo: {},
    userInfo: {},
    hasLogin: false,
    isShowRed: {
      noPay: false,
      noReviews: false
    },
    // 正在播放的电影数playingNum: 0,
    oneFilmOrderSn: "",
    msgNum:0,     
    depositNum:0,
    msgInfo:[],
    allCollectFilms:[],
        my_order_icon:"http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/person_icon/my_order_icon.png",
    my_deposit_icon:"http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/person_icon/my_deposit_icon.png",
    my_coupon_icon:"http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/person_icon/my_coupon_icon.png",
    my_message_icon:"http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/person_icon/my_message_icon.png",
    password_icon:"http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/person_icon/password_icon.png",
    about_icon:"http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/person_icon/about_icon.png"
  },
  onLoad: function (options) {
    console.log(options)
   
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
    // this.getUserInfo();
    
  },
  onShow: function () {
    this.getWxUserInfo();
    this.getUserInfo();
    this.checkLogin();
    app.globalData.chooseOrderInfo = null;
    this.setData({ isShowRed: app.globalData.isShowRed });


    
    // var allCollectFilms = app.globalData.collectFilms;
    // this.setData({
    //   allCollectFilms: allCollectFilms
    // })
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏
  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载
  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作
  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数
  },
  //拉取收藏电影列表
  getCollectFilms: function () {
    //common.getCollectFilmsList();
    var self = this;
    var data = {};
    data['token'] = common.getToken();
    wx.request({
      url: api.getCollectFilms,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        app.globalData.collectFilms = res.data.data.list.data;
        var newData = res.data.data.list.data; 
        self.setData({
          allCollectFilms: newData
        })
        console.log(res);
      },
      fail: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest);
        console.log(textStatus);
        console.log(errorThrown);
      },
      complete: function () {

      }
    })
  },
  getUserInfo: function () {
    var that = this;
    common.getUserInfo(function (Info) {
      that.setData({ userInfo: Info });
    });
  },
  getWxUserInfo: function () {
    var that = this;
    common.getWxUserInfo(function (info) {
      that.setData({ wxUserInfo: info });
    });
    // console.log(that.data.wxUserInfo);
  },
  checkLogin: function () {
    this.setData({ hasLogin: common.checkUserLogin()});
    if (this.data.hasLogin) {
      this.isShowRedStatus();
      this.getPlayingFiml();
      this.getMsg();
      this.getDepositNum();
      this.getCollectFilms();
    }
  },
  getDepositNum: function () {
    var that = this;
    wx.request({
      url: api.baseInterface,
      data: {
        token: common.getToken()
      },
      method: 'GET',
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({ depositNum: res.data.data.deposit });
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function (res) {
        console.log("getDepositNum :请求获取押金金额失败");
      },
      complete: function (res) {
      }
    })
  },
  setDeposite : function () {
    var self = this;
    if (parseInt(self.data.depositNum) == 0){
      common.showMsg('温馨提示', '不需要缴纳押金');
      return;
    }else{
      wx.navigateTo({
        url: '/page/personal/pages/deposit/deposit?page=personal',
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  },
  getMsg: function(){
    var self = this;
    if (common.getUserSn()) {
      var data = {
        token: common.getToken(),
        user_sn: common.getUserSn()
      }
      wx.request({
        url: api.getMsg,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if(res.data.code == 0){
            if (res.data.data.length>0){
              for(var i = 0;i < res.data.data.length;i++){
                res.data.data[i] = JSON.parse(res.data.data[i]);
                res.data.data[i].read = false;
              }
            }
           

            if (!wx.getStorageSync('msgInfo')) {
                wx.setStorageSync('msgInfo', res.data.data);
                self.setData({
                    msgNum: res.data.data.length
                });
            } else {
                var msgInfo = wx.getStorageSync('msgInfo');
                if (msgInfo.length > 10){
                    msgInfo = msgInfo.splice(0,9)
                }
                msgInfo = res.data.data.concat(msgInfo);
                var sum = 0;
                for (var q = 0; q < msgInfo.length;q++){
                    if (!msgInfo[q].read){
                        sum += 1;
                    }
                }
                self.setData({
                    msgNum: sum
                });
                wx.setStorageSync('msgInfo', msgInfo);
            }
          }else{
            common.errMsg(res.data);
          }
        },
        complete: function () {

        }
      })
    } else {
      return;
    }
  },
  isShowRedStatus: function () {
    var self = this;
    if (common.getUserSn()) {
      var data = {
        token: common.getToken(),
        user_sn: common.getUserSn()
      }
      wx.request({
        url: api.isShowRed,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
            if (res.data.code == 0) {
                app.globalData.isShowRed = res.data.data;
                self.setData({ isShowRed: app.globalData.isShowRed })
            } else {
                common.errMsg(res.data)
            }
        },
        complete: function () {

        }
      })
    } else {
      return;
    }
  },
  clear: function () {
    this.setData({
      hasUserInfo: false,
      userInfo: {},
      hasLogin: false
    })
  },
  realGetDeposit: function () {
    //赎回押金
    var self = this;
    wx.request({
      url: api.refundOrder,
      data: {
        token: common.getToken(),
        order_sn: self.data.order_sn,
        wx_order_sn: self.data.wx_order_sn,
      },
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var data = res.data;
        if (data.code === 0) {
          common.updateUserInfo();
          common.showMsg('温馨提示', '押金将在24小时内退还到微信', function () {
            self.getUserInfo();
            wx.redirectTo({ url: "/page/personal/index" });
          });

        } else {
          common.errMsg(res.data);
        }
      },
      complete: function () {
        self.setData({ hidden: true });
      }
    })
  },
  getDepositSN: function () {
    //获取押金的订单sn
    var self = this
    self.setData({ hidden: false });
    wx.request({
      url: api.getDepositSN,
      data: { token: common.getToken() },
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        var data = res.data;
        if (data.code === 0) {
          // console.log(res.data);
          self.setData({ order_sn: data.data.d_order_sn, wx_order_sn: data.data.wx_order_sn })
          self.realGetDeposit();
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {
        console.log("personal:getDepositSN fail");
      },
      complete: function (res) {
        self.setData({ hidden: true });
      }

    })
  },
  getDeposite: function () {
    var that = this;
    common.updateUserInfo(function (userInfo) {
      if (parseFloat(userInfo.compensate) > 0) {
        common.showMsg("警告", "您有违约记录，请您先支付违约金后再申请退还押金");
      } else {
        // common.showMsg('押金退还', "押金将在2小时内退回，退款后，您将无法观影，确认要进行此退款吗？",
        //   function () {that.getDepositSN();},function(){});
        wx.showModal({
          title: '押金退还',
          content: '押金将在2小时内退回，退款后，您将无法观影，确认要进行此退款吗？',
          showCancel: true,
          cancelColor: "#A9A9A9",
          confirmText: "继续使用",
          cancelText: "押金退款",
          success: function (res) {
            if (res.confirm) {
              // console.log('用户点击确定')
            } else if (res.cancel) {
              that.getDepositSN();
            }
          }
        })
      }
    });
  },
  getCompensate: function (options) {
    // console.log(options.currentTarget.dataset.compensate);
    var compensate = parseFloat(options.currentTarget.dataset.compensate);
    if (compensate <= 0) {
      common.showMsg('温馨提示', '您没有违约记录');
      return;
    }
    //提交罚金
    var self = this
    if (common.checkUserLogin()) {
      wx.request({
        url: api.getUserBaseInfo,
        data: {
          token: common.getToken()
        },
        method: 'get',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          // console.log(res.data)
          if (res.data.code == 0) {
            //数据拉取成功
            app.globalData.userInfo = res.data.data;
            if (res.data.data.compensate > 0) {
              var content = '支付罚金￥' + res.data.data.compensate + '，不缴纳罚金你将不能预约电影，若确定要缴纳罚金，请点击确定,否则点击取消';
              common.showMsg('缴纳罚金', content, function () { self.createCompensateOrder(); });
            } else {
              common.showMsg('', '您没有违约记录');
            }
          } else {
            common.errMsg(res.data);
          }
        },
        fail: function () {
          console.log("personal:getDepositSN fail");
        }
      })
    }
  },
  createCompensateOrder: function () {
    //下赔偿单
    var self = this;
    wx.request({
      url: api.payCompensate,
      header: {
        "Content-Type": "application/json"
      },
      data: {
        token: common.getToken()
      },
      success: function (res) {
        var data = res.data;
        // console.log(data);
        if (data.code === 0) {
          self.setData({ order_sn: data.data.c_order_sn, price: data.data.price })
          common.pay(self, data.data.c_order_sn, function (payRet) {
            if (payRet.code == 0) {
              common.showMsg("温馨提示", "违约金支付成功", function () {
                common.updateUserInfoKeyVal({ 'compensate': '0.00' });
                self.getUserInfo();
              });
            }
          });
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {
        console.log("personal:createCompensateOrder fail");
      }
    })
  },
  gotoLogin: function () {
    if (!app.globalData.isShowLogin){
      wx.navigateTo({ url: "/page/login/index" });
    }
  },
  LoginOut: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: "是否确认退出？",
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          app.globalData.hasLogin = false;
          app.globalData.token = null;
          app.globalData.userInfo = {};
          try {
            wx.removeStorageSync('userInfo');
            that.clear();
          } catch (e) {
            console.log(" loginOut: removeStorageSync('userInfo') fail ");
          }
        } else {
          // wx.switchTab({ url: "/page/room/index" });
        }
      }
    });
  },
  // 获得正在播放的电影
  getPlayingFiml: function () {
    var token = common.getToken();
    var user_sn = common.getUserSn();
    var that = this;
    if (!token){
      return;
    }
    wx.request({
      url: api.getPlayingOrderList,
      data: {
        token: token,
        user_sn: user_sn,
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 0){
          console.log(res);
          // for (var i = 0; i < res.data.data.data.length; i++) {
          //   if (res.data.data.data.length > 0) {
          //     var date = new Date();
          //     var hour = date.getHours();
          //     var minutes = date.getMinutes();
          //     var nowTime = hour * 60 + minutes;
          //     if (nowTime > Number(res.data.data.data[i].end_time)) {
          //       res.data.data.data.splice(i, 1);
          //     }
          //   }
          // }
          app.globalData.playingFilmInfo = res.data.data;
          that.setData({ playingNum: res.data.data.length });
          if (res.data.data.length == 1) {
            that.setData({ oneFilmOrderSn: res.data.data[0].order_sn })
          }
        }else{
          common.errMsg(res.data)
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  //跳转fullorder
  jumpfullorder:function(e){
    var dom = e.currentTarget;
    var sign = dom.dataset.sign;
    wx.navigateTo({ url: '/page/order/pages/fullorder/fullorder?sign='+sign });
  },
  //跳转到所有收藏页面
  toFilmsCollect:function(){
    wx.navigateTo({ url: '/page/allCollectFilms/allCollectFilms' });
  },
  //   所有订单
  allOrder: function () {
      wx.navigateTo({ url: '/page/order/pages/myOrder/myOrder' });
  }
})