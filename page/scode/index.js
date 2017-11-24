var api = require('../../config').api;
var app = getApp();
const common = require('../common/js/common.js');
Page({
    data: {
        hidden:true,
        result: '',
        src: '../../image/QR_scanner.png'
    },
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
    },
    onReady: function () {
        // 生命周期函数--监听页面初次渲染完成
    },
    onShow: function () {
        // 生命周期函数--监听页面显示
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
    scanCode: function () {
        if(common.getToken() == null){
            common.showMsg('温馨提示','您还没有登陆，是否立即登陆？',
            function(){
                wx.navigateTo({url:"/page/login/index"});
            },function(){});
            return;
        }
        var self = this
        wx.scanCode({
            success: function (res) {
                // console.log(res);
                self.setData({result: res.result});
                self.openDoor(res.result);
            },
            fail: function (res) {
                // common.showMsg('温馨提示','扫码失败，请重试');
            }
        })
    },
    openDoor: function (room_sn) {
        // console.log(room_sn);
        var that = this;
        that.setData({hidden:false});
        wx.request({
            url: api.openRoom,
            data: {
                room_sn: room_sn,
                token:common.getToken()
            },
            method: 'post',
            success: function (res) {
                if(res.data.code == 0){
                  common.showMsg("开门成功","祝您观影愉快！",function(){
                    console.log("sn" + res.data.data.order_sn)
                    if(res.data.data.order_sn){
                      var order_sn = res.data.data.order_sn;
                      wx.navigateTo({ url: "/page/personal/pages/playContro/playContro?order_sn=" + order_sn });
                    }  
                  });
                }else{
                    common.errMsg(res.data);
                }   
            },
            fail:function(){
                common.showMsg("开房失败","请求开门失败！");
            },
            complete:function(){
                that.setData({hidden:true});
            }
        })
    }
})