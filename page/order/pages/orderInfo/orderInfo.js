// page/order/pages/orderInfo/orderInfo.js
var app = getApp();
var config = require('../../../../config').config;
const common = require('../../../common/js/common.js');
const api = require('../../../../config').api;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderInfo:null,
        sendTypeArr:[
            {
                name : "店家配送",
                checked: true
            },
            {
                name: "门店自取",
                checked: false
            }
        ],
        goodsTotalPrice:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        var orderInfo = app.globalData.checkOrderInfo;
        self.setData({
            orderInfo: orderInfo
        });
        console.log(orderInfo);
        // var goodsTotalPrice = 0;
        // if (orderInfo.order_goods.length > 0){
        //     for (var q = 0; q < orderInfo.order_goods.length;q++){
        //         goodsTotalPrice = goodsTotalPrice + Number(orderInfo.order_goods[q].total_price)
        //     }
        //     // 计算所有商品价格
        //     self.setData({
        //         goodsTotalPrice: goodsTotalPrice
        //     })
        // };
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
    // 评论
    gotoReviews() {
        wx.showToast({
            title: '加载中',
            mask: true,
            icon: 'loading',
            duration: 2000
        })
        wx.navigateTo({
            url: '/page/order/pages/reviews/reviews?orderInfo=' + JSON.stringify(this.data.orderInfo)
        });
    },
    //退单
    refundOrder: function (e) {
        var self = this;
        // var orderInfo = e.currentTarget.dataset.order_info;
        var orderInfo = self.data.orderInfo;
        var reserve_time = parseInt(orderInfo.reserve_time) - 8 * 60 * 60 + parseInt(orderInfo.begin_time) * 60;
        var diff = reserve_time - Date.parse(new Date()) / 1000;
        if (diff < 0) {
            common.showMsg('温馨提示', "您预约的电影时段已经开始，不能取消订单");
            return;
        }
        if (diff < config.orderRefundTimeOut) {
            wx.showModal({
                title: '温馨提示',
                content: '电影开始前5小时内取消订单将扣除预约金额10%的手续费，是否确认取消订单？',
                showCancel: true,
                confirmText: "继续使用",
                confirmColor: "#1AAD19",
                cancelText: "取消订单",
                cancelColor: "#a9a9a9",
                success: function (res) {
                    if (res.confirm) {
                        // console.log('用户点击确定')
                    } else if (res.cancel) {
                        self.requestRefundOrder(orderInfo);
                    }
                }
            })
        } else {
            wx.showModal({
                title: '温馨提示',
                content: '是否确认取消订单？',
                showCancel: true,
                confirmText: "继续使用",
                confirmColor: "#1AAD19",
                cancelText: "取消订单",
                cancelColor: "#a9a9a9",
                success: function (res) {
                    if (res.confirm) {
                        // console.log('用户点击确定')
                    } else if (res.cancel) {
                        self.requestRefundOrder(orderInfo);
                    }
                }
            })
        }
    },

    //发起退单请求
    requestRefundOrder: function (orderInfo) {
        var self = this;
        self.setData({ hidden: false });
        wx.request({
            url: api.refundOrder,
            data: {
                order_sn: orderInfo.order_sn,
                token: common.getToken()
            },
            success: function (res) {
                if (res.data.code == 0) {
                    common.showMsg("温馨提示", "退单成功，订单金额会24小时内返回到您的微信中，请注意查收", function () {
                        wx.navigateBack({ url: '/page/order/pages/fullorder/fullorder'});
                    });
                } else {
                    common.errMsg(res.data);
                }
            },
            fail: function () {

            },
            complete: function () {
                self.setData({ hidden: true });
            }
        })
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