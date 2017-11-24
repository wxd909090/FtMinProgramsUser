var app = getApp();
const api = require('../../../config').api;
const conf = require('../../../config').config;
const common = require('../../common/js/common.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        store_sn : "",
        roomList:[],
        baseUrl:"",
        fromPage:""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        if (options.fromPage){
            self.setData({
                fromPage: options.fromPage
            })
        }
        // var self = this;
        // self.setData({
        //     store_sn: app.globalData.storeInfo.store_sn
        // });
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
        if (self.data.fromPage == "merchandiseOrder"){
            self.setData({
                store_sn: app.globalData.choosedGoodsStore.store_sn
            });
        }else{
            self.setData({
                store_sn: app.globalData.storeInfo.store_sn
            });
        }
       self. getStoreRoomList()
    },
    getStoreRoomList:function(){
        var self = this;
        var data = {
            store_sn: self.data.store_sn
        };
        wx.request({
            url: api.getStoreRoomList,
            data: data,
            success: function (res) {
                if (res.data.code == 0) {
                    self.setData({
                        roomList: res.data.data.room_list,
                        baseUrl: res.data.data.baseUrl
                    });
                } else {
                    common.errMsg(res.data);
                }
            },
            fail: function () { },
            complete: function () { }
        })
    },

    // 房间信息
    goToRoomInfo: function (event){
        var self = this;
        if (self.data.fromPage == "merchandiseOrder"){
            var roomInfo = event.currentTarget.dataset.room;
            app.globalData.choosedSendRoom = roomInfo;
            wx.navigateBack({ url: '/page/order/pages/merchandiseOrder/merchandiseOrder'});
        }else{
            var roomInfo = event.currentTarget.dataset.room;
            app.globalData.chooseRoomInfo = roomInfo;
            app.globalData.chooseRoomInfo.store_sn = self.data.store_sn;
            app.globalData.roomInfo = null;
            wx.redirectTo({ url: '/page/room/index' });
        }
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