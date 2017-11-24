var app = getApp();
var config = require('../../../config').config;
var api = require('../../../config').api;
var errCode = require('../../../config').errCode;
module.exports = {
  getToken: getToken,
  getWxUserInfo: getWxUserInfo,
  getUserInfo: getUserInfo,
  checkUserLogin: checkUserLogin,
  getUserOpenId: getUserOpenId,
  getOpenId: getOpenId,
  updateUserInfo: updateUserInfo,
  pay: pay,
  showMsg: showMsg,
  getDepositNum: getDepositNum,
  getUserWxCode: getUserWxCode,
  getUserSn: getUserSn,
  getMobile: getMobile,
  tokenTimeOut: tokenTimeOut,
  updateUserInfoKeyVal: updateUserInfoKeyVal,
  getMyLocation: getMyLocation,
  errMsg: errMsg,
  formatDateTime: formatDateTime,
  createOrder : createOrder
}
//时间戳转时间
function formatDateTime(inputTime,isYmd= 1) {
  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  if(isYmd){
    return y + '-' + m + '-' + d;
  }
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
};

//创建订单
function createOrder(orderInfo,self){
  console.log(orderInfo)
  self.setData({ hidden: false });
  var token = getToken();
  // var choosedDate = self.data.choosedDate;
  // console.log(orderInfo);return;
  var reserve_time = app.globalData.chooseOrderInfo.reserve_time
  if (parseInt(orderInfo.begin_time) < 480) {
    reserve_time += 24 * 60 * 60;
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
        if (self.data.filmFlag){
          wx.navigateTo({ url: '/page/order/index?page=room&orderInfo=' + JSON.stringify(orderInfo) });
        }else{
          wx.redirectTo({ url: '/page/order/index?page=room&orderInfo=' + JSON.stringify(orderInfo) });
        }
      } else if (res.data.code == 1001) {
        showMsg("温馨提示", "该时段已经结束，请选择其他时段",function(){
          if (self.data.filmFlag){
            wx.navigateTo({ url: '/page/room/index' });
          }else{
            wx.navigateBack({ url: '/page/room/index' });
          }
        });
      } else if (res.data.code == 8203) {
        app.globalData.compensateData = res.data.data;
        showMsg('温馨提示', '您当前有罚款未缴纳，请先前往缴纳罚款！', function () {
          wx.redirectTo({ url: '/page/order/pages/myOrder/myOrder?currentTab=1' });
        });
      }
      else {
        wx.navigateBack({ url: '/page/room/index' });
        setTimeout(function(){
          errMsg(res.data);
        },1000);
      }
    },
    fail: function () {
      showMsg('温馨提示', '下单失败');
    },
    complete: function () {
      self.setData({ hidden: true });
    }
  })
};

//检查用户是否登陆
function checkUserLogin() {
  // console.log(app.globalData.hasLogin);      
  if (app.globalData.hasLogin) {
    return true;
  }
  try {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.token) {
      app.globalData.hasLogin = true;
      return true;
    } else {
      app.globalData.hasLogin = false;
      return false;
    }
  } catch (e) {
    console.log("get getStorageSync userInfo fail" + e);
  }
}

//获取用户token
function getToken() {
  if (app.globalData.token != null) {
    return app.globalData.token;
  }
  try {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.token) {
      // console.log("get token from getStorageSync");
      app.globalData.token = userInfo.token;
      return userInfo.token;
    } else {
      console.log("token in getStorageSync is null");
      // tokenTimeOut();
      return null;
    }
  } catch (e) {
    console.log("get setStorageSync token fail:" + e);
    return null;
  }
}
//获取收藏电影列表
function getCollectFilmsList(){
  var data = {};
  data['token'] = app.globalData.token;
  wx.request({
    url: api.getCollectFilms,
    data: data,
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      app.globalData.collectFilms = res.data.data.data;
      console.log(res);
    },
    fail: function (XMLHttpRequest, textStatus, errorThrown) {
      console.log(XMLHttpRequest);
      console.log(textStatus);
      console.log(errorThrown);
    },
    complete: function () {

    }
  })
}

// 获取用户openId
function getOpenId() {
    if (app.globalData.open_id != null) {
        return app.globalData.open_id;
    }
    try {
        var userInfo = wx.getStorageSync('userInfo');
        if (userInfo.open_id) {
            // console.log("get token from getStorageSync");
            app.globalData.open_id = userInfo.open_id;
            return userInfo.open_id;
        } else {
            console.log("open_id in getStorageSync is null");
            // tokenTimeOut();
            return null;
        }
    } catch (e) {
        console.log("get setStorageSync token fail:" + e);
        return null;
    }
}

