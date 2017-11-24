var api = require('../../../../config').api;
var app = getApp();
const common = require('../../../common/js/common.js');
const encrypt = require('../../../common/js/md5.js');
// page/login/index.js
Page({
  data: {
    hidden: true,
    pwd1: null,
    pwd2: null
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  passWdInput: function (e) {
    this.setData({
      pwd1: e.detail.value
    })
  },
  passWdInputAgain: function (e) {
    if (this.data.pwd1 == null) {
      common.showMsg('温馨提示', "请输入新的密码");
    }
    this.setData({
      pwd2: e.detail.value
    });
  },
  changePwd: function () {
    //界面绑定手机，后台为注册
    var that = this;
    if (that.data.pwd2 == null) {
        common.showMsg('温馨提示', "请确认密码");
        return;
    }
    if (that.data.pwd1 != this.data.pwd2) {
        common.showMsg('温馨提示', '两次输入的密码不一致，请您重新输入');
        return;
    }
    var postData = {
        password: encrypt.hex_md5(that.data.pwd2),
        user_sn: common.getUserSn(),
        user_type: 0,
        token:common.getToken()
    };
    console.log(postData);
      that.setData({ hidden: false });
      wx.request({
        url: api.setPassword,
        data: postData,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 0) {
            console.log(res);
            common.showMsg('温馨提示','密码修改成功',function(){
              wx.switchTab({url:"/page/personal/index"});
            });
          } else {
            common.errMsg(res.data);
          }
        },
        fail: function (res) {
          console.log("request 'common/setPassword' err:" + res.data.msg);
        },
        complete: function () {
          that.setData({ hidden: true });
        }

      })
  },
  getWxUserInfo: function () {
    var that = this;
    common.getWxUserInfo(function (wxUserInfo) {
      that.wx_code = wxUserInfo.code;
    });
  }

})
