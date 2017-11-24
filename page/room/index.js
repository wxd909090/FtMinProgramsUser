var app = getApp();
var order = ['red', 'yellow', 'blue', 'green', 'red']
const api = require('../../config').api;
const conf = require('../../config').config;
const common = require('../common/js/common.js');
Page({
  data: {
    dateList: [
      { statsu: 0, week: '今天', moth: 5, day: 12 },
      { statsu: 0, week: '周六', moth: 5, day: 13 },
      { statsu: 0, week: '周日', moth: 5, day: 14 },
      { statsu: 0, week: '周一', moth: 5, day: 15 },
    ],
    max_day: '',
    imageUrl: conf.imageUrl,
    hidden: false,
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    current: 0,
    timeautoHeight: 50,
    roomList1: [
      {
        roomId: 1,
        roomNum: '001',
        roomImgUrl: 'http://123.206.201.192/qdq/image/hzw.jpg',
        roomName: '海贼王',
        roomPrice: 50
      }
    ],
    timeList1: [
      {
        time: '08:00-10:00',
        isAvailable: 0
      }
    ],
    roomChoosed: [],
    roomChoosedIndex: 0,
    date: '2016-09-01',
    choosedDate: null,
    choosedTime: '',
    // choosedTimeIndex:0,
    enterType: 0,
    orderInfo: null,
    roomList: [],
    timeList: [],
    userSn : "",
    mobile : "",
    deposit:0,
  },
    onLoad: function (option) {
        // this.getSysCopyDaily();
        this.getAvailableDate();
        var enterType = parseInt(option.enterType);
        this.setData({ enterType: option.enterType });
        if (enterType == 1) {
            this.setData({ orderInfo: JSON.parse(option.orderInfo) });
        }
    },
    onShow: function () {
        wx.setStorageSync('allSelectPackages', []);
        wx.setStorageSync('allpackages',[]);
        app.globalData.choosedCoupon = {
            price: 0,
            type : 1
        };
        // console.log(app.globalData.roomInfo);
        if (app.globalData.storeInfo == null) {
            wx.switchTab({ url: "/page/film/index" });
            return;
        }
        this.getRoomList();
        this.getBaseInterface();
        if (app.globalData.roomInfo == null) {
            this.setData({
            // roomChoosed: this.data.roomList[0],
            date: this.getNowDay(),
            choosedTime: ''
            });
        }
        // console.log(this.data.roomChoosed);
        app.globalData.chooseOrderInfo = null;
        this.setData({ mobile: common.getMobile() });
    },
  getOrderInfoData: function () {
    var self = this;
    //获取订单的详情数据
    var orderInfo = {};
    var roomInfo = this.data.roomChoosed;
    var choosedTime = this.data.choosedTime;
    var choosedDateObj = this.data.choosedDate;
     roomInfo['date'] = choosedDateObj.ymd;
     if (parseInt(choosedTime.begin_time) < 480){
       var dateStr = new Date(choosedTime.reserve_time* 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " "); 
       var dateArr = dateStr.split(" ");
       roomInfo['date'] = dateArr[0];
     }
    // roomInfo['date'] = this.data.date;
    // if (this.data.orderInfo == null) {
     
    var storeInfo = app.globalData.storeInfo;
    var filmInfo = app.globalData.filmInfo;
    console.log(storeInfo);
    console.log(filmInfo);
    var orderInfo = {
      id: 0,
      store_id: storeInfo.id,
      store_name: storeInfo.store_name,
      address: storeInfo.address,
      film_id: filmInfo.id,
      film_name: filmInfo.film_name,
      name_hash: filmInfo.name_hash,
      room_id: roomInfo.id,
      room_sn: roomInfo.room_sn,
      room_name: roomInfo.room_name,
      date: roomInfo.date,
      duration_time: choosedTime.duration_time,
      duration_sn: choosedTime.duration_sn,
      begin_time: choosedTime.begin_time,
      end_time:choosedTime.end_time,
      price: choosedTime.price,
      film_image: filmInfo.image,
      status: 0
    }
    // } else {
    //     var orderInfo = this.data.orderInfo;
    //     orderInfo.roomId = roomInfo.roomId;
    //     orderInfo.roomNum = roomInfo.roomNum;
    //     orderInfo.roomName = roomInfo.roomName;
    //     orderInfo.price = roomInfo.roomPrice;
    //     orderInfo.date = roomInfo.date;
    //     orderInfo.durationTime = choosedTime.duration_time;
    //     orderInfo.durationSn = choosedTime.duration_sn;
    // }
    app.globalData.chooseOrderInfo={
      orderInfo: orderInfo,
      reserve_time: self.data.choosedDate.timestamp + 8 * 60 * 60
    };
    return orderInfo;
  },
  goOrder: function (event) {
    var self = this;
    var choosedTime = self.data.choosedTime;
    var choosedDate = self.data.choosedDate;
    app.globalData.roomInfo = {
      choosedTime: choosedTime,
      current: self.data.current,
      date: choosedDate.ymd,
      roomChoosed: self.data.roomChoosed
    }
    //检查是否选择时段
    if (choosedTime == '') {
      common.showMsg('温馨提示', '请选择一个时间哦！');
      return;
    }
    //判断当前用户是否登陆
    if (common.checkUserLogin()) {
      common.updateUserInfo(function (userInfo) {
        if (parseFloat(userInfo.deposit) <= 0) {
          //跳到到充值押金页面
          common.showMsg('未交押金', '前往交押金', function () {
            wx.navigateTo({ url: '/page/personal/pages/deposit/deposit?page=room' });
          });
          return
        }
        // if (parseFloat(userInfo.compensate) > 0) {
        //   //判断欠费
        //   common.showMsg('你有违约记录', '请前往交费', function () {
        //     wx.navigateTo({ url: '/page/order/pages/myOrder/myOrder?currentTab=1' });
        //   });
        //   return;
        // }
        var orderInfo = {}
        orderInfo = self.getOrderInfoData();
        console.log(orderInfo);
        self.createOrder(orderInfo)

      });
    } else {
      //提示登录
      //  common.showMsg('未登陆', '是否前往登陆？', 
      //  function () { wx.navigateTo({ url: '/page/login/index?page=room' }); },function(){})
      if (!app.globalData.isShowLogin){
        wx.navigateTo({ url: '/page/login/index?page=room' });
      }
      
    }
  },

  //获取系统设置的最大时段拷贝时间
  getSysCopyDaily: function () { 
    var that = this;
    wx.request({
      url: api.getSysCopyDaily,
      data: {},
      success: function (res) {
        if (res.data.code == 0) {
          var max_day = that.getDay(parseInt(res.data.data.max_reserve_day) - 1);
          that.setData({ max_day: max_day });
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () { },
      complete: function () { }
    })
  },
  getRoomList: function () {
    //获取房间列表                        
    var that = this;
    var store_sn = app.globalData.chooseRoomInfo.store_sn;
    that.setData({ hidden: false });
    wx.request({
      url: api.getRoomInfo,
      data: {
        store_sn: store_sn
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        if (res.data.code == 0) {
          var roomInfo = res.data.data.data;
          that.setData({ imageUrl: res.data.data.baseUrl});
          //获取时段列表
          if (roomInfo.length > 0) {
            var indexFlag = 0;
            for (var m = 0; m < roomInfo.length; m++) {
                if (roomInfo[m].room_sn == app.globalData.chooseRoomInfo.room_sn) {
                    indexFlag = m
                }
            }
            if (app.globalData.roomInfo != null ) {
                console.log(app.globalData.roomInfo)
                that.setData({
                    roomList: roomInfo,
                    roomChoosed: app.globalData.roomInfo.roomChoosed,
                    choosedTime: app.globalData.roomInfo.choosedTime,
                    current: app.globalData.roomInfo.current,
                    date: app.globalData.roomInfo.date
                });
            } else {
                that.setData({ roomList: roomInfo, roomChoosed: roomInfo[indexFlag], current: indexFlag});
            }
            that.getTimeList();
          } else {
            that.setData({ hidden: true });
          }

        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {
        // fail
      }
    })
  },
  getTimeList: function () {
    //获取时段
    var self = this;
    self.clearTimeList();
    if(self.data.hidden){
      self.setData({ hidden: false });
    };
    // var date = self.data.date;
    // var reserve_time = parseInt(new Date(date).getTime() / 1000);
    var dateObj = self.data.choosedDate;
    var nowTimestamp = Date.parse(new Date()) / 1000;
    var todayTimes = new Date().setHours(0, 0, 0, 0) / 1000;
    if (!dateObj){
      var choosedDateStamp = todayTimes 
    }else{
      var choosedDateStamp = dateObj.timestamp;
    }
    if (!self.data.roomChoosed.room_sn){
      return;
    }
    console.log(self.data.roomChoosed);
    wx.request({
        url: api.getDurationStateList,
        data: {
            'room_sn': self.data.roomChoosed.room_sn,
            'reserve_time': choosedDateStamp + 8*60*60
        },
      method: 'POST',
      success: function (res) {
        // console.log(res.data.data);
        if (res.data.code == 0) {
          console.log(res.data);
          if (res.data.data.length > 0){
            for (var i = 0; i < res.data.data.length; i++) {
              if (Number(res.data.data[i].begin_time) > Number(res.data.data[i].end_time)){
                if (Number(res.data.data[i].end_time) + 1440 - Number(res.data.data[i].begin_time) >= 240) {
                  res.data.data[i].longTimeStatus = true
                } else {
                  res.data.data[i].longTimeStatus = false
                }
              }else{
                if (Number(res.data.data[i].end_time) - Number(res.data.data[i].begin_time) >= 240){
                  res.data.data[i].longTimeStatus = true
                }else{
                  res.data.data[i].longTimeStatus = false
                }
              }
            }
          }
          self.setData({ timeautoHeight: 50 });
          var timeList = res.data.data;
          var len = timeList.length;
          for (var i = 0; i < len; i++) {
            var reserve_time = choosedDateStamp + parseInt(timeList[i].end_time) * 60;
            if (parseInt(timeList[i].begin_time) > parseInt(timeList[i].end_time)) {
              reserve_time += 24 * 60 * 60;
            }
            if (parseInt(timeList[i].order_status) == 2) {
              timeList[i].order_status = 1;
            }
            if (reserve_time < nowTimestamp && (choosedDateStamp+8*60*60== timeList[i].reserve_time)) {
              timeList[i].order_status = 1;
            }
          }
          if (len > 0) {
            self.setData({ timeautoHeight: (Math.ceil(len / 3)) * 60 });
          };
          // 给timeList添加新属性，用于页面显示时间段
          for(var q = 0;q < len;q++){
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
            if (show_begin_time_hours >= 24){
              show_begin_time_hours = show_begin_time_hours-24
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
        self.setData({ timeList: timeList });
      },
      fail: function () {
        console.log("getTimeList fail");
      },
      complete: function () {
        self.setData({ hidden: true });
      }
    })
  },
  createOrder: function (orderInfo) {
      var self = this;
      self.setData({ hidden: false });
      var reserve_time = self.data.choosedDate.timestamp + 8 * 60 * 60;
      if (parseInt(orderInfo.begin_time) < 480) {
          reserve_time += 24 * 60 * 60;
      }
      orderInfo.reserve_time = reserve_time;
      console.log(orderInfo);
      app.globalData.createOrderInfo = orderInfo;
      wx.navigateTo({
          url: '/page/order/pages/createOrder/createOrder',
      })
      return;
    var token = common.getToken();
    // var choosedDate = self.data.choosedDate;
    // console.log(orderInfo);return;
    var reserve_time = self.data.choosedDate.timestamp + 8 * 60 * 60;
    if (parseInt(orderInfo.begin_time) < 480){
        reserve_time += 24*60*60;
    }
    //提交订单
    wx.request({
      url: api.createOrder,
      data: {
        'token': token,
        'name_hash': orderInfo.name_hash,
        'duration_sn': orderInfo.duration_sn,
        'reserve_time': reserve_time
      },
      method: 'GET',
      success: function (res) {
        // success
        if (res.data.code == 0) {
          orderInfo["price"] = res.data.data.price;
          orderInfo["nowTime"] = res.data.data.time;
          orderInfo["order_sn"] = res.data.data.order_sn;
          wx.navigateTo({ url: '/page/order/index?page=room&orderInfo=' + JSON.stringify(orderInfo) });
        } else if (res.data.code == 1001) {
          common.showMsg("温馨提示", "该时段已经结束，请选择其他时段");
        }else if(res.data.code == 8203){
          app.globalData.compensateData = res.data.data;
          common.showMsg('温馨提示', '您当前有罚款未缴纳，请先前往缴纳罚款！', function () {
            wx.navigateTo({ url: '/page/order/pages/myOrder/myOrder?currentTab=1' });
          });
        }
        else {
          common.errMsg(res.data);
        }
      },
      fail: function () {
        common.showMsg('温馨提示', '下单失败');
      },
      complete: function () {
        self.setData({ hidden: true });
      }
    })
  },
  //图片预览
  previewImage: function (e) {
    console.log(e.currentTarget.dataset);
    var url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
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
  bindDateChange: function (e) {
    app.globalData.roomInfo = null;
    if (new Date(e.detail.value).getTime() >= new Date(this.getNowDay()).getTime()) {
      this.setData({ date: e.detail.value });
      this.getTimeList();
    }
  },
  changeImg: function (e) {
    var current = e.detail.current
    // console.log(current);
    this.setData({
      current: current
    });
    this.setData({
      roomChoosed: this.data.roomList[current],
      choosedTime:''
    });
    //拉取时段
    app.globalData.roomInfo = null;
    this.getTimeList();
  },
  getNowDay: function () {
    var myDate = new Date();
    var y = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
    var m = myDate.getMonth() + 1;       //获取当前月份(0-11,0代表1月)
    var d = myDate.getDate();          //获取当前日(1-31)
    if (m < 10) {
      m = '0' + m;
    }
    if (d < 10) {
      d = '0' + d;
    }
    return y + "-" + m + "-" + d;
  },
  getDay: function (AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d;
  },
  chooseTime: function (event) {
    //order_status
    var idx = event.currentTarget.dataset.idx;
    this.setData({ choosedTimeIndex: idx });
    var item = this.data.timeList[idx];
    var nowTimeStamp = Date.parse(new Date()) / 1000;
    var reserve_time = parseInt(item.reserve_time);
    if (parseInt(item.begin_time) > parseInt(item.end_time)) {
      reserve_time += 24 * 60 * 60;
    }
    var durationBeginTimeStamp = reserve_time + parseInt(item.begin_time) * 60 - 8 * 60 * 60;
    var diff = parseInt((nowTimeStamp - durationBeginTimeStamp) / 60);
    if (diff > 0) {
      common.showMsg("温馨提示", "该时段已开始" + diff + "分钟，请谨慎选择");
    }
    
    var param = {};
    var str = "timeList[" + idx + "].order_status";
    this.clearTimeList();
    if (parseInt(item.order_status) == 0) {
      param[str] = 3;
    }
    this.setData(param);
    this.setData({ choosedTime: this.data.timeList[idx] });
  },
  clearTimeList() {
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
  chooseDate: function (event) {
    // this.clearTimeList();
    var x = event.currentTarget.dataset.x;
    this.setData({ choosedTimeIndex: x });
    var choosed = event.currentTarget.dataset.choosed;
    var param = {};
    var str = "dateList[" + x + "].status";
    this.clearDateList();
    if (choosed == 0) {
      param[str] = 1;
    }
    this.setData(param);
    this.setData({ choosedDate: this.data.dateList[x], choosedTime:'' });
    this.getTimeList();
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
  getBaseInterface: function () {
    var self = this;
    wx.request({
      url: api.baseInterface,
      data: {},
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({
            deposit: res.data.data.deposit
          });
          wx.setStorageSync('deposit', res.data.data.deposit);
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {
        // fail
      }
    })
  },
  // 点击预约按钮
  orderSubmit(event) {
    //order_status
    var self = this;
    var idx = event.currentTarget.dataset.idx;
    var longTimeStatus = event.currentTarget.dataset.status;
    self.setData({ choosedTimeIndex: idx });
    var item = self.data.timeList[idx];
    if (parseInt(item.end_time) > parseInt(item.begin_time)){
      if ((parseInt(item.end_time) - parseInt(item.begin_time)) < parseInt(app.globalData.filmInfo.time_length)) {
        if (app.globalData.storeInfo) {
          if (app.globalData.storeInfo.mobile) {
            common.showMsg("温馨提示", "电影时间较长，请到店或来电咨询！", function () {
              wx.makePhoneCall({
                phoneNumber: app.globalData.storeInfo.mobile
              })
            }, function () {
              return;
            });
          } else {
            common.showMsg("温馨提示", "电影时间较长，请到店咨询！", function () {
              return;
            });
          }
        } else {
          common.showMsg("温馨提示", "电影时间较长，请到店咨询！", function () {
            return;
          });
        }
        return;
      }
    }else{
      if ((parseInt(item.end_time) + 1440 - parseInt(item.begin_time)) < parseInt(app.globalData.filmInfo.time_length)) {
        if (app.globalData.storeInfo) {
          if (app.globalData.storeInfo.mobile) {
            common.showMsg("温馨提示", "电影时间较长，请来电咨询！", function () {
              wx.makePhoneCall({
                phoneNumber: app.globalData.storeInfo.mobile
              })
            }, function () {
              return;
            });
          } else {
            common.showMsg("温馨提示", "电影时间较长，请到店咨询！", function () {
              return;
            });
          }
        } else {
          common.showMsg("温馨提示", "电影时间较长，请到店咨询！", function () {
            return;
          });
        }
        return;
      }
    }

    var nowTimeStamp = Date.parse(new Date()) / 1000;
    var reserve_time = parseInt(item.reserve_time);

    if (parseInt(item.begin_time) > parseInt(item.end_time)) {
      reserve_time += 24 * 60 * 60;
    }
    var durationBeginTimeStamp = reserve_time + parseInt(item.begin_time) * 60 - 8 * 60 * 60;
    var diff = parseInt((nowTimeStamp - durationBeginTimeStamp) / 60);
    
    self.setData({ choosedTime: self.data.timeList[idx] });
    var choosedTime = self.data.choosedTime;
    var choosedDate = self.data.choosedDate;
    app.globalData.roomInfo = {
      choosedTime: choosedTime,
      current: self.data.current,
      date: choosedDate.ymd,
      roomChoosed: self.data.roomChoosed
    }
    //判断当前用户是否登陆
    var orderInfo = {}
    orderInfo = self.getOrderInfoData();
    if (common.checkUserLogin()) {
        common.updateUserInfo(function (userInfo) {
            // var orderInfo = {}
            // orderInfo = self.getOrderInfoData();
            var deposit = wx.getStorageSync('deposit');
            if (parseFloat(deposit) == 0){
                console.log("无需缴纳押金")
            }else{
                if (parseFloat(userInfo.deposit) <= 0){
                    wx.navigateTo({ url: '/page/personal/pages/deposit/deposit?page=room' });
                    return;
                }
            }
            //检查是否选择时段
            if (choosedTime == '') {
                common.showMsg('温馨提示', '请选择一个时间哦！');
                return;
            }
            // 已经开始提醒用户是否选择
            if (diff > 0) {
                common.showMsg("温馨提示", "该时段已开始" + diff + "分钟，请谨慎选择",function(){
                    self.createOrder(orderInfo)
                },function(){
                    return;
                });
            }else{
                self.createOrder(orderInfo)
            }
        });
        } else {
            //提示登录
            //  common.showMsg('未登陆', '是否前往登陆？', 
            //  function () { wx.navigateTo({ url: '/page/login/index?page=room' }); },function(){})
            if (!app.globalData.isShowLogin) {
                wx.navigateTo({ url: '/page/login/index?page=room' });
            }
        }
  },
  // 点击轮播左箭头
  clickLeft() {
    var that = this;
    if (that.data.current == 0){
      that.setData({
        current: that.data.roomList.length - 1
      })
    }else{
      var current = that.data.current - 1;
      that.setData({
        current: current
      })
    }
  },
  clickRight() {
    var that = this;
    if (that.data.current == (that.data.roomList.length - 1)){
      that.setData({
        current: 0
      })
    }else{
      var current = that.data.current + 1;
      that.setData({
        current: current
      })
    }
    
  }
  
})