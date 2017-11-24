var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var config = require('../../../../config').config
var api = require('../../../../config').api
const common = require('../../../common/js/common.js');
var app = getApp();
var timeTask = '';
var page1 = 1;
var page2 = 1;
Page({
  data: {
    imageUrl: config.imageUrl,
    index: 0,
    tabs: ["待支付", "已支付"],
    sliderOffset: 0,
    sliderLeft: 0,
    hidden: false,
    // tab切换  
    currentTab: 0,
    orderNoPay: [],
    orderPay: [],
    loadText1: ['上拉加载更多', '没有更多了'],
    loadTextIndx1: 0,
    loadText2: ['上拉加载更多', '没有更多了'],
    loadTextIndx2: 0,
    serverTime: 0,
    isShowRed: ""
  },
  onLoad: function (options) {
    var that = this;
    if (!options.currentTab && options.currentTab == 1) {
      that.setData({
        currentTab: 1
      })
    }
    that.setData({ imageUrl: app.globalData.imageUrl });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.currentTab
        });
      }
    });
  },
  onShow: function () {
    app.globalData.msgToOrderInfo = null;
    app.globalData.orderInfo = null;
    this.isShowRedStatus();
    this.setData({
      isShowRed: app.globalData.isShowRed
    });
    app.globalData.reviews = "";
    clearInterval(timeTask);
    page1 = 1;
    page2 = 1;
    this.data.orderNoPay = [];
    this.data.orderPay = [];
    this.getOrderPay();
    this.getOrderNoPay();
  },
  //上拉加载分页
  onReachBottom: function () {
    if (this.data.currentTab == 0 && this.data.loadTextIndx1 == 0) {
      console.log('刷新待支付');
      this.getOrderNoPay();
    }
    if (this.data.currentTab == 1 && this.data.loadTextIndx2 == 0) {
      console.log('刷新已支付');
      this.getOrderPay();
    }
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      currentTab: e.currentTarget.id
    });
  },
  move: function () {
    var len = this.data.orderNoPay.length;
    for (var j = 0; j < len; j++) {
      var nowTimestamp = this.data.serverTime;
      var overTime = config.payTimeOutTime;
      var num = overTime - (nowTimestamp - parseInt(this.data.orderNoPay[j].create_time));
      if (num <= 0 || this.data.orderNoPay[j].status == 5) {
        var param1 = {};
        var str1 = "orderNoPay[" + j + "].status";
        param1[str1] = 5;
        this.setData(param1);
        continue;
      }
      var M = '' + Math.abs(parseInt(num / 60 % 60));
      var S = '' + Math.abs(parseInt(num % 60));
      if (M.length < 2) {
        M = '0' + M
      }
      if (S.length < 2) {
        S = '0' + S
      }
      var newData = this.data.orderNoPay[j];
      var self = this;
      if (M == 0 && S == 1) {
        setTimeout(function () {
          self.isShowRedStatus();
        }, 1500)
      }
      newData.timer = '支付倒计时 ' + M + ':' + S
      var param = {};
      var str = "orderNoPay[" + j + "]";
      param[str] = newData;
      this.setData(param);
    }
    this.setData({ serverTime: nowTimestamp + 1 });
  },

  gotoReappointment: function (e) {
    var orderInfo = JSON.stringify(e.currentTarget.dataset.order_info);
    wx.navigateTo({ url: '/page/room/index?enterType=1&orderInfo=' + orderInfo });
  },
  gotoRoom: function (e) {
    var orderInfo = JSON.stringify(e.currentTarget.dataset.order_info);
    wx.navigateTo({ url: '/page/room/index?orderType=2&orderInfo=' + orderInfo })
  },
  //获取待支付订单
  getOrderNoPay: function () {
    var token = common.getToken();
    var user_sn = common.getUserSn();
    var that = this;
    that.setData({ hidden: false });
    wx.request({
      url: api.getOrderList + "?page=" + page1,
      data: {
        token: token,
        user_sn: user_sn,
        status_list: '0,5',
        page: page1,
        type:1
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          var myOrderNoPay = [];
          var mydata = res.data.data.data;
          console.log(mydata)
          that.setData({ serverTime: res.data.data.time });
          var nowTimestamp = that.data.serverTime;
          var len = mydata.length;
          if (len == 10) {
            page1++;
          } else {
            that.setData({ hidden: true, loadTextIndx1: 1 });
          }

          for (var i = 0; i < len; i++) {
            // mydata[i].image = config.imageUrl + mydata[i].image;
            mydata[i].image = mydata[i].image;
            mydata[i].date = new Date(parseInt(mydata[i].reserve_time) * 1000).toLocaleString().replace('上午8:00:00', '');
            mydata[i].order_time = that.formatDate(parseInt(mydata[i].create_time) * 1000);
            var overTime = config.payTimeOutTime;
            var num = overTime - (nowTimestamp - parseInt(mydata[i].create_time));
            mydata[i].pay_time_num = num;
            if (num <= 0 || mydata[i].status == 5) {
              mydata[i].status = 5;
              myOrderNoPay.push(mydata[i]);
              continue;
            }
            var M = '' + Math.abs(parseInt(num / 60 % 60));
            var S = '' + Math.abs(parseInt(num % 60));
            if (M.length < 2) {
              M = '0' + M
            }
            if (S.length < 2) {
              S = '0' + S
            }
            mydata[i].timer = '支付倒计时 ' + M + ':' + S;
            myOrderNoPay.push(mydata[i]);
          }
          var newData = that.data.orderNoPay.concat(myOrderNoPay);
          that.setData({
            serverTime: nowTimestamp + 1,
            orderNoPay: newData,
            hidden: true
          });
          timeTask = setInterval(that.move, 1000);
        } else {
          common.errMsg(res.data);
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  //获取已支付的订单 0:未支付，1:已预约，2:使用中，3:已完成，4:已退款，5:已作废,6.已过期
  getOrderPay: function () {
    var token = common.getToken();
    var user_sn = common.getUserSn();
    var that = this;
    that.setData({ hidden: false });
    wx.request({
      url: api.getOrderList + "?page=" + page2,
      data: {
        token: token,
        user_sn: user_sn,
        status_list: '1,2,3,6,7',
        type: 2        
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
          console.log(res);
          return;
        if (res.data.code == 0) {
          var myOrderPay = [];
          var mydata = res.data.data.items;
          var nowTimestamp = that.data.serverTime;
          var len = mydata.length;
          // console.log(mydata);
          if (len == 10) {
            page2++;
          } else {
            that.setData({ hidden: true, loadTextIndx2: 1 });
          }
          for (var i = 0; i < len; i++) {
            // mydata[i].image = config.imageUrl + mydata[i].image;
            mydata[i].image = mydata[i].image;
            mydata[i].date = new Date(parseInt(mydata[i].reserve_time) * 1000).toLocaleString().replace('上午8:00:00', '');
            mydata[i].order_time = that.formatDate(parseInt(mydata[i].create_time) * 1000);
            // if (parseInt(mydata[i].status) == 1 || parseInt(mydata[i].status) == 2) {
            //   myOrderPay.push(that.checkOrderIsTimeOut(mydata[i]));
            // }
            // if (parseInt(mydata[i].status) == 3) {
            //   myOrderPay.push(mydata[i]);
            // }
            myOrderPay.push(mydata[i])
          }
          // console.log(myOrderPay);
          var newData = that.data.orderPay.concat(myOrderPay);
          that.setData({
            orderPay: newData,
            hidden: true
          });
        } else {
          common.errMsg(res.data);
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  //支付订单
  gotoPay: function (e) {
    var that = this;
    var orderInfo = e.currentTarget.dataset.order_info;
    common.pay(this, orderInfo.order_sn, function (payRet) {
      if (payRet.code == 0) {
        common.showMsg("温馨提示", "预约成功！可提前五分钟扫码进场，祝你观影愉快", function () {
          that.setData({ orderNoPay: [], orderPay: [] });
          that.onShow();
        });

      } else if (payRet.code == 1) {
        ommon.showMsg('错误提示', payRet.msg);
      } else if (payRet.code == 2) {
        common.showMsg('温馨提示', "请及时支付，超过支付时间，该订单将失效！");
      } else {
        common.showMsg('错误提示', "未知支付错误");
      }
    });
  },

  //检查已支付的订单但是没有观看的订单是否过期
  checkOrderIsTimeOut: function (order) {
    var nowTimestamp = Date.parse(new Date()) / 1000;
    var duration_end_time = parseInt(order.reserve_time) - 8 * 60 * 60 + parseInt(order.end_time) * 60;
    if (parseInt(order.begin_time) > parseInt(order.end_time)) {
      duration_end_time = duration_end_time + 24 * 60 * 60;
    }
    if (nowTimestamp >= duration_end_time) {
      if (parseInt(order.status) == 1) {
        order.status = 6;
      }
      if (parseInt(order.status) == 2) {
        order.status = 3;
      }
    }
    return order;
  },
  //时间戳转 string
  formatDate: function (ns) {
    var d = new Date(ns);
    var dformat = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')
      + ' ' + [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');
    return dformat;
  },
  delOrder: function (e) {
    var that = this;
    var order_sn = e.currentTarget.dataset.order_sn;
    var token = common.getToken();
    common.showMsg('温馨提示', '是否确定删除该订单？', function () {
      that.setData({ hidden: false });
      wx.request({
        url: api.userDeleteOrder,
        data: {
          token: token,
          order_sn: order_sn
        },
        method: 'GET',
        success: function (res) {
          if (res.data.code == 0) {
            common.showMsg('温馨提示', '删除订单成功', function () {
              that.refreshOrder();
            });
          } else {
            common.errMsg(res.data);
          }
        },
        fail: function (res) {
          common.errMsg(res.data);
        },
        complete: function (res) {
          that.setData({ hidden: true });
        }
      })

    }, function () {
      that.setData({ hidden: true });
    });


  },
    //   取消支付
    closeOrder: function(e){
        var that = this;
        var order_sn = e.currentTarget.dataset.order_info.order_sn;
        var token = common.getToken();
        common.showMsg('温馨提示', '是否取消支付该订单？', function () {
            that.setData({ hidden: false });
            wx.request({
                url: api.userDeleteOrder,
                data: {
                    token: token,
                    order_sn: order_sn,
                    type:1
                },
                method: 'GET',
                success: function (res) {
                    if (res.data.code == 0) {
                        common.showMsg('温馨提示', '取消成功', function () {
                            that.refreshOrder();
                        });
                    } else {
                        common.errMsg(res.data);
                    }
                },
                fail: function (res) {
                    common.errMsg(res.data);
                },
                complete: function (res) {
                    that.setData({ hidden: true });
                }
            })
        }, function () {
            that.setData({ hidden: true });
        });
    },
  goOrder: function (e) {
    var that = this;
    wx.showToast({
      title: '加载中',
      mask: true,
      icon: 'loading',
      duration: 2000
    })
    var orderInfo = e.currentTarget.dataset.order_info;
    app.globalData.msgToOrderInfo = orderInfo;
    wx.navigateTo({
      url: '/page/order/index?page=myOrder',
      success: function () {
        // that.setData({hidden:true});
        console.log(1);
      },
      fail: function () {
        console.log(2);
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    });
  },
  refreshOrder() {
    if (this.data.currentTab == 0) {
      clearInterval(timeTask);
      this.setData({ orderNoPay: [], loadTextIndx1:0 });
      page1 = 1;
      this.data.orderNoPay = [];
      this.getOrderNoPay();
    }
    if (this.data.currentTab == 1) {
      this.setData({ orderPay: [], loadTextIndx2:0 });
      page2 = 1;
      this.data.orderPay = [];
      this.getOrderPay();
    }
  },
  isShowRedStatus: function () {
    var self = this;
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
          self.setData({
            isShowRed: app.globalData.isShowRed
          });
        } else {
          common.errMsg(res.data)
        }
      },
      complete: function () {

      }
    })
  },
  //退单
  refundOrder: function (e) {
    // console.log(e);return;
    var that = this;
    var orderInfo = e.currentTarget.dataset.order_info;
    var reserve_time = parseInt(orderInfo.reserve_time) - 8 * 60 * 60 + parseInt(orderInfo.begin_time) * 60;
    var diff = reserve_time - Date.parse(new Date()) / 1000;
    if (diff < 0) {
      common.showMsg('温馨提示', "您预约的电影时段已经开始，不能取消预约");
      return;
    }
    if (diff < config.orderRefundTimeOut) {
      wx.showModal({
        title: '温馨提示',
        content: '电影开始前5小时内取消预约将扣除预约金额10%的手续费，是否确认取消预约？',
        showCancel:true,
        confirmText:"继续使用",
        confirmColor:"#1AAD19",
        cancelText:"取消预约",
        cancelColor:"#a9a9a9",
        success: function (res) {
          if (res.confirm) {
            // console.log('用户点击确定')
          } else if (res.cancel) {
            that.requestRefundOrder(orderInfo);
          }
        }
      })
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '是否确认取消预约？',
        showCancel: true,
        confirmText: "继续使用",
        confirmColor: "#1AAD19",
        cancelText: "取消预约",
        cancelColor: "#a9a9a9",
        success: function (res) {
          if (res.confirm) {
            // console.log('用户点击确定')
          } else if (res.cancel) {
            that.requestRefundOrder(orderInfo);
          }
        }
      })
    }
  },
  //发起退单请求
  requestRefundOrder: function (orderInfo) {
    var that = this;
    that.setData({ hidden: false });
    wx.request({
      url: api.refundOrder,
      data: {
        order_sn: orderInfo.order_sn,
        token: common.getToken()
      },
      success: function (res) {
        if (res.data.code == 0) {
          common.showMsg("温馨提示", "退单成功，预约金额会24小时内返回到您的微信中，请注意查收", function () {
            that.refreshOrder();
          });
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {

      },
      complete: function () {
        that.setData({ hidden: true });
      }
    })
  }
});