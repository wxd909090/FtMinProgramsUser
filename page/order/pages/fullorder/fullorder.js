const api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var app = getApp();
var config = require('../../../../config').config;
var page1 = 1;
var page2 = 1;
var time_task = "";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //   订单查询条件   turnFlag是1查询未支付的订单，2查询已支付的订单，3查询待评价的订单，4查询所有的订单
      turnFlag:4,
    //   订单列表数据
      orderListaData:[],
      totalPage:1,
      hidden:false,
      nowTime: 0,
      serverTime: 0,
      cancleOrderFlag:true
  },
  /**
   * 生命周期函数--监听页面加载
   */   
    onLoad: function (options) {
        var self = this;
        app.globalData.checkOrderInfo = null;
        app.globalData.createOrderInfo = null;
        var turnFlag = options.sign;
        self.setData({
            turnFlag: turnFlag
        });
        switch (turnFlag) {
            case "1":
                wx.setNavigationBarTitle({
                    title: '待支付订单'
                })
                break;
            case "2":
                wx.setNavigationBarTitle({
                    title: '已支付订单'
                })
                break;
            case "3":
                wx.setNavigationBarTitle({
                    title: '待评价订单'
                })
                break;
            case "4":
                wx.setNavigationBarTitle({
                    title: '全部订单'
                })
                break;
            default:
                wx.setNavigationBarTitle({
                    title: '订单管理'
                })
        };
    },
    // 未支付倒计时
    move : function () {
      var self = this;
      var turnData = self.data.orderListaData;
      if (turnData.length == 0){
        return;
      }
      for (var z = 0; z < turnData.length; z++) {
        if (turnData[z].ft_order) {
          var overTime = config.payGoodsTimeOutTime;
          var num = overTime - (parseInt(new Date().getTime() / 1000) - parseInt(turnData[z].create_time));
          turnData[z].pay_time_num = num;
          if (num <= 0 || turnData[z].newStatus == 5) {
            turnData[z].newStatus = 5;
            continue;
          }
          var M = '' + Math.abs(parseInt(num / 60 % 60));
          var S = '' + Math.abs(parseInt(num % 60));
          if (M.length < 2) {
            M = '0' + M
          }
          if (S.length < 2) {
            S = '0' + S
          }
          turnData[z].timer = '支付倒计时 ' + M + ':' + S;
        } else {
          var overTime = config.payTimeOutTime;
          var num = overTime - (parseInt(new Date().getTime() / 1000) - parseInt(turnData[z].create_time));
          turnData[z].pay_time_num = num;
          if (num <= 0 || turnData[z].newStatus == 5) {
            turnData[z].newStatus = 5;
            continue;
          }
          var M = '' + Math.abs(parseInt(num / 60 % 60));
          var S = '' + Math.abs(parseInt(num % 60));
          if (M.length < 2) {
            M = '0' + M
          }
          if (S.length < 2) {
            S = '0' + S
          }
          turnData[z].timer = '支付倒计时 ' + M + ':' + S;
        }
      };
      self.setData({
        orderListaData: turnData
      });
    },
    //获取订单列表
    getOrderList: function () {
        var self = this;
        var token = common.getToken();
        var user_sn = common.getUserSn();
        self.setData({ hidden: false });
        function turnYMD(input){
            if (input == 0) {
                return ""
            }
            var out = "0";
            input = Number(input);
            out = getLocalTime(input)
            function getLocalTime(time) {
                var date = new Date(parseInt(time) * 1000);
                return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            }
            return out;
        };
        function turnDuration(x,y){
            if(x > 1440){
                x = x - 1440
            };
            if (y > 1440) {
                y = y - 1440
            };

            var start_time = handleTen(parseInt(x / 60)) + ":" + handleTen(parseInt(x % 60));
            var end_time = handleTen(parseInt(y / 60)) + ":" + handleTen(parseInt(y % 60));
            return start_time + "-" + end_time
        };
        function handleTen(x){
            if(Number(x) < 10){
                x = "0" + x
            };
            return x
        }
        wx.request({
            url: api.getOrderList + "?page=" + page1,
            data: {
                token: token,
                user_sn: user_sn,
                page: page1,
                type: Number(self.data.turnFlag)
            },
            method: 'post',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if(res.data.code == 0){
                    // 时间戳转换
                    var turnData =res.data.data.data;
                    console.log(self.data.nowTime);
                    console.log(turnData);
                    for (var z = 0; z < turnData.length;z++){
                      if (turnData[z].ft_order) {
                        var overTime = config.payGoodsTimeOutTime;
                        var num = overTime - (self.data.nowTime - parseInt(turnData[z].create_time));
                        turnData[z].pay_time_num = num;
                        if (num <= 0 || turnData[z].newStatus == 5) {
                          turnData[z].newStatus = 5;
                          continue;
                        }
                        var M = '' + Math.abs(parseInt(num / 60 % 60));
                        var S = '' + Math.abs(parseInt(num % 60));
                        if (M.length < 2) {
                          M = '0' + M
                        }
                        if (S.length < 2) {
                          S = '0' + S
                        }
                        turnData[z].timer = '支付倒计时 ' + M + ':' + S;
                      } else {
                        var overTime = config.payTimeOutTime;
                        var num = overTime - (self.data.nowTime - parseInt(turnData[z].create_time));
                        turnData[z].pay_time_num = num;
                        if (num <= 0 || turnData[z].newStatus == 5) {
                            turnData[z].newStatus = 5;
                            continue;
                        }
                        var M = '' + Math.abs(parseInt(num / 60 % 60));
                        var S = '' + Math.abs(parseInt(num % 60));
                        if (M.length < 2) {
                            M = '0' + M
                        }
                        if (S.length < 2) {
                            S = '0' + S
                        }
                        turnData[z].timer = '支付倒计时 ' + M + ':' + S;
                      }
                    };
                    
                    if (turnData.length > 0){
                        for (var q = 0; q < turnData.length;q++){
                            if (turnData[q].ft_order){
                                turnData[q].ft_order.turnReserve_time = turnYMD(turnData[q].ft_order.reserve_time);
                                turnData[q].ft_order.turnDuration_time = turnDuration(turnData[q].ft_order.info.begin_time, turnData[q].ft_order.info.end_time);
                            }else{
                                turnData[q].turnReserve_time = turnYMD(turnData[q].reserve_time);
                                turnData[q].turnDuration_time = turnDuration(turnData[q].begin_time, turnData[q].end_time);
                            }
                        }
                    }
                    var orderListaData = self.data.orderListaData;
                    orderListaData = orderListaData.concat(res.data.data.data);
                    self.setData({
                        orderListaData: orderListaData,
                        totalPage: res.data.data.total_page
                    });
                    console.log(self.data.orderListaData);
                    if (self.data.turnFlag == 1 || self.data.turnFlag == 4){
                      time_task = setInterval(self.move, 1000);
                    }
                }else{
                    common.errMsg(res.data);
                }
                // if (res.data.code == 0) {
                //     var myOrderNoPay = [];
                //     var mydata = res.data.data.data;
                //     console.log(mydata)
                //     that.setData({ serverTime: res.data.data.time });
                //     var nowTimestamp = that.data.serverTime;
                //     var len = mydata.length;
                //     if (len == 10) {
                //         page1++;
                //     } else {
                //         that.setData({ hidden: true, loadTextIndx1: 1 });
                //     }

                //     for (var i = 0; i < len; i++) {
                //         // mydata[i].image = config.imageUrl + mydata[i].image;
                //         mydata[i].image = mydata[i].image;
                //         mydata[i].date = new Date(parseInt(mydata[i].reserve_time) * 1000).toLocaleString().replace('上午8:00:00', '');
                //         mydata[i].order_time = that.formatDate(parseInt(mydata[i].create_time) * 1000);
                //         var overTime = config.payTimeOutTime;
                //         var num = overTime - (nowTimestamp - parseInt(mydata[i].create_time));
                //         mydata[i].pay_time_num = num;
                //         if (num <= 0 || mydata[i].status == 5) {
                //             mydata[i].status = 5;
                //             myOrderNoPay.push(mydata[i]);
                //             continue;
                //         }
                //         var M = '' + Math.abs(parseInt(num / 60 % 60));
                //         var S = '' + Math.abs(parseInt(num % 60));
                //         if (M.length < 2) {
                //             M = '0' + M
                //         }
                //         if (S.length < 2) {
                //             S = '0' + S
                //         }
                //         mydata[i].timer = '支付倒计时 ' + M + ':' + S;
                //         myOrderNoPay.push(mydata[i]);
                //     }
                //     var newData = that.data.orderNoPay.concat(myOrderNoPay);
                //     that.setData({
                //         serverTime: nowTimestamp + 1,
                //         orderNoPay: newData,
                //         hidden: true
                //     });
                //     timeTask = setInterval(that.move, 1000);
                // } else {
                //     common.errMsg(res.data);
                // }
            },
            complete: function () {
                self.setData({hidden:true});
            }
        })
    },
    // 删除电影订单
    delOrder: function (e) {
        var self = this;
        var order_sn = e.currentTarget.dataset.order_sn;
        var token = common.getToken();
        var index = e.currentTarget.dataset.index;
        common.showMsg('温馨提示', '是否确定删除该订单？', function () {
            self.setData({ hidden: false });
            wx.request({
                url: api.userDeleteOrder,
                data: {
                    token: token,
                    order_sn: order_sn
                },
                method: 'GET',
                success: function (res) {
                    if (res.data.code == 0) {
                        common.showMsg('温馨提示', '删除订单成功', function () {
                          var orderListaData = self.data.orderListaData;
                          orderListaData.splice(index, 1);
                          self.setData({
                            orderListaData: orderListaData
                          })
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
                }
            })
        }, function () {
            self.setData({ hidden: true });
        });
    },

    // 删除商品单
    delGoodsOrder:function (e) {
        var self = this;
        var token = common.getToken();
        var goodsInfo = e.currentTarget.dataset.item;
        var index = e.currentTarget.dataset.index;
        common.showMsg('温馨提示', '是否确定删除该订单？', function () {
            var data = {
                store_sn: goodsInfo.ft_order.store_sn,
                user_sn: goodsInfo.ft_order.user_sn,
                o_sn: goodsInfo.o_sn,
                go_sn: goodsInfo.ft_order.go_sn,
                token:token
            }
            console.log(data);
            wx.request({
                url: api.delStoreOrder,
                data: data,
                method: 'POST',
                success: function (res) {
                    if (res.data.code == 0) {
                        common.showMsg('温馨提示', '删除订单成功', function () {
                          var orderListaData = self.data.orderListaData;
                          orderListaData.splice(index, 1);
                          self.setData({
                            orderListaData: orderListaData
                          })
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
                }
            })

        }, function () {
            self.setData({ hidden: true });
        });
    },
    // 查看订单详情
    goOrderInfo: function (e) {
        var self = this;
        var orderInfo = e.currentTarget.dataset.order_info;
        app.globalData.checkOrderInfo = orderInfo;
        // turnFlag : 1待支付
        // turnFlag : 2已支付
        // turnFlag : 3待评价
        // turnFlag : 4所有订单
        var turnFlag = Number(self.data.turnFlag);
        switch (turnFlag) {
            case 1:
                app.globalData.createOrderInfo = orderInfo;
                wx.navigateTo({ url: '/page/order/pages/createOrder/createOrder?fromPage=fullorder' });
                break;
            case 2:
                if (orderInfo.order_goods) {
                    if (orderInfo.order_goods.length > 0) {
                        app.globalData.goodsInfo = orderInfo;
                        wx.navigateTo({ url: '/page/order/pages/goodsInfo/goodsInfo?fromPage=fullorder&type=2' });
                    }
                } else {
                    wx.navigateTo({ url: '/page/order/index?orderInfo=' + JSON.stringify(orderInfo) });
                }
                break;
            case 3:
                wx.navigateTo({ url: '/page/order/index?orderInfo=' + JSON.stringify(orderInfo) });
                break;
            case 4:
            console.log(orderInfo);
            if (orderInfo.order_goods){
              if (orderInfo.status == 2){
                app.globalData.createOrderInfo = orderInfo;
                wx.navigateTo({ url: '/page/order/pages/createOrder/createOrder?fromPage=fullorder' });
              }else{
                app.globalData.goodsInfo = orderInfo;
                wx.navigateTo({ url: '/page/order/pages/goodsInfo/goodsInfo?fromPage=fullorder&type=2' });
              }
            }else{
              if (orderInfo.status == 0){
                app.globalData.createOrderInfo = orderInfo;
                wx.navigateTo({ url: '/page/order/pages/createOrder/createOrder?fromPage=fullorder' });
              }else{
                wx.navigateTo({ url: '/page/order/index?orderInfo=' + JSON.stringify(orderInfo) });
              }
            }
                break;
            default:
                break;
        }
    },
    // 支付
    goToPayOrder:function(e){
        var orderInfo = e.currentTarget.dataset.order_info;
        app.globalData.checkOrderInfo = orderInfo;
        wx.navigateTo({ url: '/page/order/pages/orderInfo/orderInfo' });
    },
    // 取消订单
    cancleOrder:function(e){
        var self = this;
        if (!self.data.cancleOrderFlag){
          return;
        }

        self.setData({
          cancleOrderFlag : false
        })
        var orderInfo = e.currentTarget.dataset.order_info;
        if (orderInfo.ft_order){
            // 取消商品单
            var data = {
                user_sn: orderInfo.ft_order.user_sn,
                o_sn: orderInfo.ft_order.o_sn,
                go_sn: orderInfo.ft_order.go_sn,
                token: common.getToken()
            };
            wx.request({
                url: api.cancelStoreOrder,
                data: data,
                method: 'POST',
                success: function (res) {
                    if (res.data.code == 0) {
                        common.showMsg('温馨提示', '取消订单成功!', function () {
                            self.setData({
                                orderListaData: []
                            })
                            self.getOrderList();
                        });
                    } else {
                        common.errMsg(res.data);
                    }
                },
                fail: function (res) {
                    common.errMsg(res.data);
                },
                complete: function (res) {
                  // self.setData({
                  //   hidden: true, 
                  //   cancleOrderFlag : true
                  // });
                }
            })
        }else{
          // 取消电影单
          var data = {
              order_sn:orderInfo.order_sn,
              token: common.getToken()
          }
          wx.request({
            url: api.cancelOrder,
            data: data,
            method: 'POST',
            success: function (res) {
              if (res.data.code == 0) {
                common.showMsg('温馨提示', '取消订单成功!', function () {
                  self.setData({
                    orderListaData: []
                  })
                  self.getOrderList();
                });
              } else {
                common.errMsg(res.data);
              }
            },
            fail: function (res) {
              common.errMsg(res.data);
            },
            complete: function (res) {
              self.setData({
                hidden: true, 
                cancleOrderFlag : true
              });
            }
          })
        }
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
        wx.setStorageSync('allSelectPackages', []);
        wx.setStorageSync('allpackages', []);
        self.setData({
            orderListaData:[],
            nowTime: parseInt(new Date().getTime() / 1000)
        });
        self.getNowTime();
        self.getOrderList();
        // setInterval(function(){
        //     self.getNowTime();
        // })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        page1 = 1;
        if (time_task) {
          clearInterval(time_task);
        }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        page1 = 1;
        if (time_task) {
          clearInterval(time_task);
        }
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
        var self = this;
        var totalPage = self.data.totalPage;
        if (page1 < totalPage){
            page1++;
            self.getOrderList();
        }
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    // 倒计时定时器
    getNowTime: function () {
        var self = this;
        self.setData({
            nowTime: parseInt(new Date().getTime() / 1000)
        })
    }
})