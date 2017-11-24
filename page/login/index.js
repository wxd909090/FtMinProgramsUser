var api = require('../../config').api;
var app = getApp();
const common = require('../common/js/common.js');
const encrypt = require('../common/js/md5.js');
// page/login/index.js
Page({
  data: {
    hidden: true,
    login_type: 0,
    second: 60,
    isSendCode: false,
    mobile: 0,
    sms_code: null,
    pwd: null,
    wx_code: 0,
    fromPage: '',
    deposit:0
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options)
    this.setData({ fromPage: options.page });
    this.setData({ goodspage: options})
    this.getWxUserInfo();
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    app.globalData.isShowLogin = true;
    app.globalData.token = null;
    app.globalData.userInfo = {};
    wx.removeStorageSync('userInfo');
    console.log(app.globalData.chooseOrderInfo)
    this.getBaseInterface();
  },
  onHide: function () {
    // 页面隐藏
    app.globalData.isShowLogin = false;
  },
  onUnload: function () {
    // 页面关闭
    app.globalData.isShowLogin = false;
  },
  sendCode: function () {
    this.getCode();
  },
  userNameInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  passWdInput: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  codeInput: function (e) {
    this.setData({
      sms_code: e.detail.value
    })
  },
  changeLoginType: function () {
    if (this.data.login_type == 0) {
      this.setData({ login_type: 1 });
    } else {
      this.setData({ login_type: 0 });
    }

  },
  getBaseInterface: function(){
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
  login: function () {
    //login_type 
    var self = this;
    if (self.data.mobile == 0) {
      common.showMsg('警告', "请输入电话号码");
      return;
    }
    if (self.data.login_type == 0 && self.data.sms_code == null) {
      common.showMsg('警告', "请输入验证码");
      return;
    }
    if (self.data.login_type == 1 && self.data.pwd == null) {
      common.showMsg('警告', "请输入密码");
      return;
    }
    var postData = { 'type': 0, 'mobile': self.data.mobile };
    if (self.data.login_type == 0) {
      // var postData = { 'type': 0, 'mobile': self.data.mobile, 'sms_code': self.data.sms_code };
      postData.sms_code = self.data.sms_code;
    }
    if (self.data.login_type == 1) {
      // var postData = { 'type': 0, 'mobile': self.data.mobile, password: encrypt.hex_md5(self.data.pwd) };
      postData.password = encrypt.hex_md5(self.data.pwd);
    }

    common.getUserWxCode(function (code) {
      postData.code = code;
      common.getWxUserInfo(function (wxUserInfo) {
        postData.nick_name = wxUserInfo.nickName;
        self.setData({ hidden: false });
        wx.request({
          url: api.login,
          data: postData,
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            if (res.data.code == 0) {
             
              app.globalData.isShowLogin = false;
              app.globalData.token = res.data.data.token;
              app.globalData.userInfo = res.data.data;
              app.globalData.hasLogin = true;
              app.globalData.userSn = res.data.data.user_sn;
              wx.setStorageSync('userInfo', res.data.data);
              //拉取对应token收藏的电影数据
              self.getCollectFilms();
              var fromPage = app.jumpFromPage;
              var mygoodspage = self.data.goodspage;
              var savestoreinfo = self.data.goodspage.mystoreinfo
              if (JSON.stringify(mygoodspage)!= "{}"&&mygoodspage.goodspage==1){
                   console.log("跳转回商品")
                   wx.redirectTo({
                     url: "/page/store/pages/storeDetail/storeDetail?savestoreinfo=" + savestoreinfo,
                    //  url: "/page/login/index?goodspage=" + 1 + "&savestoreinfo=" + savestoreinfo
                     success: function () {

                     },
                     complete: function () {

                     }
                   });
              }else{
                if (fromPage == "detailFilm") {
                  app.jumpFromPage = "";
                  wx.redirectTo({
                    url: "/page/film/pages/detailFilm/detailFilm",
                    success: function () {

                    },
                    complete: function () {

                    }
                  });
                } else {
                  if (parseFloat(self.data.deposit) > 0 && parseFloat(app.globalData.userInfo.deposit) <= 0) {
                    if (app.globalData.chooseOrderInfo) {
                      wx.redirectTo({ url: '/page/personal/pages/deposit/deposit?page=login' });
                    } else {
                      self.getUserActivity(self);
                    }
                  } else {
                    self.getUserActivity(self);
                  };
                }

              }
                
            } else if (res.data.code == 1011) {
              common.showMsg('登陆失败', '密码错误！');
            } else if (res.data.code == 1017) {
              common.showMsg('登陆失败', '账号不存在！');
            } else if (res.data.code == 1018) {
              common.showMsg('登陆失败', '验证码错误！');
            } else {
              common.errMsg(res.data);
            }
          },
          fail: function (res) {
            console.log("request 'common/userRegister' err:" + res.data.msg);
          },
          complete: function () {
            self.setData({ hidden: true });
          }

        })
      });
    });
  },
  getUserActivity: function (self) {
    var self =  self;
    var token = common.getToken();
    if (!token) {
      return;
    }
    wx.request({
      url: api.getUserActivity,
      data: { token: token },
      success: function (res) {
        if(res.data.code == 0){
          if (res.data.data.length > 0) {
            wx.switchTab({ url: '/page/film/index' });
          } else {
            if (app.globalData.chooseOrderInfo){
                wx.navigateBack({
                    
                })
                // var orderInfo = app.globalData.chooseOrderInfo;

                // common.createOrder(app.globalData.chooseOrderInfo.orderInfo,self);
                // var reserve_time = self.data.choosedDate.timestamp + 8 * 60 * 60;
                // if (parseInt(orderInfo.begin_time) < 480) {
                //     reserve_time += 24 * 60 * 60;
                // }
                // orderInfo.reserve_time = reserve_time;
                // console.log(orderInfo);
                // app.globalData.createOrderInfo = orderInfo;
                // wx.navigateTo({
                //     url: '/page/order/pages/createOrder/createOrder',
                // })
            }else{
              wx.switchTab({ url: '/page/personal/index' });
            }
          }
        }else{
          wx.navigateBack({ url: "/page/film/index" });
        }
      },
      fail: function () {
        wx.navigateBack({ url: "/page/film/index" });
      },
      complete: function () {
        
      }
    })
  },
  getCode: function () {
    var self = this;
    if (self.data.mobile == 0) {
      common.showMsg('警告', "请输入电话号码");
      return;
    }
    var re = /^1\d{10}$/;
    if (!re.test(self.data.mobile)) {
      common.showMsg('警告', "请输入正确的手机号码位数");
      return;
    }
    self.setData({ hidden: false });
    wx.request({
      url: api.getSMSCode,
      data: {
        mobile: self.data.mobile,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({ isSendCode: true });
          countdown(self);
        } else {
          common.errMsg(res.data);
        }
      },
      complete: function () {
        self.setData({ hidden: true });
      }
    })
  },
  getWxUserInfo: function () {
    var that = this;
    common.getWxUserInfo(function (wxUserInfo) {
      that.wx_code = wxUserInfo.code;
    });
  },
    //   用户协议
    userArgument: function () {
        wx.navigateTo({
            url: './userArgument/userArgument',
        })
    },
    //拉取收藏电影列表
    getCollectFilms:function(){
      //common.getCollectFilmsList();
      var data = {};
      data['token'] = app.globalData.token;
      wx.request({
        url: api.getCollectFilms,
        data: data,                           
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          app.globalData.collectFilms = res.data.data.list.data;
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

})

function countdown(that) {
  var second = that.data.second
  if (second == 0) {
    that.setData({ isSendCode: false, second: 60 });
    return;
  }
  var time = setTimeout(function () {
    that.setData({
      second: second - 1
    });
    countdown(that);
  }, 1000)
} 