//获取user_sn
function getUserSn() {
  if (app.globalData.userSn != null) {
    return app.globalData.userSn;
  }
  try {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.token) {
      // console.log("get token from getStorageSync");
      app.globalData.userSn = userInfo.user_sn;
      return userInfo.user_sn;
    } else {
      console.log("token in getStorageSync is null");
      // wx.navigateTo({ url: '/page/login/index' });
      // tokenTimeOut();
      return null;
    }
  } catch (e) {
    console.log("get setStorageSync token fail:" + e);
  }
}

//获取getMobile
function getMobile() {
  if (app.globalData.mobile != null) {
    return app.globalData.mobile;
  }
  try {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.mobile) {
      // console.log("get token from getStorageSync");
      app.globalData.mobile = userInfo.mobile;
      return userInfo.mobile;
    } else {
      console.log("mobile in getStorageSync is null");
      // wx.navigateTo({ url: '/page/login/index' });
      // tokenTimeOut();
      return null;
    }
  } catch (e) {
    console.log("get setStorageSync token fail:" + e);
  }
}

//获取微信用户信息
function getWxUserInfo(callBack) {
  if (app.globalData.wxUserInfo.nickName) {
    // console.log('get wxUserInfo from globalData');
    callBack(app.globalData.wxUserInfo);
    return;
  }
  try {
    var wxUserInfo = wx.getStorageSync('wxUserInfo');
    if (wxUserInfo.nickName) {
      // console.log("get wxUserInfo from getStorageSync");
      app.globalData.wxUserInfo = wxUserInfo;
      callBack(wxUserInfo);
    } else {
      wx.login({
        success: function (res) {
          // console.log(res);
          var code = res.code;
          wx.getUserInfo({
            success: function (res) {
              // console.log(res);
              // console.log("get wxUserInfo from login");
              try {
                var ret = res.userInfo;
                // ret.code = code;
                app.globalData.wxUserInfo = ret;
                wx.setStorageSync('wxUserInfo', ret);
                callBack(ret);
              } catch (e) {
                console.log("set setStorageSync wxUserInfo fail:" + e);
              }
            },
            fail: function (res) {
              console.log("common getUserInfo 失败");
            }
          })
        },
        fail: function () {
          //login fail
          console.log("login fail");
        },
        complete: function (res) {
          //login complete
        }
      });
    }
  } catch (e) {
    console.log("get setStorageSync wxUserInfo fail:" + e);
  }
}

//获取用户信息
function getUserInfo(callBack) {
  if (app.globalData.userInfo.token) {
    // console.log("get userInfo from globalData");
    app.globalData.hasLogin = true;
    callBack(app.globalData.userInfo);
    return;
  }
  try {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo.token) {
      // console.log("get userInfo from getStorageSync");
      app.globalData.hasLogin = true;
      app.globalData.userInfo = userInfo;
      callBack(userInfo);
    } else {
      // console.log("userInfo is null");
      app.globalData.hasLogin = false;
      // wx.navigateTo({ url: '/page/personal/index' });
    }
  } catch (e) {
    console.log("get setStorageSync userInfo fail:" + e);
  }
}

//更新用户信息
function updateUserInfo(callback) {
  var token = getToken();
  var userInfo = {};
  wx.request({
    url: api.getUserBaseInfo,
    header: {
      "Content-Type": "application/json"
    },
    data: {
      token: token
    },
    success: function (res) {
      if (res.data.code == 0) {
        userInfo = res.data.data;
        userInfo.token = token;
        app.globalData.userInfo = userInfo;

        try {
          wx.setStorageSync('userInfo', userInfo);
        } catch (e) {
          console.log("updateUserInfo: setStorageSync userInfo fail");
        }
        if (typeof callback == 'function') {
          callback(userInfo);
        }
      } else if (res.data.code == 1012) {
        tokenTimeOut();
      } else {
        errMsg(res.data);
      }
    },
    fail: function () {
      console.log("updateUserInfo:getUserBaseInfo fail");
    }
  });
}

// 更新本地缓存中userInfo中的键值
function updateUserInfoKeyVal(data) {
  if (typeof data != "object") {
    console.log("updateUserInfoKeyVal：data must be object");
    return;
  } else {
    getUserInfo(function (userInfo) {
      var newUserInfo = userInfo;
      for (var Key in data) {
        if (newUserInfo.hasOwnProperty(Key) === true) {
          newUserInfo[Key] = data[Key];
        } else {
          continue;
        }
      }
      app.globalData.wxUserInfo = newUserInfo;
      wx.setStorageSync('userInfo', newUserInfo);
    });
  }
}

//获取微信用户的openId
function getUserOpenId(callback) {
  var self = app;
  if (self.globalData.userInfo.open_id) {
    callback(self.globalData.userInfo.open_id);
    return;
  }
  try {
    var wxUserInfo = wx.getStorageSync('wxUserInfo');
    if (wxUserInfo.open_id) {
      callBack(wxUserInfo.open_id);
    } else {
      updateUserInfo(function (userInfo) {
        callback(userInfo.open_id);
      });
    }
  } catch (e) {
    showMsg("错误提示", "getUserOpenId fail:" + e);
    callback(e, '');
    console.log("get setStorageSync wxUserInfo.open_id fail:" + e);
  }
}

