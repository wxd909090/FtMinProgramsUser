// page/merchandiseOrder/merchandiseOrder.js
var app = getApp();
var config = require('../../../../config').config;
const common = require('../../../common/js/common.js');
const api = require('../../../../config').api;
Page({

  /**
   * 页面的初始数据
   */
    data: {
        sign:'',
        currentchecked:0,
        items: [
            { value: '不使用优惠', name: '', checked: 'true' },
        ],
        couponList:[],
        chooseCoupon:null,
        alertShow: false,
        canUse:0,
        discountDisplay:true,
        code:""
    },
    sureButton:function(){
        var self = this;
        var chooseCoupon = self.data.chooseCoupon;
        var Coupon = {
            price: 0,
            type : 1
        };
        if (self.data.sign == 100){
            this.setData({
                chooseCoupon: Coupon
            }) 
        }else{
          this.setData({
            chooseCoupon: self.data.chooseCoupon
          })  
        }
        var chooseCoupon = self.data.chooseCoupon;
        if (chooseCoupon){
            app.globalData.choosedCoupon = chooseCoupon;
        }else{
            app.globalData.choosedCoupon = {
                price : 0,
                type : 1
            };
        }
        if(self.data.sign==100){
          wx.navigateBack({
            url: "/page/order/pages/merchandiseOrder/merchandiseOrder",
          })
        }else{
          wx.navigateBack({
            url: "/page/order/pages/createOrder/createOrder",
          })
        }
    },
    radioChange: function (e) {
        var Coupon={
          price:0,
          type:1
        };
        this.setData({
            currentchecked: '',
            chooseCoupon: Coupon
        }) 
    },
    clickimg: function(e){
        console.log("选中")
        console.log(e.currentTarget.dataset.coupon)
        var coupon = e.currentTarget.dataset.coupon.price;
        if (coupon > this.data.Ordercount){
          this.setData({
            alertShow:true,
          })
        }else{
          this.setData({
            currentchecked: e.currentTarget.dataset.id,
            chooseCoupon: e.currentTarget.dataset.coupon,
            items: [
              { value: '不使用优惠', name: '' },
            ],
          }) 
        }
    },
    closeAlert: function () {
      var self = this;
      this.setData({
        alertShow: false,
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
      this.setData({
        sign: options.sign
      });
      if(this.data.sign==100){
        this.setData({
          discountDisplay:false
        })
      }else{
        this.setData({
          discountDisplay: true
        })
      }
      this.setData({
        Ordercount: options.Ordercount
      });
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
        self.getCouponList();
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
    getCouponList: function () {
        var self = this;
        common.getUserInfo(function (userInfo) {
            wx.request({
                url: api.getCoupon,
                data: {
                    token: common.getToken()
                },
                success: function (res) {
                    if (res.data.code == 0) {
                        if (res.data.data.length > 0) {
                            for (var i = 0; i < res.data.data.length; i++) {
                                res.data.data[i].price = parseInt(res.data.data[i].price);
                                var date = new Date(parseInt(res.data.data[i].expire_time) * 1000);
                                res.data.data[i].timeString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                            }
                        };
                        self.setData({
                            couponList: res.data.data
                        });
                        if (Number(app.globalData.choosedCoupon.price) != 0){
                            var currentchecked = app.globalData.choosedCoupon.id;
                            self.setData({
                                currentchecked: currentchecked,
                                chooseCoupon: app.globalData.choosedCoupon,
                                items: [
                                    { value: '不使用优惠', name: '' },
                                ],
                            });
                        }
                        var canUse = 0;
                        var couponList = self.data.couponList;
                        for (var x = 0; x < couponList.length;x++){
                            if (Number(couponList[x].is_used) == 0){
                                canUse += 1
                            }
                        }
                        self.setData({
                            canUse: canUse
                        })
                    } else {
                        common.errMsg(res.data);
                    }
                },
                complete: function () {
                    self.setData({ loading: false });
                }
            })
        })
    },

    // 获取兑换码
    getCode: function (e) {
        var self = this;
        var code = e.detail.value;
        self.setData({
            code: code
        })
    },
    // 兑换
    Exchange: function () {
        var self = this;
        var data = {
            code: self.data.code,
            token: common.getToken(),
            user_sn: common.getUserSn(),
        }
        wx.request({
            url: api.codeExchangeCoupon,
            data: data,
            success: function (res) {
                if (res.data.code == 0) {
                    common.showMsg('温馨提示', "兑换抵用券成功！", function () {
                        self.setData({
                            code: ""
                        })
                        self.getCouponList();
                    });
                }else if (res.data.code == 1001) {
                    common.showMsg('温馨提示', "您的团购码必须是数字!", function () {
                    });
                } else {
                    common.errMsg(res.data);
                }
            },
            complete: function () {
                self.setData({ loading: false });
            }
        })
    },
})