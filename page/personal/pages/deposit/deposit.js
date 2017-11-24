var api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var app = getApp();
Page({
  data: {
    'order_sn': '',
    hidden: true,
    depositNum: 0,
    fromPage: 0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    //console.log(options);
    this.setData({ fromPage: options.page });
    this.getDepositNum();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  chargeDeposit: function () {
    var self = this;
    wx.request({
      url: api.chargeDeposit,
      header: {
        "Content-Type": "application/json"
      },
      data: {
        token: common.getToken()
      },
      success: function (res) {
        var data = res.data;
        if (data.code === 0) {
          self.setData({
            price: res.data.data.price,
            order_sn: res.data.data.d_order_sn,
          });
          common.pay(self, res.data.data.d_order_sn, function (payRet) {
            if (payRet.code == 0) {
              common.updateUserInfo(function () {
                if (app.globalData.chooseOrderInfo) {
                  self.getUserActivity(self)
                  // common.createOrder(app.globalData.chooseOrderInfo.orderInfo, self);
                } else {
                  wx.switchTab({ url: '/page/personal/index' });
                }
              });
              // common.showMsg('温馨提示', '充值押金成功，快去预约电影吧', function () {
              //   common.updateUserInfo(function () {
              //     if (app.globalData.chooseOrderInfo) {
              //       self.getUserActivity(self)
              //       // common.createOrder(app.globalData.chooseOrderInfo.orderInfo, self);
              //     } else {
              //       wx.switchTab({ url: '/page/person/index' });
              //     }
              //   });
              // });
            } else if (payRet.code === 1) {
              common.showMsg('错误提示', payRet.msg,function(){
                wx.switchTab({ url: '/page/personal/index' });
              });
            } else if (payRet.code === 2) {
              common.showMsg('温馨提示', "请及时支付押金(可退)，否则无法预约电影", function () {
                wx.switchTab({ url: '/page/personal/index' });
              });
            } else {
              common.errMsg(res.data);
            }

          });
        } else {
          common.showMsg('温馨提示', res.data.msg, function () {
            return;
          });
          console.log("未知错误：" + res.data.msg);
        }

      }
    });
  },
  getUserActivity: function (self) {
    var self = self;
    var token = common.getToken();
    if (!token) {
      return;
    }
    wx.request({
      url: api.getUserActivity,
      data: { token: token },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data.length > 0) {
            wx.switchTab({ url: '/page/film/index' });
          } else {
            if (app.globalData.chooseOrderInfo) {
              common.createOrder(app.globalData.chooseOrderInfo.orderInfo, self);
            } else {
              wx.switchTab({ url: '/page/personal/index' });
            }
          }
        } else {
          wx.navigateBack({ url: "/page/film/index" });
        }
      },
      fail: function () {
        wx.navigateBack({ url: "/page/film/index" });
      },
      complete: function () {

      }
    })
  },
  getDepositNum: function () {
    var that = this;
    that.setData({ hidden: false });
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
        that.setData({ hidden: true });
      }
    })
  }
})