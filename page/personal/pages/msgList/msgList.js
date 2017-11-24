// msgList.js
var app = getApp();
var api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgListData:[],
    hidden:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
    onShow: function () {
        var self = this;
        app.globalData.msgToOrderInfo = null;
        var msgInfo = wx.getStorageSync('msgInfo');
        // for (var i = 0; i < msgInfo.length; i++) {
        //   msgInfo[i] = JSON.parse(msgInfo[i])
        // };
        self.setData({
            msgListData: msgInfo
        });
        app.globalData.reviews = null;
    },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  checkMsg: function(event) {
    var self = this;
    var msgInfo = event.currentTarget.dataset.msg;
    var order_sn = msgInfo.data.order_sn;
    var msgAllInfo = wx.getStorageSync('msgInfo')
    console.log(msgInfo);
    console.log(msgAllInfo);
    if (msgAllInfo.length){
      for (var i = 0; i < msgAllInfo.length; i++) {
        if (msgAllInfo[i].data.order_sn == msgInfo.data.order_sn){
          msgAllInfo[i].read = true;
        }
      }
      wx.setStorageSync('msgInfo', msgAllInfo);
    }
    if (msgInfo.redirect == 1){
      self.getOrderPay(order_sn)
    }
  },
  getOrderPay: function (order_sn) {
    var self = this;
    self.setData({
      hidden : false
    })
    var token = common.getToken();
    var user_sn = common.getUserSn();
    var that = this;
    wx.request({
      url: api.getOrderList,
      data: {
        token: token,
        user_sn: user_sn,
        order_sn: order_sn
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({
            hidden: true
          })
          var orderInfo = res.data.data;
          app.globalData.msgToOrderInfo = orderInfo;
          app.globalData.msgToOrderInfo.date = new Date(parseInt(orderInfo.reserve_time) * 1000).toLocaleString().replace('上午8:00:00', '');
          wx.navigateTo({ url: '/page/order/index?page=msgList'});
        } else {
          common.errMsg(res.data);
        }
      },
      complete: function () {
        self.setData({
          hidden: true
        })
        // that.setData({hidden:true});
      }
    })
  }
})