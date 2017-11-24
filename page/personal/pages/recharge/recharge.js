var api = require('../../../../config').api;
var app = getApp();
const common = require('../../../common/js/common.js');
Page({
  data:{
    priceList:[
      {
        price:50,
        selling_price:40
      },
      {
        price:100,
        selling_price:80
      },
      {
        price:150,
        selling_price:120
      },
      {
        price:200,
        selling_price:160
      },
      {
        price:300,
        selling_price:200
      }
    ],
    toalPrice:0.00,
    chooseIndex: 1,
    price: 1
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    this.getTotalPrice();
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  choosePrice:function(event){
    var idx = event.currentTarget.dataset.idx;
    this.setData({chooseIndex:idx});
  },
  pay:function(){
    var self = this;
    wx.request({
      url: api.createOrder,
      header:{
          "Content-Type":"application/json"
      },
      data: {
        price: this.data.price
      },
      success: function(res) {
        var data = res.data;
        if(data.code === 0){
          self.setData({
              price:res.data.data.price,
              order_sn:res.data.data.re_order_sn,
          });
          common.pay(self,res.data.data.re_order_sn,function(payRet){
              if(payRet.code == 0){
                common.showMsg("温馨提示","充值成功！");
              }
          });
        }else{
          common.errMsg(res.data);
        }
      }
    });
  },
  getTotalPrice:function(){
    var that = this;
    common.getUserInfo(function(userInfo){
        if(userInfo.total_price != ''){
          that.setData({toalPrice:userInfo.total_price});
        }
    });
  }
})