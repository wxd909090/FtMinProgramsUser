var app = getApp();
var config = require('../../../../config').config;
const common = require('../../../common/js/common.js');
const api = require('../../../../config').api;
Page({

  data: {
    orderInfo:{},
    info: '',
    movieInfo:"",
    healthStarNum: 0,
    avStarNum : 0,
    comfyStarNum : 0,
    hidden: false,
    placeHolderText: "为了为您提供更好的体验,欢迎您评价！",
    placeHolderText2: "请输入想看的电影！",
    reviews_star0_src: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/reviews_star0.png",
    reviews_star1_src: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/reviews_star1.png",
    alertShow: false,
    disabled:false,
  },

  onLoad: function (options) {
    var orderInfo = options.orderInfo;
    if(orderInfo != null){
      orderInfo = JSON.parse(orderInfo);
      this.setData({orderInfo:orderInfo});
    }
    console.log(orderInfo);
  },
  onReady: function () {
  
  },

  onShow: function () {
    
  },

  onHide: function () {
      app.globalData.reviews = null;
  },

  onUnload: function () {
      app.globalData.reviews = null;
  },

  onPullDownRefresh: function () {
  
  },

  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
  
  },
  reviews:function(){
    var that = this;
    var health = that.data.healthStarNum;
    var av = that.data.avStarNum;
    var comfy = that.data.comfyStarNum;
    if(health == 0){
      common.showMsg("温馨提示","请评价卫生清洁");
      return;
    }
    if (av == 0) {
      common.showMsg("温馨提示", "请评价影音效果");
      return;
    }
    if (comfy == 0) {
      common.showMsg("温馨提示", "请评价舒适度");
      return;
    } 
    var info = that.data.info;
    if (info.trim() == ""){
      common.showMsg("温馨提示", "请输入评论信息！");
      return;
    }
    var want_film = that.data.movieInfo;
    var orderInfo = that.data.orderInfo;
    var data = {
      token: common.getToken(),
      order_sn: orderInfo.order_sn,
      store_sn: orderInfo.store_sn,
      user_sn: orderInfo.user_sn,
      room_name: orderInfo.room_name,
      store_name: orderInfo.store_name,
      film_name: orderInfo.film_name,
      health: health,
      av: av,
      comfy: comfy,
      mobile: orderInfo.mobile,
      info: info,
      want_film: want_film
    };
    console.log(data);
    common.getWxUserInfo(function (wxUserInfo){
      data.nick_name = wxUserInfo.nickName;
      wx.request({
        url: api.createReviews,
        data: data,
        method: 'POST',
        success: function (re) {
          if (re.data.code == 0) {
            app.globalData.reviews = data;
            that.setData({
              alertShow : true,
              placeHolderText:"",
              placeHolderText2:"",
              reviewsInfo:""
            });
            wx.pageScrollTo({
              scrollTop: 0
            });
            setTimeout(function(){
              that.closeAlert();
            },3000)
            that.setData({
              disabled : true,
            })
          } else {
            common.errMsg(re.data)
          }

        },
        fail: function () {

        },
        complete: function () {

        }
      })
    });

  },
  clickHealth:function(option){
    var self = this;
    self.setData({ healthStarNum: option.currentTarget.dataset.starnum });
  },
  clickAv: function (option) {
    var self = this;
    self.setData({ avStarNum: option.currentTarget.dataset.starnum });
  },
  clickComfy: function (option) {
    var self = this;
    self.setData({ comfyStarNum: option.currentTarget.dataset.starnum });
  },
  confirmInfo: function(option) {
    var self = this;
    self.setData({ info: option.detail.value });
    self.setData({ placeHolderText: "" });
  },
  confirmMovieInfo: function (option){
    var self = this;
    self.setData({ movieInfo: option.detail.value });
    self.setData({ placeHolderText2: "" });
  },
  closeAlert: function () {
    var self = this;
    wx.navigateBack({
      url: '/page/order/index',
      success: function () {
        // that.setData({hidden:true});
      },
      complete: function () {
        // that.setData({hidden:false});
      }
    });
  }
})