var app = getApp();
const config = require('../../../config').config;
const api = require('../../../config').api;
const common = require('../../common/js/common.js');
var page = 1;
Page({
    data: {
        b: true,
        store: [{ "src": "/image/star_white.png", "name": "极差", "sign": "" }, { "src": "/image/star_white.png", "name": "较差", "sign": "" }, { "src": "/image/star_white.png", "name": "一般", "sign": "" }, { "src": "/image/star_white.png", "name": "不错", "sign": "" }, { "src": "/image/star_white.png", "name": "很棒", "sign": "" }],
        filmInfo:null,
        info:"",
        alertShow: false,
        placeText:"快来说说你的看法吧（6-300字）",
        showGrade:false
    },
    onShow: function () {
       this.setData({
         b:false,
         showGrade: false
       })
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
    },
    onLoad: function (options) {
        var filmInfo = app.globalData.filmInfo;
        this.setData({
            filmInfo: filmInfo
        })
    },
    setScore:function(event){
    
      var self = this;
      var funcStore = self.data.store;
      var dom = event.currentTarget;
      var num = dom.id;
      if(num < 4){
        var nextNum = parseInt(num) + 1;
      };
      var sign = dom.dataset.sign;
      if(sign == "sign"){
        if(num<4){
          var nextSign = funcStore[nextNum].sign;
          if (nextSign == "sign"){
            for (var i = nextNum; i < 5; i++){
              funcStore[i].sign = "";
              funcStore[i].src = "/image/star_white.png";
            };
            self.setData({
              store: funcStore
            })
          }else{
            for (var i = 0; i <= num; i++) {
              funcStore[i].sign = "";
              funcStore[i].src = "/image/star_white.png";
            };
            self.setData({
              store: funcStore
            })
          }
        }else{
          for (var i = 0; i <= num; i++) {
            funcStore[i].sign = "";
            funcStore[i].src = "/image/star_white.png";
          };
          self.setData({
            store: funcStore
          })
        }
      }else {
        for (var i = 0; i <= num; i++) {
          funcStore[i].sign = "sign";
          funcStore[i].src = "/image/star.png";
        };
        self.setData({
          store: funcStore
        })
      }
      console.log(dom);
    },
    openActive: function () {
       
    },
    // 提交电影评价
    filmReviewsSub:function(){
        var self = this;
        var grade = 0;
        for (var i = 0; i < self.data.store.length;i++){
            if (self.data.store[i].sign){
                grade += 1
            }
        }
        var token = common.getToken();
        if (token){
            var data = {
                name_hash: self.data.filmInfo.name_hash,
                film_name: self.data.filmInfo.film_name,
                grade: grade,
                info: self.data.info,
                token:token
            };
            if (!data.info){
                common.showMsg('温馨提示', '请填写评价内容！');
                return;
            }
            if (data.grade == 0) {
                common.showMsg('温馨提示', '最低评分至少一颗星！');
                return;
            }
            wx.request({
                url: api.createFilmReviews,
                data: data,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    self.setData({
                        reviewsInfo: "",
                        placeText:" "
                    });
                    if(res.data.code == 0){
                        if(res.data.data.grade){
                            self.setData({
                                showGrade: true,
                            });
                            common.getUserInfo(function (Info) {
                                var userInfo = Info
                                userInfo.grade = Number(userInfo.grade) + 1
                                common.updateUserInfoKeyVal({ 'userInfo': userInfo });
                            });
                        }
                        self.setData({
                            alertShow: true,
                        });
                        setTimeout(function () {
                            self.closeAlert();
                        }, 2000);

                    }else{
                        common.errMsg(res.data)
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
                    });
                }
            })
        }else{
            common.showMsg('温馨提示', '请登录！');
        }

    },
    // 输入框事件
    confirmInfo: function (option) {
        var self = this;
        self.setData({ info: option.detail.value });
    },
    // 关闭提示框
    closeAlert: function () {
        var self = this;
        wx.navigateBack({
            url: '/page/film/pages/detailFilm/detailFilm',
            success: function () {
                // that.setData({hidden:true});
            },
            complete: function () {
                // that.setData({hidden:false});
            }
        });
    },
    onShareAppMessage: function () {
       
    },
    getUserActivity : function () {
       
    },
    //上拉加载
    onReachBottom: function () {
       
    },
    //下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    }
    })
