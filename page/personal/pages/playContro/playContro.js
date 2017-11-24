// playContro.js
var api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_sn : "",
    film_name : "",
    image: "/image/play_ctrl_default.jpg",
    bg_image: "/image/play_ctrl_default.jpg",
    play_ctl : 0,
    light_ctl : 0,
    volume : 1,
    hidden : true,
    timer : null,
    orderInfo : null,
    reviews_ctl : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    var order_sn = options.order_sn;
    self.setData({ order_sn: order_sn });
    // 拉取电影海报及电影名字
    self.getPlayingFiml(order_sn);
    setTimeout(function(){
      // 获取投影仪状态
      self.setData({ hidden: false })
      self.getEquStatus();
    },1000)
    
    console.log("onload")
    // 获取是否选择连场的提示
    self.getFilmSeriesPlay();
    // 获取订单信息
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
    // self.getOrderPay(self.data.order_sn);
    self.getPlayingFiml(self.data.order_sn);
    // 定时拉取投影仪状态
    var timer = setInterval(function () {
      if (self.data.play_ctl == 0 || self.data.play_ctl == 3) {
        self.getEquStatus()
      } else {
        clearInterval(timer);
        setTimeout(function () {
          self.getEquStatus();
        }, 8000)
      }
    }, 5000);
    self.setData({
      timer: timer
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var that = this;
    clearInterval(that.data.timer)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this;
    clearInterval(that.data.timer)
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
  // 获取订单信息
  getOrderPay: function (order_sn) {
    var self = this;
    var token = common.getToken();
    var user_sn = common.getUserSn();
    wx.request({
      url: api.getPlayingOrderList,
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
          var data = res.data.data;
        //   for (var i = 0; i < data.length; i++) {
        //     if (data[i].order_sn == self.data.order_sn) {
        //       self.setData({ film_name: data[i].film_name });
        //       self.setData({ image: data[i].image });
        //       self.setData({ bg_image: 'url(' + data[i].image + ')' });
        //     }
        //   };
        //   var orderInfo = res.data.data.items[0];
            if (data.order_sn == self.data.order_sn){
                self.setData({ film_name: data.film_name });
                self.setData({ image: data.image });
                self.setData({ bg_image: 'url(' + data.image + ')' });
            }
            var orderInfo = res.data.data;
          self.setData({
            orderInfo: orderInfo
          });
          if (!orderInfo.reviews){
            self.setData({
              reviews_ctl : 1
            })
          }else{
            self.setData({
              reviews_ctl: 0
            })
          }
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
  },

  // 获得正在播放的电影
  getEquStatus: function () {
    var that = this;
    if (!that.data.order_sn){
      return;
    };

    wx.request({
      url: api.getEquStatus,
      data: {
        order_sn: that.data.order_sn
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log("playCtrl" + res.data.data.playStatus + "-" + res.data.data.lightStatus + "-" + res.data.data.volume)
        if (res.data.code == 0) {
          that.setData({ play_ctl: res.data.data.playStatus })
          that.setData({ light_ctl: res.data.data.lightStatus })
          that.setData({ volume: (res.data.data.volume * 25 / 4) });
          that.setData({ hidden: true });
        } else {
          // 当服务器出现异常停掉定时器
          if (that.data.timer){
            clearInterval(that.data.timer);
          }
          // 打印错误信息
          common.errMsg(res.data);
        }
      },
      complete: function () {
        that.setData({ hidden: true });
      }
    })
  },
  //获得是否连场提示
  getFilmSeriesPlay : function () {
    var that = this;
    if (!that.data.order_sn) {
      return;
    }
    wx.request({
      url: api.getFilmSeriesPlay,
      data: {
        order_sn: that.data.order_sn
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if(res.data.code == 0){
          wx.showModal({
            title: '确认连场',
            content: '确认连场，第一部电影播放完后立即会播放下一场，中途不再有等待时间。',
            showCancel: true,
            cancelColor: "#A9A9A9",
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
              if (res.confirm) {
                that.setFilmSeriesPlay()
              } else if (res.cancel) {
                console.log("设置不连场！")
              }
            }
          })
        }else{
          console.log("无法连场，无提示框！")
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  //设置是否连场
  setFilmSeriesPlay : function () {
    var that = this;
    if (!that.data.order_sn) {
      return;
    }
    wx.request({
      url: api.setFilmSeriesPlay,
      data: {
        order_sn: that.data.order_sn
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          console.log(res)
        } else {
          common.errMsg(res.data)
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  // 点击播放控制
  clickPlay: function (event) {
    var self = this;
    self.setData({ hidden: false });
    if (event.currentTarget.dataset.status == 1){
      var data = {
        order_sn: self.data.order_sn,
        play_ctl:2
      }
      self.setEquStatusPlay(data);
    }else{
      var data = {
        order_sn: self.data.order_sn,
        play_ctl: 1
      };
      self.setEquStatusPlay(data);
    }
  },
  // 在广告和投影未播放状态下提示
  forbidPlay : function (event) {
    var slef = this;
    if (event.currentTarget.dataset.status == 0){
      common.showMsg("温馨提示", "当前电影还未开始播放或者播放完成，无法操作！");
    }else{
      common.showMsg("温馨提示", "播放广告无法暂停，请在广告播放完成之后操作！");
    }
  },
  setEquStatusPlay: function(data) {
    var self = this;
    wx.request({
      url: api.setEquStatus,
      data: data,
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({
            play_ctl: res.data.data.playStatus,
            light_ctl: res.data.data.lightStatus
          })
        } else {
          common.errMsg(res.data)
        }
      },
      complete: function () {
        // that.setData({hidden:true});
        self.setData({ hidden: true });
      }
    })
  },
  // 点击灯光控制
  clickLight: function (event) {
    var self = this;
    self.setData({ hidden: false });
    if (event.currentTarget.dataset.status == 1) {
      var data = {
        order_sn: self.data.order_sn,
        light_ctl: 2
      }
      self.setEquStatusLight(data);
    } else {
      var data = {
        order_sn: self.data.order_sn,
        light_ctl: 1
      }
      self.setEquStatusLight(data);
    }
  },
  setEquStatusLight: function (data) {
    var self = this;
    wx.request({
      url: api.setEquStatus,
      data: data,
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({
            play_ctl: res.data.data.playStatus,
            light_ctl: res.data.data.lightStatus
          })
        } else {
          common.errMsg(res.data)
        }
      },
      complete: function () {
        self.setData({ hidden: true });
        // that.setData({hidden:true});
      }
    })
  },
  //音量控制
  sliderChange: function (event) {
    var self = this;
    var data = {
      order_sn: self.data.order_sn,
      audio_ctl: Math.ceil(event.detail.value * 4 / 25) + 1
    };
    self.setEquStatusVol(data);
  },
  setEquStatusVol: function (data) {
    var self = this;
    wx.request({
      url: api.setEquStatus,
      data: data,
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
        } else {
          common.errMsg(res.data)
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  // 获得正在播放的电影
  getPlayingFiml: function (order_sn) {
    var token = common.getToken();
    var user_sn = common.getUserSn();
    var self = this;
    if (!token) {
      return;
    }
    wx.request({
      url: api.getPlayingOrderList,
      data: {
        token: token,
        user_sn: user_sn,
        // order_sn: order_sn
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
        //   var data = res.data.data.items;
        //   for (var i = 0; i < data.length; i++) {
        //     if (data[i].order_sn == self.data.order_sn) {
        //       self.setData({ film_name: data[i].film_name });
        //       self.setData({ image: data[i].image });
        //       self.setData({ bg_image: 'url(' + data[i].image + ')' });
        //     }
        //   };
          var data = res.data.data;
          var orderInfo = null;
          for (var q = 0; q < data.length;q++){
            if (data[q].order_sn == self.data.order_sn) {
              self.setData({ film_name: data[q].film_name });
              self.setData({ image: data[q].image });
              self.setData({ bg_image: 'url(' + data[q].image + ')' });
              orderInfo = data[q];
              break;
            }
          };
          self.setData({
            orderInfo: orderInfo
          })
          if (orderInfo){
            if (!orderInfo.reviews) {
              self.setData({
                reviews_ctl: 1
              })
            } else {
              self.setData({
                reviews_ctl: 0
              })
            }
          }
          // var orderInfo = res.data.data;
        } else {
          // common.errMsg(res.data)
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
  clickReviews: function () {
    var self = this;
    var orderInfo = self.data.orderInfo;
    wx.navigateTo({ url: '/page/order/pages/reviews/reviews?page=playContro&orderInfo=' + JSON.stringify(orderInfo)});
  },
  // 获得连场情况下一场电影的order_sn
  getNextFiml: function () {
    var token = common.getToken();
    var user_sn = common.getUserSn();
    var self = this;
    if (!token) {
      return;
    }
    wx.request({
      url: api.getOrderList,
      data: {
        token: token,
        user_sn: user_sn,
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
            // var data = res.data.data.items;
          // 拉取到用户当前播放的order_sn
            var data = res.data.data;
            if (data.order_sn == self.data.order_sn) {
                self.setData({ order_sn: data.order_sn })
                self.setData({ film_name: data.film_name });
                self.setData({ image: data.image });
                self.setData({ bg_image: 'url(' + data.image + ')' });
            }
        //   for (var i = 0; i < data.length; i++) {
        //     if (data[i].order_sn != self.data.order_sn) {
        //       self.setData({ order_sn: data[i].order_sn})
        //       self.setData({ film_name: data[i].film_name });
        //       self.setData({ image: data[i].image });
        //       self.setData({ bg_image: 'url(' + data[i].image + ')' });
        //     }
        //   };
          // 拉取下一场投影仪状态
          self.getEquStatus();
        } else {
          // common.errMsg(res.data)
        }
      },
      complete: function () {
        // that.setData({hidden:true});
      }
    })
  },
})