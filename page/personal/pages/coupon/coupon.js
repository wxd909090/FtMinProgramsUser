var api = require('../../../../config').api;
var app = getApp();
const common = require('../../../common/js/common.js');
// const encrypt = require('../../../common/js/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:false,
    codeList:null,
    fromPage:'personal',
    codeListLen:0,
    couponList:[],
    nowTime : 0,
    code:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.fromPage = options.page;
    this.getCouponList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

    // 获取兑换码
    getCode: function (e) {
        var self = this;
        var code = e.detail.value;
        self.setData({
            code: code
        })
    },
    // 兑换
    Exchange: function () {
        var self = this;
        var data = {
            code: self.data.code,
            token: common.getToken(),
            user_sn: common.getUserSn(),
        }
        wx.request({
            url: api.codeExchangeCoupon,
            data: data,
            success: function (res) {
                if (res.data.code == 0) {
                    common.showMsg('', "兑换成功！", function () {
                        self.setData({
                            code : ""
                        })
                        self.getCouponList();
                    });
                }else{
                  common.showMsg('', "兑换失败！", function () {
                    self.setData({
                      code: ""
                    })
                    // self.getCouponList();
                  });
                    // common.errMsg(res.data);
                }
            },
            complete: function () {
                self.setData({ loading: false });
            }
        })
    },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var date = new Date();
    var nowTime = parseInt(date.getTime() / 1000);
    this.setData({
      nowTime: nowTime
    })
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
  // onShareAppMessage: function () {
  
  // }
    getCouponList: function(){
        var self = this;
        common.getUserInfo(function (userInfo) {
            wx.request({
            url: api.getCoupon,
            data: {
                token: userInfo.token
            },
            success: function (res) {
                if (res.data.code == 0) {
                if(res.data.data.length > 0){
                    for (var i = 0; i < res.data.data.length; i++) {
                    res.data.data[i].price = parseInt(res.data.data[i].price);
                    var date = new Date(parseInt(res.data.data[i].expire_time)*1000);
                    res.data.data[i].timeString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
                    }
                }
                self.setData({
                    couponList : res.data.data
                })
                } else {
                    common.errMsg(res.data);
                }
            },
            complete: function () {
                self.setData({ loading: false });
            }
            })
        })
    },
    use: function(e){
        if(this.data.fromPage == 'personal'){
        common.showMsg('温馨提示', '预约电影支可以使用体验码支付哦，赶快去预约电影吧');
        }
        if(this.data.fromPage == 'order'){
        wx.navigateBack({
            url: 'page/order/pages/coupon/coupon?code=' + e.currentTarget.code
        })
        }
    },
  getUserCodeList:function(){
    var that = this;
   common.getUserInfo(function(userInfo){
     that.setData({ loading: true });
     wx.request({
       url: api.getUserCodeList,
       data: {
         token: userInfo.token,
         user_sn: userInfo.user_sn,
         usable: 0
       },
       success: function (res) {
         if(res.data.code == 0){
           var list = res.data.data
           var len = list.length;
            for(var i=0;i<len;i++){
              list[i].date = common.formatDateTime(list[i].expire_time*1000); 
            }
            that.setData({ codeList: list, codeListLen:len});
         }else{
           common.errMsg(res.data);
         }
       },
       complete: function () {
         that.setData({ loading: false });
       }
     })
   })
  }
})