//获取微信用户的code
function getUserWxCode(callback) {
  wx.login({
    success: function (res) {
      // console.log(res);
      if (res.errMsg == "login:ok") {
        callback(res.code);
      } else {
        console.log("getUserWxCode err:" + res);
      }

    },
    fail: function () {
      console.log("getUserWxCode fail");
    },
    complete: function (res) {
      //login complete
    }
  });
}

//支付
function pay(self, order_sn, callback) {
  if (typeof callback != 'function') {
    console.log('call pay function must give callback function');
    return;
  }
  var token = getToken();
  var payRet = { code: 0, msg: '支付成功' };
  self.setData({ hidden: false });
  // 此处需要先调用wx.login方法获取code，然后在服务端调用微信接口使用code换取下单用户的openId
  // 具体文档参考https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-login.html?t=20161230#wxloginobject 
  getUserOpenId(function (openid) {
    wx.request({
      url: api.UnifiedOrder,
      data: {
        'token': token,
        'openid': openid,
        'order_sn': order_sn
      },
      //method: 'POST',
      header: {
        "Content-Type": "application/json"
      },
      success: function (res) {
        self.setData({ hidden: true });
        if (res.data.code == 0) {
          var payargs = res.data.data;
          wx.requestPayment({
            timeStamp: payargs.timeStamp,
            nonceStr: payargs.nonceStr,
            package: payargs.package,
            signType: payargs.signType,
            paySign: payargs.paySign,
            success: function (res) {
              payRet.code = 0;
              payRet.msg = '支付成功';
              callback(payRet);
            },
            fail: function (res) {
              payRet.code = 2;
              payRet.msg = "取消支付";
              callback(payRet);
            },
            complete: function () {
              self.setData({ hidden: true });
            }
          })
        } else if (res.data.code == 1012) {
          tokenTimeOut();
        } else {
          errMsg(res.data);
        }

      }
    })
  })
}

//提示信息
function showMsg(title, content, callback1, callback2) {
  var showCancel = false;
  if (typeof callback2 == "function") {
    showCancel = true;
  }
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: function (res) {
      if (res.confirm) {
        if (typeof callback1 == 'function') {
          callback1();
        }
      } else {
        callback2();
      }
    }
  })
}

//得到押金金额
function getDepositNum(callback) {
  var num = app.globalData.depositNum;
  var token = getToken();
  if (num > 0) {
    callback(num);
  } else {
    wx.request({
      url: api.getDepositNum,
      data: {
        token: token
      },
      method: 'GET',
      success: function (res) {
        if (res.data.code == 0) {
          callback(res.data.data.deposite);
        } else if (res.data.code == 1012) {
          setTimeout();
        } else {
          errMsg(res.data);
        }
      },
      fail: function (res) {
        conosle.log("getDepositNum fail");
      },
      complete: function (res) {
        // complete
      }
    })
  }
}

//token 过期或者不存在
function tokenTimeOut() {
  if (!app.globalData.isShowLogin){
    wx.navigateTo({ url: '/page/login/index' });
    app.globalData.hasLogin = false;
    app.globalData.isShowLogin = true;
  }
  
  // wx.showModal({
  //   title: '温馨提示',
  //   content: '您的登陆已过期，请重新登陆',
  //   showCancel:true,
  //   success: function (res) {
  //     try {
  //       app.globalData.token = null;
  //       app.globalData.userInfo = {};
  //       wx.removeStorageSync('userInfo');
  //     } catch (e) {
  //       console.log("removeStorageSync('userInfo') fail ");
  //     }
  //     if (res.confirm) {
  //       wx.navigateTo({ url: '/page/login/index' });
  //       return;
  //     } else if (res.cancel) {
  //       wx.switchTab({ url: "/page/personal/index" });
  //     }
  //   }
  // });
  
}

//获取我的经纬度
function getMyLocation() {
  var location = app.globalData.myLocation;
  if (!location){
    app.wxGetMyLocation();
    location = app.globalData.myLocation;
  }
  if (location.length != "undefined") {
    return location;
  }
  // location = {};
  // console.log(location.length); //undefined
  // console.log(location);
}

//错误信息
function errMsg(ret) {
  var title = '温馨提示';
  var errMsg = errCode[ret.code];
  if (ret.code == 1012) {
    tokenTimeOut();
    return;
  }
  if (errMsg == null || errMsg == '' || errMsg == undefined) {
    title = "系统错误";
    errMsg = ret.msg;
  }
  if (config.errDug && title == "系统错误") {
    showMsg(title, ret.code +':'+ ret.msg);
    return;
  }
  showMsg(title, errMsg);


}

