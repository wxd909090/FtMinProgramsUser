// page/order/pages/orderComplete/orderComplete.js
var app = getApp();
var config = require('../../../../config').config;
const common = require('../../../common/js/common.js');
const api = require('../../../../config').api;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        payType : "1",
        payPrice:"0.00",
        orderInfo:null
    },
   
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
       console.log(options)
        var self =this;
        self.setData({
            payType: options.payType,
            payPrice: options.price,
        });
        if (options.orderInfo){
            self.setData({
                orderInfo: JSON.parse(options.orderInfo)
            });
        };
        console.log(self.data.orderInfo);
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

    // 查看订单
    checkOrder : function() {
      if (this.data.orderInfo){
        var orderInfo = this.data.orderInfo;
        orderInfo.status = 1;
        if (this.data.payType == "1") {
          orderInfo.pay_type = 1
        } else {
          orderInfo.pay_type = 2
        }
        orderInfo.pay_price = this.data.payPrice;
      }else{

      }
       
        // wx.navigateTo({
        //     url: '/page/order/pages/myOrder/myOrder?orderType=2',
        //     success: function () {
        //         // that.setData({hidden:true});
        //         console.log(1);
        //     },
        //     fail: function () {
        //         console.log(2);
        //     },
        // })
        wx.redirectTo({ url: '/page/order/pages/fullorder/fullorder?sign=' + 2 });
    },
    
    // 回到首页
    returnFilm: function(){
        var storeInfo = app.globalData.storeInfo;
        console.log(storeInfo)
        wx.switchTab({ url: "/page/film/index" });
    },

    // 购买商品
    buyGoods:function(){
        var self = this;
        var storeInfo = app.globalData.storeInfo;
        wx.navigateTo({
            url: '/page/store/pages/storeDetail/storeDetail?store_info=' + JSON.stringify(storeInfo),
        })
    }
})