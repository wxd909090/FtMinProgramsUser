// page/order/pages/createOrder/createOrder.js
const api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var config = require('../../../../config').config;
var app = getApp();
var time_task = "";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeInfo : null,
        orderInfo : null,
        maskdisplay : 0,
        currentchecked : 1,
        comboList: [], 
        choosedCoupon:{
            price : 0
        },
        allSelectPackages:[],
        comboPrice:0,
        cardBlance:0,
        cardUserName:"",
        cantUseComb:false,
        choosedComboList:false,
        fromPage:null,
        cantUseCoun:false,
        forbid:false
    },

  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
        var self = this;
        console.log(options);
        if (options.fromPage){
            self.setData({
                fromPage: options.fromPage
            })
        }
        if (options.fromPage == "fullorder"){
            self.setData({
                cantUseComb : true,
                cantUseCoun : true
            })
        };
        var orderInfo = app.globalData.createOrderInfo;
        self.setData({
            orderInfo: orderInfo
        });
        self.getAllpackages();
        console.log(orderInfo);
        if (orderInfo.create_time){
          if (!orderInfo.ft_order){
            var overTime = config.payTimeOutTime;
            var num = overTime - (parseInt(new Date().getTime() / 1000) - parseInt(orderInfo.create_time));
            orderInfo.pay_time_num = num;
            if (num <= 0 || orderInfo.newStatus == 5) {
              orderInfo.newStatus = 5;
            }
            var M = '' + Math.abs(parseInt(num / 60 % 60));
            var S = '' + Math.abs(parseInt(num % 60));
            if (M.length < 2) {
              M = '0' + M
            }
            if (S.length < 2) {
              S = '0' + S
            }
            orderInfo.timer = '支付倒计时 ' + M + ':' + S;
          }else{
            var overTime = config.payGoodsTimeOutTime;
            var num = overTime - (parseInt(new Date().getTime() / 1000) - parseInt(orderInfo.create_time));
            orderInfo.pay_time_num = num;
            if (num <= 0 || orderInfo.newStatus == 5) {
              orderInfo.newStatus = 5;
            }
            var M = '' + Math.abs(parseInt(num / 60 % 60));
            var S = '' + Math.abs(parseInt(num % 60));
            if (M.length < 2) {
              M = '0' + M
            }
            if (S.length < 2) {
              S = '0' + S
            }
            orderInfo.timer = '支付倒计时 ' + M + ':' + S;
          }
          self.setData({
            orderInfo: orderInfo
          })
          time_task = setInterval(self.move, 1000);
        }
    },
    move: function () {
      var self = this;
      var orderInfo = self.data.orderInfo;
      if (!orderInfo.ft_order) {
        var overTime = config.payTimeOutTime;
        var num = overTime - (parseInt(new Date().getTime() / 1000) - parseInt(orderInfo.create_time));
        orderInfo.pay_time_num = num;
        if (num <= 0 || orderInfo.newStatus == 5) {
          orderInfo.newStatus = 5;
        }
        var M = '' + Math.abs(parseInt(num / 60 % 60));
        var S = '' + Math.abs(parseInt(num % 60));
        if (M.length < 2) {
          M = '0' + M
        }
        if (S.length < 2) {
          S = '0' + S
        }
        orderInfo.timer = '支付倒计时 ' + M + ':' + S;
      } else {
        var overTime = config.payGoodsTimeOutTime;
        var num = overTime - (parseInt(new Date().getTime() / 1000) - parseInt(orderInfo.create_time));
        orderInfo.pay_time_num = num;
        if (num <= 0 || orderInfo.newStatus == 5) {
          orderInfo.newStatus = 5;
        }
        var M = '' + Math.abs(parseInt(num / 60 % 60));
        var S = '' + Math.abs(parseInt(num % 60));
        if (M.length < 2) {
          M = '0' + M
        }
        if (S.length < 2) {
          S = '0' + S
        }
        orderInfo.timer = '支付倒计时 ' + M + ':' + S;
      }
      self.setData({
        orderInfo: orderInfo
      });
    },
    // 打开支付方式选择
    showPayType:function(){
        var self = this;
        console.log(self.data.orderInfo)
        var data = {
            user_sn: common.getUserSn(),
            token: common.getToken(),
        };
        console.log(self.data.orderInfo)
        if (self.data.orderInfo.order_sn) {
            data.store_sn = self.data.orderInfo.store_sn
         
        } else if (self.data.orderInfo.ft_order){
            data.store_sn = self.data.orderInfo.ft_order.store_sn
        }else{
            data.store_sn = app.globalData.storeInfo.store_sn
        }
        wx.request({
            url: api.getRechargeInfo,
            data: data,
            method: 'POST',
            success: function (res) {
                if (res.data.code == 0) {
                    self.setData({
                        cardBlance: res.data.data.surplus,
                        cardUserName: res.data.data.real_name
                    })
                }
                if(res.data.data.length == 0){
                    self.setData({
                        cardBlance: 0
                    })
                }
            },
            fail: function (res) {
                common.errMsg(res.data);
            },
            complete: function (res) {
                self.setData({ hidden: true });
            }
        })
        self.setData({
            maskdisplay : 1
        })
    },
    // 选择支付方式
    clickimg:function(e){
        console.log(e)
        var self = this;
        var chooseType = e.currentTarget.dataset.id;
        if (chooseType == 1){
            if (self.data.fromPage == "fullorder"){
                self.setData({
                    cantUseCoun : true,
                    choosedCoupon:{
                        price : 0,
                        type : 1
                    }
                })
            }
        }else{
            self.setData({
                cantUseCoun: false
            })
        };
        self.setData({
            currentchecked: chooseType,
            maskdisplay : 0
        });
    },
    // 隐藏支付方式选择
    hiddenpayment:function(){
        var self = this;
        self.setData({
            maskdisplay : 0
        })
    },
    // 添加套餐数量
    addTriangleNum:function(e){
        var self = this;
        var combolist = e.currentTarget.dataset.combolist;
        var index = e.currentTarget.dataset.index;
        if (!combolist[index].num){
            combolist[index].num = 0
        }
        combolist[index].num += 1;
        self.setData({
            comboList: combolist
        });
        if (self.data.comboList.length > 0) {
            var newComboList = self.data.comboList;
            var comboPrice = 0;
            for (var i = 0; i < newComboList.length; i++) {
                if (Number(newComboList[i].num) > 0) {
                    comboPrice = comboPrice + newComboList[i].num * newComboList[i].pay_price
                }
            }
            self.setData({
                comboPrice: comboPrice
            })
        }
        console.log(self.data.comboList);
    },
    // 减少套餐数量
    reduceTriangleNum:function(e){
        var self = this;
        var combolist = e.currentTarget.dataset.combolist;
        var index = e.currentTarget.dataset.index;
        if (Number(combolist[index].num) >  0){
            combolist[index].num -= 1;
        }
        self.setData({
            comboList: combolist
        });
        if (self.data.comboList.length > 0) {
            var newComboList = self.data.comboList;
            var comboPrice = 0;
            for (var i = 0; i < newComboList.length; i++) {
                if (Number(newComboList[i].num) > 0) {
                    comboPrice = comboPrice + newComboList[i].num * newComboList[i].pay_price
                }
            }
            self.setData({
                comboPrice: comboPrice
            })
        }
    },
    // 选中单个套餐
    selectComboSingle : function (e){
        var self = this;
        var comboList = self.data.comboList;
        var index = e.currentTarget.dataset.index;
        if (!comboList[index].num){
            comboList[index].num = 1;
        }else{
            comboList[index].num = 0;
        };
        self.setData({
            comboList: comboList
        });
        if (self.data.comboList.length > 0) {
            var newComboList = self.data.comboList;
            var comboPrice = 0;
            for (var i = 0; i < newComboList.length; i++) {
                if (Number(newComboList[i].num) > 0) {
                    comboPrice = comboPrice + newComboList[i].num * newComboList[i].pay_price
                }
            }
            self.setData({
                comboPrice: comboPrice
            })
        }
    },
    //页面跳转
    morePackages: function () {
      wx.navigateTo({
        url: '/page/package/package',
        success: function (res) {
        },
        fail: function (data) {
          console.log("失败");
          console.log(data);
        },
        complete: function () {
          console.log("完成");
        }
      })
    },
    // 选择优惠券
    optionDiscount:function(){
        var self = this;
        wx.navigateTo({
            url: "/page/order/pages/optiondiscount/optiondiscount",
        })
    },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
    createOrderSub:function(){
        var self = this;
        self.setData({
          forbid : true
        });
        // 待支付订单立即支付
        if (self.data.orderInfo.order_sn||self.data.orderInfo.ft_order){
            var openid = common.getOpenId();
            // currentchecked为1时是微信支付，2是会员卡支付
            var currentchecked = self.data.currentchecked;  //支付方式
            var choosedCoupon = self.data.choosedCoupon;    //选择的优惠
            var myurl;
            var data = {
                openid: openid,
                // order_sn: self.data.orderInfo.order_sn,
                pay_type: Number(currentchecked),
                token: common.getToken(),
            };
            if (self.data.orderInfo.order_sn) {
              data.order_sn = self.data.orderInfo.order_sn
              myurl = api.createOrder
            }else{
              data.go_sn = self.data.orderInfo.ft_order.go_sn
              myurl = api.Submissionmerchandiseorders
            };

            // 抵用券添加
            if (Number(currentchecked) == 2 && Number(choosedCoupon.price) > 0 && choosedCoupon.type == 1) {
                data.coupon_sn = choosedCoupon.coupon_sn
            };

            // 抵扣券添加
            if (Number(currentchecked) == 2 && Number(choosedCoupon.price) >= 0 && choosedCoupon.type == 2) {
                data.coupon_sn = choosedCoupon.coupon_sn
            };

            console.log(data);
            //提交订单
            // currentchecked为1，微信支付
            // currentchecked为2，会员卡支付
            if (currentchecked == 1) {
                wx.request({
                    url: myurl,
                    data: data,
                    method: 'POST',
                    success: function (res) {
                        if (res.data.code == 0) {
                            var wxPayData = res.data.data;
                            if (wxPayData.timeStamp) {
                                // 微信支付调用
                                wx.requestPayment({
                                    timeStamp: wxPayData.timeStamp,
                                    nonceStr: wxPayData.nonceStr,
                                    package: wxPayData.package,
                                    signType: wxPayData.signType,
                                    paySign: wxPayData.paySign,
                                    success: function (res) {
                                        var orderInfo = self.data.orderInfo;
                                        var orderInfoPrice = self.data.orderInfo.price;
                                        var choosedCouponPrice = self.data.choosedCoupon.price;
                                        var comboPrice = self.data.comboPrice;

                                        var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                                        var payType = self.data.currentchecked;
                                        wx.redirectTo({
                                            url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                                        })
                                    },
                                    fail: function (res) {
                                        common.showMsg('温馨提示', '支付失败，请重新支付！', function () {
                                            console.log("支付订单失败！")
                                        });
                                    },
                                    complete: function () {
                                        console.log("支付完成")
                                        self.setData({ hidden: true });
                                        self.setData({
                                          forbid: false
                                        })
                                    }
                                })
                            } else {
                                if (wxPayData.length == 0) {
                                    var orderInfo = self.data.orderInfo;
                                    var orderInfoPrice = self.data.orderInfo.price;
                                    var choosedCouponPrice = self.data.choosedCoupon.price;
                                    var comboPrice = self.data.comboPrice;

                                    var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                                    var payType = self.data.currentchecked;
                                    wx.redirectTo({
                                        url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                                    })
                                }
                            }
                        } else {
                            common.errMsg(res.data);
                        }

                    },
                    fail: function () {
                        common.showMsg('温馨提示', '下单失败');
                    },
                    complete: function () {
                        self.setData({ hidden: true });
                        self.setData({
                          forbid: false
                        })
                    }
                })
            } else {
                wx.request({
                    url: myurl,
                    data: data,
                    method: 'POST',
                    success: function (res) {
                        if (res.data.code == 0) {
                            var orderInfo = self.data.orderInfo;
                            var orderInfoPrice = self.data.orderInfo.price;
                            var choosedCouponPrice = self.data.choosedCoupon.price;
                            var comboPrice = self.data.comboPrice;
                            var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                            var payType = self.data.currentchecked;
                            wx.redirectTo({
                                url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                            })
                        } else {
                            common.errMsg(res.data);
                        }
                    },
                    fail: function () {
                        common.showMsg('温馨提示', '下单失败');
                    },
                    complete: function () {
                        self.setData({ hidden: true });
                        self.setData({
                          forbid: false
                        })
                    }
                })
            }
            return;
        }
        // 创建新的订单
        if (Number(self.data.orderInfo.price) < Number(self.data.choosedCoupon.price)){
            common.showMsg('温馨提示', '优惠券金额不得大于电影价格，无法下单！');
            return;
        }
        var openid = common.getOpenId();
        var orderInfo = self.data.orderInfo;
        var currentchecked = self.data.currentchecked;
        var data = {
            reserve_time: orderInfo.reserve_time,
            duration_sn: orderInfo.duration_sn,
            name_hash: orderInfo.name_hash,
            openid: openid,
            pay_type: Number(currentchecked),
            token: common.getToken(),
        };
        var choosedCoupon = self.data.choosedCoupon;
        // 抵用券添加
        if (Number(choosedCoupon.price) > 0){
            data.coupon_sn = choosedCoupon.coupon_sn
        }
        // 折扣券添加
        if (Number(choosedCoupon.price) >= 0 && choosedCoupon.type == 2) {
            data.coupon_sn = choosedCoupon.coupon_sn
        }
        var comboList = self.data.comboList;
        var allSelectPackages = self.data.allSelectPackages;
        if (allSelectPackages.length > 0){
            var getLength = comboList.length;
            var comList = [];
            for (var x = 0; x < getLength;x++){
                var comData = {
                    cb_sn: comboList[x].cb_sn,
                    total_amount: comboList[x].num
                };
                comList.push(comData);
            }
            data.combo_list = comList;
        }else{
            var getLength = self.data.comboList.length;
            var comboList = self.data.comboList;
            if (comboList.length > 0) {
                var comList = [];
                for (var x = 0; x < comboList.length; x++) {
                    var comData = {
                        cb_sn: comboList[x].cb_sn,
                        total_amount: comboList[x].num
                    };
                    if (comData.total_amount){
                        comList.push(comData);
                    }
                }
                data.combo_list = comList;
            };
        }
        if (data.combo_list){
            if (data.combo_list.length > 0) {
                for (var q = 0; q < data.combo_list.length; q++) {
                    if (!data.combo_list[q].total_amount) {
                        data.combo_list.splice(q, 1);
                        q--;
                    };
                };
                if (data.combo_list.length > 0) {
                    data.combo_list = JSON.stringify(data.combo_list);
                } else {
                    delete data.combo_list;
                }
            } else {
                delete data.combo_list
            };
        }
        //提交订单
        // currentchecked为1，微信支付
        // currentchecked为2，会员卡支付
        console.log(data)
        if (currentchecked == 1){
            wx.request({
                url: api.createOrder,
                data: data,
                method: 'POST',
                success: function (res) {
                    console.log(res);
                    if (res.data.code == 0) {
                        var wxPayData = res.data.data;
                        if (wxPayData.timeStamp){
                            // 微信支付调用
                            wx.requestPayment({
                                timeStamp: wxPayData.timeStamp,
                                nonceStr: wxPayData.nonceStr,
                                package: wxPayData.package,
                                signType: wxPayData.signType,
                                paySign: wxPayData.paySign,
                                success: function (res) {
                                    var orderInfo = self.data.orderInfo;
                                    var orderInfoPrice = self.data.orderInfo.price;
                                    var choosedCouponPrice = self.data.choosedCoupon.price;
                                    var comboPrice = self.data.comboPrice;

                                    var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                                    var payType = self.data.currentchecked;
                                    wx.redirectTo({
                                        url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                                    })
                                },
                                fail: function (res) {
                                    common.showMsg('温馨提示', '支付失败，请重新支付！', function () {
                                        wx.redirectTo({ url: '/page/order/pages/fullorder/fullorder?sign=' + 1 });
                                    });
                                },
                                complete: function () {
                                    console.log("支付完成")
                                    self.setData({ hidden: true });
                                    self.setData({
                                      forbid: false
                                    })
                                }
                            })
                        }else{
                            if (wxPayData.length == 0){
                                var orderInfo = self.data.orderInfo;
                                var orderInfoPrice = self.data.orderInfo.price;
                                var choosedCouponPrice = self.data.choosedCoupon.price;
                                var comboPrice = self.data.comboPrice;

                                var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                                var payType = self.data.currentchecked;
                                wx.redirectTo({
                                    url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                                })
                            }
                        }


                    } 
                    // else if(res.data.code == 1000){
                    //   common.showMsg('温馨提示', '您有2个待支付的电影订单，请将待支付订单取消', function(){
                    //       wx.redirectTo({ url: '/page/order/pages/fullorder/fullorder?sign=' + 1 });
                    //     });
                    // }
                    else{
                      common.errMsg(res.data);
                    }

                },
                fail: function () {
                    common.showMsg('温馨提示', '下单失败');
                },
                complete: function () {
                    self.setData({ hidden: true });
                    self.setData({
                      forbid: false
                    })
                }
            })
        }else{
            wx.request({
                url: api.createOrder,
                data: data,
                method: 'POST',
                success: function (res) {
                    if (res.data.code == 0) {
                        var orderInfo = self.data.orderInfo;
                        var orderInfoPrice = self.data.orderInfo.price;
                        var choosedCouponPrice = self.data.choosedCoupon.price;
                        var comboPrice = self.data.comboPrice;
                        var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                        var payType = self.data.currentchecked;
                        wx.redirectTo({
                            url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                        })
                    } else {
                        common.errMsg(res.data);
                    }
                },
                fail: function () {
                    common.showMsg('温馨提示', '下单失败');
                },
                complete: function () {
                    self.setData({ hidden: true });
                    self.setData({
                      forbid: false
                    })
                }
            })
        }

    },
    // 电影单待支付订单再次支付
    payOrderSub:function(){
        var self = this;
        var openid = common.getOpenId();
        var orderInfo = self.data.orderInfo;
        var currentchecked = self.data.currentchecked;
        
        if (currentchecked == 1){
            // 微信支付
            var choosedCoupon = self.data.choosedCoupon;
            var data = {
                openid: openid,
                order_sn: (orderInfo.go_sn ? orderInfo.go_sn : orderInfo.order_sn),
                token: common.getToken()
            };
            // 抵用券添加
            if (Number(choosedCoupon.price) > 0) {
                data.coupon_sn = choosedCoupon.coupon_sn
            };
            // 折扣券添加
            if (Number(choosedCoupon.price) >= 0 && choosedCoupon.type == 2) {
                data.coupon_sn = choosedCoupon.coupon_sn
            }
            wx.request({
                url: api.UnifiedOrder,
                data: data,
                method: "POST",
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.code == 0) {
                        var wxPayData = res.data.data;
                        if (wxPayData.timeStamp) {
                            // 微信支付调用
                            wx.requestPayment({
                                timeStamp: wxPayData.timeStamp,
                                nonceStr: wxPayData.nonceStr,
                                package: wxPayData.package,
                                signType: wxPayData.signType,
                                paySign: wxPayData.paySign,
                                success: function (res) {
                                    var orderInfo = self.data.orderInfo;
                                    var orderInfoPrice = self.data.orderInfo.price;
                                    var choosedCouponPrice = self.data.choosedCoupon.price;
                                    var comboPrice = self.data.comboPrice;
                                    var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                                    var payType = self.data.currentchecked;
                                    wx.navigateBack({
                                        url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                                    })
                                },
                                fail: function (res) {
                                    common.showMsg('温馨提示', '支付失败，请重新支付！', function () {
                                        wx.redirectTo({ url: '/page/order/pages/fullorder/fullorder?sign=' + 1 });
                                    });
                                },
                                complete: function () {
                                    console.log("支付完成")
                                    self.setData({ hidden: true });
                                }
                            })
                        }
                    } else {
                        common.errMsg(res.data);
                    }
                },
                fail: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                complete: function () {
                    self.setData({
                        hidden: true
                    })
                }
            })
        }else{
            // 会员卡支付
            var choosedCoupon = self.data.choosedCoupon;
            var data = {
                order_sn: (orderInfo.go_sn ? orderInfo.go_sn : orderInfo.order_sn),
                token: common.getToken(),
            };
            // 抵用券添加
            if (Number(choosedCoupon.price) > 0) {
                data.coupon_sn = choosedCoupon.coupon_sn
            };
            // 折扣券添加
            if (Number(choosedCoupon.price) >= 0 && choosedCoupon.type == 2) {
                data.coupon_sn = choosedCoupon.coupon_sn
            }
            wx.request({
                url: api.rechargeFilmPay,
                data: data,
                method: "POST",
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.code == 0) {
                        var orderInfo = self.data.orderInfo;
                        var orderInfoPrice = self.data.orderInfo.price;
                        var choosedCouponPrice = self.data.choosedCoupon.price;
                        var comboPrice = self.data.comboPrice;
                        var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                        var payType = self.data.currentchecked;
                        wx.redirectTo({
                            url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                        })
                    } else {
                        common.errMsg(res.data);
                    }
                },
                fail: function (XMLHttpRequest, textStatus, errorThrown) {
                    console.log(XMLHttpRequest);
                    console.log(textStatus);
                    console.log(errorThrown);
                },
                complete: function () {
                    self.setData({
                        hidden: true
                    })
                }
            })
        }
    },
    //获取全部套餐
    getAllpackages: function () {
        var self = this;
        var data = {
            store_sn: app.globalData.storeInfo.store_sn,
            token : common.getToken()
        };
        wx.request({
            url: api.getComboListFilms,
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if(res.data.code == 0){
                    var comboList = res.data.data.data;
                    self.setData({
                        comboList: comboList
                    })
                }else{
                    common.errMsg(res.data);
                }
            },
            fail: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
            },
            complete: function () {
                self.setData({
                    hidden: true
                })
            }
        })
    },
    onReady: function () {
    
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var self = this;
        self.setData({
            storeInfo: app.globalData.storeInfo
        });
        var allpackages = wx.getStorageSync('allpackages');
        var allSelectPackages = wx.getStorageSync('allSelectPackages');
        if (allSelectPackages.length > 0){
            for (var a = 0; a < allSelectPackages.length; a++) {
                for (var q = 0; q < allpackages.length; q++) {
                    if (allSelectPackages[a].cb_sn == allpackages[q].cb_sn) {
                        allSelectPackages[a].num = allpackages[q].num
                    }
                }
            }
        }
        var choosedCoupon = app.globalData.choosedCoupon;
        choosedCoupon.price = Number(choosedCoupon.price);
        choosedCoupon.type = Number(choosedCoupon.type);
        self.setData({
            choosedCoupon: choosedCoupon,
            allSelectPackages: allSelectPackages
        });
        console.log(self.data.choosedCoupon);
        if (self.data.allSelectPackages.length > 0) {
            var newComboList = self.data.allSelectPackages;
            var comboPrice = 0;
            for (var i = 0; i < newComboList.length;i++){
                if (Number(newComboList[i].num) > 0){
                    comboPrice = comboPrice + newComboList[i].num * newComboList[i].pay_price
                }
            }
            self.setData({
                comboList: self.data.allSelectPackages,
                comboPrice: comboPrice
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        // wx.setStorageSync('allSelectPackages', [])
        // wx.setStorageSync('allpackages',[])
      if (time_task){
        clearInterval(time_task);
      }
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        // wx.setStorageSync('allSelectPackages', [])
        // wx.setStorageSync('allpackages',[])
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
    
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    
    }
})