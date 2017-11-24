// page/order/pages/goodsInfo/goodsInfo.js
// page/merchandiseOrder/merchandiseOrder.js
const api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        type : 2,
        fromPage : "",
        items: [
            { name: 1, value: '店家配送', checked: 'true' },
            // { name: 2, value: '前台自取' },
        ],
        goodsInfo:null,
        myCoupon:0, //优惠价格
        allPrice:0,
        forbid:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        var type = options.type;
        var fromPage = options.fromPage;
        var goodsInfo = app.globalData.goodsInfo;
        console.log(goodsInfo);
        var allPrice = 0;
        console.log(goodsInfo.order_goods);
        if (goodsInfo.order_goods.length > 0){
            for (var q = 0; q < goodsInfo.order_goods.length; q++) {
                allPrice = (allPrice*1000 + Number(goodsInfo.order_goods[q].price) * Number(goodsInfo.order_goods[q].total_amount)*1000) / 1000
            }
            self.setData({
                allPrice: allPrice
            });
            console.log(self.data.allPrice);
        }
        var nowTime = new Date().setHours(0, 0, 0, 0) / 1000 + 8 * 60 * 60;
        if (Number(goodsInfo.ft_order.reserve_time) == nowTime){
          var date = new Date();
          console.log(date.getHours());
          console.log(date.getMinutes());
          var nowGetSeconds = Number(date.getHours()) * 60 + Number(date.getMinutes());
          if (nowGetSeconds > Number(goodsInfo.ft_order.info.begin_time)){
            goodsInfo.ft_order.showReBtn = false;
          }else{
            goodsInfo.ft_order.showReBtn = true;
          }
        } else if (Number(goodsInfo.ft_order.reserve_time) < nowTime){
          goodsInfo.ft_order.showReBtn = false;
        }else{
          goodsInfo.ft_order.showReBtn = true;
        }
        
        self.setData({
            fromPage: fromPage,
            type:type,
            goodsInfo: goodsInfo
        });
    },

    // 商品单申请退单
    refundGoodsOrder: function () {
        var self = this;
        var goodsInfo = self.data.goodsInfo;
        var data = {
          o_sn: goodsInfo.o_sn,
          type: 1,
          store_sn: goodsInfo.ft_order.store_sn,
          user_sn: goodsInfo.ft_order.user_sn,
          go_sn: goodsInfo.ft_order.go_sn,
          token: common.getToken()
        }
        common.showMsg('温馨提示', '申请退单后，请等待店家确认', function () {
          wx.request({
            url: api.storeRefundOrder,
            data: data,
            method: 'POST',
            success: function (res) {
              if (res.data.code == 0) {
                common.showMsg('温馨提示', '申请退单中，等待商家同意退单!', function () {
                  wx.navigateBack({})
                });
              } else {
                common.errMsg(res.data);
              }
            },
            fail: function (res) {
              common.errMsg(res.data);
            },
            complete: function (res) {
              self.setData({ hidden: true });
              self.setData({
                forbid: false
              })
            }
          })
        }, function () {
          self.setData({ hidden: true });
        });
        

    },

    // 撤销退单
    refundRollback: function () {
      var self = this;
      self.setData({
        forbid : true
      })
      var goodsInfo = self.data.goodsInfo;
      var rfo_sn = "";
      for (var q = 0; q < goodsInfo.refund_order.length;q++){
        if (goodsInfo.refund_order[q].status == 1){
          rfo_sn = goodsInfo.refund_order[q].rfo_sn
        }
      }
      if (!rfo_sn){
        rfo_sn = goodsInfo.refund_order[0].rfo_sn
      }
      var data = {
        user_sn: goodsInfo.ft_order.user_sn,
        o_sn: goodsInfo.o_sn,
        rfo_sn: rfo_sn,
        token: common.getToken()
      };
      wx.request({
        url: api.goodsRefundRollback,
        data: data,
        method: 'POST',
        success: function (res) {
          if (res.data.code == 0) {
            common.showMsg('温馨提示', '撤销退单成功！', function () {
              wx.navigateBack({})
            });
          } else {
            common.errMsg(res.data);
          }
        },
        fail: function (res) {
          common.errMsg(res.data);
        },
        complete: function (res) {
          self.setData({ hidden: true });
          self.setData({
            forbid: false
          })
        }
      })
    },

        /**
         *      * 生命周期函数--监听页面初次渲染完成
         */

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
    
    }
})