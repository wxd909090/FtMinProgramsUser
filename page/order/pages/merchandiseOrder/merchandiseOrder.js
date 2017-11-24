// page/merchandiseOrder/merchandiseOrder.js
const api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clicksubmit:false,
    hiddenLoading:true,
    index: 0,
    currentchecked: 1,
    pay_type: 1,
    maskdisplay: 0,
    distribution_type: 1,
    orderinformation: [],
    RechargeInfo: [],
    duration_sn: '',
    reserve_time: '',
    displaytime: "请选择时间",
    compartmentName: [
      "开始时间",
      "结束时间",
      "3号包间",
      "6号包间",
      "3号包间",
      "一9号包间",
      "一号9包间",
      "9号包间",
      "一9号包间",
    ],
    items: [
      { name: 1, value: '店家配送', checked: 'true' },
      { name: 2, value: '前台自取' },
    ],
    timeList: [],
    choosedDate: null,
    storeInfo: null,
    choosedSendRoom: {
      room_name: "请选择配送包间"
    },
    max_day: "",
    dateList: [],
    roomChoosed: [],
    hidden: true
  },
  chooseDate: function (event) {
    // this.clearTimeList();
    // console.log(event)
    var x = event.currentTarget.dataset.x;
    this.setData({ choosedTimeIndex: x });
    var choosed = event.currentTarget.dataset.choosed;
    var param = {};
    var str = "dateList[" + x + "].status";
    this.clearDateList();
    if (choosed == 0) {
      param[str] = 1;
    }
    this.setData(param)
    this.setData({ choosedDate: this.data.dateList[x], choosedTime: '' });
    this.getTimeList();
  },
  clearTimeList: function () {
    //还原timeList
    var timeList = this.data.timeList;
    var len = timeList.length;
    for (var i = 0; i < len; i++) {
      if (timeList[i].order_status == 3) {
        var param = {};
        var str = "timeList[" + i + "].order_status";
        param[str] = 0;
        this.setData(param);
      }
    }
  },
  getTimeList: function () {
    //获取时段
    var self = this;
    self.clearTimeList();
    if (self.data.hidden) {
      self.setData({ hidden: false });
    }
    // var date = self.data.date;
    // var reserve_time = parseInt(new Date(date).getTime() / 1000);
    var dateObj = self.data.choosedDate;
    var nowTimestamp = Date.parse(new Date()) / 1000;
    var todayTimes = new Date().setHours(0, 0, 0, 0) / 1000;
    if (!dateObj) {
      var choosedDateStamp = todayTimes
    } else {
      var choosedDateStamp = dateObj.timestamp;
    }
    if (!self.data.choosedSendRoom.room_sn) {
      return;
    }
    wx.request({
      url: api.getDurationStateList,
      data: {
        'room_sn': self.data.choosedSendRoom.room_sn,
        'reserve_time': choosedDateStamp + 8 * 60 * 60
      },
      method: 'POST',
      success: function (res) {
        // console.log(res.data.data);
        if (res.data.code == 0) {
          // console.log(res.data);
          if (res.data.data.length > 0) {
            for (var i = 0; i < res.data.data.length; i++) {
              if (Number(res.data.data[i].begin_time) > Number(res.data.data[i].end_time)) {
                if (Number(res.data.data[i].end_time) + 1440 - Number(res.data.data[i].begin_time) >= 240) {
                  res.data.data[i].longTimeStatus = true
                } else {
                  res.data.data[i].longTimeStatus = false
                }
              } else {
                if (Number(res.data.data[i].end_time) - Number(res.data.data[i].begin_time) >= 240) {
                  res.data.data[i].longTimeStatus = true
                } else {
                  res.data.data[i].longTimeStatus = false
                }
              }
            }
          }
          var timeList = res.data.data;
          var len = timeList.length;
          for (var i = 0; i < len; i++) {
            timeList[i].choosed = 0;
            var reserve_time = choosedDateStamp + parseInt(timeList[i].end_time) * 60;
            if (parseInt(timeList[i].begin_time) > parseInt(timeList[i].end_time)) {
              reserve_time += 24 * 60 * 60;
            }
            if (parseInt(timeList[i].order_status) == 2) {
              timeList[i].order_status = 1;
            }
            if (reserve_time < nowTimestamp && (choosedDateStamp + 8 * 60 * 60 == timeList[i].reserve_time)) {
              timeList[i].order_status = 1;
            }
          }
          // 给timeList添加新属性，用于页面显示时间段
          for (var q = 0; q < len; q++) {
            var show_begin_time_hours = parseInt(Number(timeList[q].begin_time) / 60);
            var show_begin_time_min = Number(timeList[q].begin_time) % 60;
            if (show_begin_time_min < 10) {
              show_begin_time_min = "0" + show_begin_time_min
            }
            var show_end_time_hours = parseInt(Number(timeList[q].end_time) / 60);
            var show_end_time_min = Number(timeList[q].end_time) % 60;
            if (show_end_time_min < 10) {
              show_end_time_min = "0" + show_end_time_min
            }
            if (show_begin_time_hours >= 24) {
              show_begin_time_hours = show_begin_time_hours - 24
            }
            if (show_end_time_hours >= 24) {
              show_end_time_hours = show_end_time_hours - 24
            }
            if (show_begin_time_hours < 10) {
              show_begin_time_hours = "0" + show_begin_time_hours
            }
            if (show_end_time_hours < 10) {
              show_end_time_hours = "0" + show_end_time_hours
            }
            timeList[q].show_begin_time = show_begin_time_hours + ":" + show_begin_time_min;
            timeList[q].show_end_time = show_end_time_hours + ":" + show_end_time_min;
          }
          // console.log(timeList);
        } else {
          // console.log(res.data.code+':'+res.data.msg);
          common.errMsg(res.data);
        }
        var displaytime = [];
        var timestamp = Date.parse(new Date()) / 1000;
        // console.log(timeList)
        // console.log(timestamp)
        for (var i = 0, len = timeList.length; i < len; i++) {
          if (timeList[i].end_timestamp > timestamp) {
            displaytime = displaytime.concat([timeList[i]])
          }
        }
        // console.log(displaytime)
        // console.log(res.data.data);
        self.setData({ timeList: displaytime });
      },
      fail: function () {
        // console.log("getTimeList fail");
      },
      complete: function () {
        self.setData({ hidden: true });
      }
    })
  },
  chooseTime: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index;
    var timeList = this.data.timeList;
    for (var i = 0; i < timeList.length; i++) {
      timeList[i].choosed = 0;
    };
    timeList[index].choosed = 1;
    self.setData({
      timeList: timeList
    })
    console.log(this.data.timeList)
    
    for (var i = 0, len = this.data.timeList.length; i < len; i++) {
      if (this.data.timeList[i].choosed == 1) {
        var displaytime = self.getLocalTime(this.data.timeList[i].reserve_time) + this.data.timeList[i].duration_time;
        // console.log(this.data.timeList[i].reserve_time)
        // console.log(this.data.timeList[i].duration_time)
        self.setData({
          displaytime: displaytime,
          duration_sn: this.data.timeList[i].duration_sn,
          reserve_time: this.data.timeList[i].reserve_time,
        })
      }
    }
  },
  getLocalTime: function (nS) {
    var d = new Date(parseInt(nS) * 1000);
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    return year + '/' + month + '/' + date + '  '
    // console.log(year + '--' + month + '--'+date)
  },
  clearDateList() {
    //还原DateList
    var dateList = this.data.dateList;
    var len = dateList.length;
    for (var i = 0; i < len; i++) {
      if (dateList[i].status == 1) {
        var param = {};
        var str = "dateList[" + i + "].status";
        param[str] = 0;
        this.setData(param);
        this.setData(param);
      }
    }
  },
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value);
    var distribution_type = e.detail.value;
    this.setData({
      distribution_type: distribution_type
    })
  },
  //   bindPickerChange: function (e) {
  //     this.setData({
  //       index: e.detail.value
  //     })
  //   },
  optionDiscount: function () {
    var Ordercount = this.data.count;
    // console.log("传过去的counr----" + Ordercount)
    wx.navigateTo({
      url: "/page/order/pages/optiondiscount/optiondiscount?sign=100&Ordercount=" + Ordercount,
    })
  },
  // 切换支付方式
  clickimg: function (e) {
    this.setData({
      currentchecked: e.currentTarget.dataset.id,
      pay_type: parseInt(e.currentTarget.dataset.id)
    })
  },
  //   选择房间时间段
  chooseSendTime: function () {
    this.setData({
      maskdisplay: 2,
    });
    this.getTimeList();
  },
  // 隐藏支付方式
  hiddenpayment: function () {
    this.setData({
      maskdisplay: 0,
    })
  },
  displaypayment: function () {
    this.setData({
      maskdisplay: 1,
    })
  },

  //获取可用的date
  getAvailableDate: function (AddDayCount) {
    var that = this;
    var dateList = [];
    wx.request({
      url: api.getStoreMaxCopyTime,
      data: {},
      success: function (res) {
        if (res.data.code == 0) {
          var max_day = parseInt(res.data.data) - 1;
          that.setData({ max_day: max_day });
          for (var i = 0; i <= max_day; i++) {
            var myDate = new Date();
            var item = {};
            myDate.setDate(myDate.getDate() + i);//获取AddDayCount天后的日期
            var ymd = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate();
            var week = "周" + "日一二三四五六".split("")[myDate.getDay()];
            item = {
              status: 0,
              week: week,
              y: myDate.getFullYear(),
              m: myDate.getMonth() + 1,
              d: myDate.getDate(),
              ymd: ymd,
            };
            item.timestamp = (new Date(Date.parse(ymd.replace(/-/g, "/")))).getTime() / 1000;
            if (i == 0) {
              item.status = 1;
              item.week = '今天';
              dateList.push(item);
              continue;
            }
            // myDate.setDate(myDate.getDate() + i);//获取AddDayCount天后的日期
            // var week = "周" + "日一二三四五六".split("")[myDate.getDay()];
            // var ymd = myDate.getFullYear() + '-' + (myDate.getMonth() + 1) + '-' + myDate.getDate();
            // var item = { status: 0, week: week,ymd:ymd };
            // item.timestamp = (new Date(Date.parse(item.ymd.replace(/-/g, "/")))).getTime() / 1000;
            dateList.push(item);
          }
          that.setData({ dateList: dateList });
          that.setData({ choosedDate: that.data.dateList[0] });
          // console.log(dateList);
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () { },
      complete: function () { }
    })
  },

  chooseSendRoom: function () {
    wx.navigateTo({ url: '/page/room/chooseRoom/chooseRoom?fromPage=' + 'merchandiseOrder' });
  },
  // 提交订单
  submit: function () {
    var self = this
    var data = {};
    data.user_sn = app.globalData.userInfo.user_sn;
    data.store_sn = this.data.storeInfo.store_sn;
    data.pay_type = this.data.pay_type;
    data.openid = app.globalData.userInfo.open_id;
    data.distribution_type = this.data.distribution_type;
    data.room_sn = this.data.choosedSendRoom.room_sn;
    // 处理时间
    if (this.data.choosedSendRoom.room_name == '请选择配送包间') {
      // console.log("manddwqfewfew")
      common.showMsg("温馨提示", "未选择包间", function () {

      })
    } else {
      // console.log(self.data.timeList);
      var currentchoosed = false;
      if (self.data.displaytime == "请选择时间") {
        common.showMsg("温馨提示", "未选择时间", function () {

        })
      } else {
        data.duration_sn = this.data.duration_sn
        data.reserve_time = this.data.reserve_time
        data.token = common.getToken();
        if (this.data.submitpackagearr.length > 0) {
          data.combo_list = JSON.stringify(this.data.submitpackagearr);;
        }
        if (this.data.submitgoodsarr.length > 0) {
          data.order_goods_list = JSON.stringify(this.data.submitgoodsarr);
        }
        // 订单信息传给支付成功界面
        // var orderInfo = JSON.stringify(data);
        self.setData({
          clicksubmit:true,
          hiddenLoading:false,
        })
        if (data.pay_type == 1) {
          wx.request({
            url: api.Submissionmerchandiseorders,
            method: 'post',
            data: data,
            success: function (res) {
              if (res.data.code == 0) {
                var wxPayData = res.data.data;
                if (wxPayData.timeStamp) {
                  // 微信支付调用
                  self.setData({
                    hiddenLoading: true,
                  })
                  wx.requestPayment({
                    timeStamp: wxPayData.timeStamp,
                    nonceStr: wxPayData.nonceStr,
                    package: wxPayData.package,
                    signType: wxPayData.signType,
                    paySign: wxPayData.paySign,
                    success: function (res) {
                      // var orderInfo = self.data.orderInfo;
                      // var orderInfoPrice = self.data.orderInfo.price;
                      // var choosedCouponPrice = self.data.choosedCoupon.price;
                      // var comboPrice = self.data.comboPrice;

                      // var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                      var payType = self.data.pay_type;
                      wx.redirectTo({
                        url: "/page/order/pages/orderComplete/orderComplete?price=" + self.data.price + "&payType=" + payType
                      })
                    },
                    fail: function (res) {
                      common.showMsg('温馨提示', '支付失败，请重新支付！', function () {
                        wx.redirectTo({ url: '/page/order/pages/fullorder/fullorder?sign=' + 1 });
                      });
                    },
                    complete: function () {
                      // console.log("支付完成")
                      self.setData({ hidden: true });
                    }
                  })
                } else {
                  // 优惠券判断
                  // if (wxPayData.length == 0) {
                  //   var orderInfo = self.data.orderInfo;
                  //   var orderInfoPrice = self.data.orderInfo.price;
                  //   var choosedCouponPrice = self.data.choosedCoupon.price;
                  //   var comboPrice = self.data.comboPrice;

                  //   var price = (orderInfoPrice * 100 - choosedCouponPrice * 100 + comboPrice * 100) / 100;
                  //   var payType = self.data.currentchecked;
                  //   wx.redirectTo({
                  //     url: "/page/order/pages/orderComplete/orderComplete?orderInfo=" + JSON.stringify(orderInfo) + "&price=" + price + "&payType=" + payType,
                  //   })
                  // }
                }
              } else {
                self.setData({
                  hiddenLoading: true,
                  clicksubmit: false,
                })
                common.errMsg(res.data);
              }

            },
            fail: function () {
              self.setData({
                hiddenLoading: true,
                clicksubmit: false,
              })
              common.showMsg('温馨提示', '下单失败');
            },
            complete: function () {
              self.setData({ hidden: true });
            }
          })
        }
        // 会员支付处理
        if (data.pay_type == 2) {
          var RechargeInfoprice = parseFloat(self.data.RechargeInfo.surplus)*1000;
          var countprice = parseFloat(self.data.count)*1000;
          if (RechargeInfoprice < countprice ) {
            self.setData({
              clicksubmit: false,
              hiddenLoading: true,
            })
            common.showMsg('温馨提示', "余额不足请选择其他支付方式");
          } else {
            wx.request({
              url: api.Submissionmerchandiseorders,
              method: 'post',
              data: data,
              success: function (res) {
                if (res.data.code == 0) {
                  self.setData({
                    hiddenLoading: true,
                  })
                  var payType = self.data.pay_type;
                  wx.redirectTo({
                    url: "/page/order/pages/orderComplete/orderComplete?price=" + self.data.price + "&payType=" 
                    + payType
                  })
                } else {
                  self.setData({
                    clicksubmit: false,
                    hiddenLoading: true,
                  })
                  common.errMsg(res.data);
                }
              },
              fail: function () {
                self.setData({
                  clicksubmit: false,
                  hiddenLoading: true,
                })
                common.showMsg('温馨提示', '下单失败');
              },
              complete: function () {
                self.setData({ hidden: true });
              }
            })
          }
        }

      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取门店信息
    var self = this;
    // 页面载入时清空之前全局选择的房间信息
    if (app.globalData.choosedSendRoom) {
      app.globalData.choosedSendRoom=null
    };
    self.setData({
      storeInfo: app.globalData.choosedGoodsStore
    });
    self.getAvailableDate()
    // console.log(self.data.storeInfo);
    // 获取传过来的订单信息
    try {
      var value = wx.getStorageSync('orderinformation')
      if (value) {
        // console.log("you值");
        // console.log(value);
        self.setData({
          orderinformation: value
        });
      }
    } catch (e) {
      // Do something when catch error
    }
    // 计算订单总价
    var count = 0;
    for (var i = 0, len = this.data.orderinformation.length; i < len; i++) {
      count += parseInt(this.data.orderinformation[i].num) * ((parseFloat(this.data.orderinformation[i].price) * 1000))
    }
    count = count/1000;
    this.setData({
      count: count,
      price: count,
    })
    // 获取会员信息
    var rdata = {};
    // console.log(app.globalData.choosedGoodsStore);
    rdata.store_sn = self.data.storeInfo.store_sn;
    rdata.user_sn = app.globalData.userInfo.user_sn;
    rdata.token = common.getToken();
    wx.request({
      url: api.getRechargeInfo,
      method: 'post',
      data: rdata,
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({
            RechargeInfo: res.data.data
          });
          // console.log(res.data.data)
        } else {
          // common.errMsg(res.data);
        }
      },
      fail: function () {

      },
      complete: function () {

      }
    })
    
    // 处理需要提交的套餐和商品;
    var goodsarr = [];
    var packagearr = [];
    for (var i = 0, len = self.data.orderinformation.length; i < len; i++) {
      self.data.orderinformation[i].id = self.data.orderinformation[i].id.toString()
    }
    this.setData({
      orderinformation: this.data.orderinformation
    })
    for (var i = 0, len = self.data.orderinformation.length; i < len; i++) {
      if (self.data.orderinformation[i].id.indexOf("package") == -1) {
        goodsarr = goodsarr.concat(self.data.orderinformation[i])
      } else {
        packagearr = packagearr.concat(self.data.orderinformation[i])
      }
    }
    var submitgoodsarr = [];
    var submitpackagearr = [];
    // console.log(goodsarr);
    // console.log(packagearr);
    for (var i = 0, len = goodsarr.length; i < len; i++) {
      var data = {};
      data.g_sn = goodsarr[i].g_sn;
      data.total_amount = goodsarr[i].num
      submitgoodsarr = submitgoodsarr.concat([data])
    }
    for (var i = 0, len = packagearr.length; i < len; i++) {
      var data = {};
      data.cb_sn = packagearr[i].cb_sn;
      data.total_amount = packagearr[i].num
      submitpackagearr = submitpackagearr.concat([data])
    }
    self.setData({
      submitgoodsarr: submitgoodsarr,
      submitpackagearr: submitpackagearr
    })
    
    // 获取已支付订单信息
    var current_todayTimes = Date.parse(new Date()) / 1000;
    var start_todayTimes = new Date().setHours(0, 0, 0, 0) / 1000 + 8 * 60 * 60;
    var last_todayTimes = start_todayTimes + 24 * 60 * 60;
    var reserve_time_list = start_todayTimes + "," + last_todayTimes
    var token = common.getToken();
    var user_sn = app.globalData.userInfo.user_sn;
    wx.request({
      url: api.getPayFilmOrderList,
      data: {
        store_sn: self.data.storeInfo.store_sn,
        token: token,
        user_sn: user_sn,
        reserve_time_list: reserve_time_list
      },
      method: 'post',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          // 重新排序
          var arr = res.data.data;
          console.log(arr);
          for (var i = 0, len = arr.length; i < len; i++) {
            var begin_time = parseInt(res.data.data[i].reserve_time) 
            + parseInt(res.data.data[i].begin_time) * 60 - 8 * 60 * 60
            var end_time = parseInt(res.data.data[i].reserve_time)
             + parseInt(res.data.data[i].end_time) * 60 - 8 * 60 * 60
            if (end_time < begin_time) {
              end_time = end_time + 24 * 60 * 60
            }
            var checktime = end_time
            arr[i].checktime = checktime
          }
          // console.log(arr)
          var compare = function (prop) {
            return function (obj1, obj2) {
              var val1 = obj1[prop];
              var val2 = obj2[prop];
              if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                val1 = Number(val1);
                val2 = Number(val2);
              }
              if (val1 < val2) {
                return -1;
              } else if (val1 > val2) {
                return 1;
              } else {
                return 0;
              }
            }
          }
          var newarr = arr.sort(compare("checktime"));
          // console.log(newarr)
          for (var i = 0, len = newarr.length; i < len; i++) {
            if (newarr[i].checktime > current_todayTimes) {
              self.setData({
                Existingmovieorders: newarr[i]
              })
              break;
            }
          }
          console.log(self.data.Existingmovieorders)
          if (typeof (self.data.Existingmovieorders) == "undefined") {

          } else {
            var displaytime = self.getLocalTime(parseInt(self.data.Existingmovieorders.reserve_time)) + self.data.Existingmovieorders.duration_time
            self.setData({
              choosedSendRoom: self.data.Existingmovieorders,
              displaytime: displaytime,
              duration_sn: self.data.Existingmovieorders.duration_sn,
              reserve_time: self.data.Existingmovieorders.reserve_time,
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // console.log(app.globalData.choosedSendRoom);
    var self = this;
    if (app.globalData.choosedSendRoom) {
      self.setData({
        choosedSendRoom: app.globalData.choosedSendRoom
      })
    };
    // console.log(this.data.choosedSendRoom)
    // 获取优惠券
    // console.log("优惠券");
    // console.log(app.globalData.choosedCoupon);
    this.setData({
      myCoupon: app.globalData.choosedCoupon.price
    })
    // 设置门店信息
    self.setData({
      storeInfo: app.globalData.choosedGoodsStore
    });
    self.getAvailableDate()
    // console.log(self.data.storeInfo);
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