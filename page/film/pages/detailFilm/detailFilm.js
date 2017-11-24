var app = getApp();
const config = require('../../../../config').config;
const api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var page = 1;
Page({
    data: {
        b: true,
        image_url:'/image/detail/down.png',
        sign:"sign",
        introduce_view_height:"200rpx",
        film_info:{},
        imageUrl: config.imageUrl,
        reviewsList:[],
        moreReviewFlag:false,
        page:1,
        baseMap: "image/baseMap/baseMap.jpg",
        want_watch:135,
        celebrityList:[],
        hasReviews:false,

        wordsColor:"#fff",
        collectionSign:"no",
        collectionWords:"",
        delId:""
    },
    getHotFilmPic:function(e){
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var celebrityList = self.data.celebrityList;
      for (var i = 0; i < celebrityList.length; i++) {
        var obj = celebrityList[i];
        if (obj){
          if (obj['image'] == src) {
            obj['image'] = "/image/baseMap/baseMap2.jpg";
          }
        }
      };
      self.setData({
        celebrityList: celebrityList
      })
    },
    upDown:function(e){
        var that = this;
        var dom = e.target;
        var text = dom.dataset.sign;
        if (text == "sign"){
            that.setData({
            image_url: "/image/detail/up.png",
            sign:"",
            introduce_view_height:""
            })
        }else{
            that.setData({
            image_url: "/image/detail/down.png",
            sign:"sign",
            introduce_view_height: "200rpx"
            })
        }  
    },
    // 预约
    choose: function (event) {
        if (app.globalData.storeInfo != null) {
            wx.navigateTo({ url: '/page/room/index' });
        } else {
            wx.switchTab({ url: '/page/store/index' });
        }
    },
    // 跳转房间列表
    goToRoom:function(){
        if (app.globalData.storeInfo != null) {
          // try {
          //   wx.setStorageSync('remeberInfo', "");
          //   wx.setStorageSync('remeberNum', "");
          // } catch (e) {
          // }
          if (this.data.film_info.is_play == 0){
            console.log(app.globalData.storeInfo);
            var mobile = "";
            if (app.globalData.storeInfo.mobile){
              mobile = app.globalData.storeInfo.mobile;
            }
            if (mobile){
              common.showMsg("温馨提示", "电影正在院线上映，请到店或来电咨询！", function () {
                wx.makePhoneCall({
                  phoneNumber: app.globalData.storeInfo.mobile
                })
              }, function () {
                return;
              });
            }else{
              common.showMsg("温馨提示", "电影正在院线上映，请到店咨询！", function () {
                return;
              });
            }
            
          }else{
            wx.redirectTo({ url: '/page/room/chooseRoom/chooseRoom' });
          }
        } else {
            wx.switchTab({ url: '/page/store/index' });
        }
    },
    //电影收藏
    collectionTap:function(e){
      var self = this;
      var dom = e.currentTarget;
      var sign = dom.dataset.sign;
      var token = common.getToken();
      console.log(token);
      //判断登陆
      if (token) {
        //判断是否已经收藏
        if (sign == "no") {
          // self.setData({
          //   collectionSign: "yes"
          // });
          self.addCollect();
        } else {
          // common.showMsg('', "温馨提示,电影已经收藏，请误重复添加", function () {
          // });
          common.showMsg('已收藏', '是否取消收藏？', function () {
            self.delCollectFilms();
          }, function () {
          });
        }
      } else {
        app.jumpFromPage = "detailFilm";
        common.showMsg('登录之后才能收藏', '是否登录？', function () {
          wx.navigateTo({
            url: '/page/login/index'
          })
        }, function () {
        });
      } 
    },
    //删除收藏电影
    delCollectFilms:function(){
      var self = this;
      var data = {};
      data['id'] = self.data.delId;
      wx.request({
        url: api.delCollectFilms,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          if(res.data.code == 0){
            self.setData({
              wordsColor: "#fff",
              collectionWords: "收藏",
              collectionSign: "no"
            })
          }else{
            common.showMsg('取消收藏失败', "", function () {
            });
            self.setData({
              wordsColor: "#ffb300",
              collectionWords: "已收藏",
              collectionSign: "yes"
            });
          }
        },
        fail: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(XMLHttpRequest);
          console.log(textStatus);
          console.log(errorThrown);
        },
        complete: function () {

        }
      })
    },
    //收藏电影
    addCollect:function(){
      var self = this;
      var name_hash = self.data.film_info.name_hash;
      var store_sn = app.globalData.storeInfo.store_sn;
      var token = common.getToken();
      var data = {};
      data['name_hash'] = self.data.film_info.name_hash;
      data['store_sn'] = store_sn;
      data['token'] = token;
      self.addCollectFilm(data); 
    },
    addCollectFilm:function(data){
      var self = this;
      wx.request({      
        url: api.addCollectFilms,
        data: data,
        header: {             
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          var num = res.data.code;
          if (num == 0) {
            self.getCollectFilmsList();
          } else if (num == 1000){
            self.setData({
              wordsColor: "#ffb300",
              collectionWords: "已收藏",
              collectionSign: "yes"
            })
            common.showMsg('已收藏', "", function () {
            });
          }else {
            common.showMsg('收藏失败', "",  function () {
            });
          }
        },
        fail: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(XMLHttpRequest);
          console.log(textStatus);
          console.log(errorThrown);
        },
        complete: function () {

        }
      })
    },
    // 获取电影评价
    getFilmReviewsList: function(){
        var self = this;
        var data = {
            name_hash: self.data.film_info.name_hash,
            page : self.data.page
        }
        var token = common.getToken();
        if (token) {
            data['token'] = token;
        }
        wx.request({
            url: api.getFilmReviewsList,
            data: data,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if(res.data.code == 0){
                    if (res.data.data.user_review){
                        if (res.data.data.user_review.length > 0) {
                            self.setData({
                                hasReviews: true
                            })
                        }
                    }
                    var data = res.data.data.data;
                    var filmPraiseArr = wx.getStorageSync('filmPraise');

                    if(data.length > 0){
                        for (var q = 0; q < data.length; q++) {
                            data[q].hasPraiseUp = false;
                            if (data[q].create_time) {
                                var newDate = new Date();
                                newDate.setTime(data[q].create_time * 1000);
                                data[q].create_time = newDate.toLocaleDateString().replace(/\//g, '-')
                            };
                            for (var w = 0; w < filmPraiseArr.length;w++){
                                if (data[q].name_hash == filmPraiseArr[w].name_hash && data[q].id == filmPraiseArr[w].id){
                                    data[q].hasPraiseUp = true;
                                }
                            }
                        }
                    }
                    var reviewsList = self.data.reviewsList;
                    reviewsList = reviewsList.concat(data);
                    self.setData({
                        reviewsList: reviewsList
                    });
                    var newPage = self.data.page + 1;
                    self.setData({
                        page: newPage
                    })
                    if (newPage > res.data.data.last_page){
                        self.setData({ moreReviewFlag: false});
                    }else{
                        self.setData({ moreReviewFlag: true });
                    }
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
    onShow: function () {
        var self = this;
        self.setData({
            reviewsList:[]
        })
        self.getFilmReviewsList();
        self.getCelebrityList();
    },
    //获取收藏电影列表
    getCollectFilmsList:function(){
      var self = this;
      var data = {};
      var token = common.getToken();
      data['token'] = token;
      wx.request({
        url: api.getCollectFilms,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          if(res.data.code == 0){
            //收藏0部返回空数组没问题
            app.globalData.collectFilms = res.data.data.list.data;
            //console.log(res);
            var name_hash = self.data.film_info.name_hash;
            //判断电影有没有收藏
            var arrFilms = res.data.data.list.data;;
            if (arrFilms.length>0) {
              for (var i = 0; i < arrFilms.length; i++) {
                var strHash = arrFilms[i].name_hash;
                if (name_hash == strHash) {
                  self.setData({
                    wordsColor: "#ffb300",
                    collectionWords: "已收藏",
                    collectionSign: "yes",
                    delId: arrFilms[i].id
                  });
                  break;
                }else{
                  self.setData({
                    wordsColor: "#fff",
                    collectionWords: "收藏",
                    collectionSign: "no"
                  })
                }
              }
            }else{
              self.setData({ 
                wordsColor: "#fff",   
                collectionWords: "收藏"
              })
            }
          }else{
            self.setData({
              wordsColor: "#fff",
              collectionWords: "收藏",
              collectionSign: "no"
            })
          }
        },
        fail: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(XMLHttpRequest);
          console.log(textStatus);
          console.log(errorThrown);
        },
        complete: function () {

        }
      })
    },
    //更新收藏列表
    updateCollectFilmsList: function () {
      var self = this;
      var data = {};
      var token = common.getToken();
      data['token'] = token;

      wx.request({
        url: api.getCollectFilms,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if(res.data.code == 0){
            app.globalData.collectFilms = res.data.data.list.data;
          }
        },
        fail: function (XMLHttpRequest, textStatus, errorThrown) {
          console.log(XMLHttpRequest);
          console.log(textStatus);
          console.log(errorThrown);
        },
        complete: function () {

        }
      })
    },
    // 获取演员、导演表
    getCelebrityList:function(){
        var self = this;
        var data = {
            name_hash: self.data.film_info.name_hash
        }
        wx.request({
            url: api.getCelebrityInFilm,
            data: data,
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                var data = res.data.data;
                if(data.length > 0){
                    for (var q = 0; q < data.length;q++){
                        if (data[q].type == 2){
                            var spliceData = data.splice(q,1)[0];
                            data.unshift(spliceData);
                            m--;
                        }
                    };
                    var directorArr = [];
                    for(var m = 0;m < data.length;m++){
                        if (data[m].type == 2){
                            var directorData = data.splice(m,1)[0];
                            directorArr.push(directorData);
                            m--;
                        }
                    };
                    data.unshift(directorArr[0]);
                };
                if(!data[0]){
                  data.splice(0,1)
                }
                self.setData({
                    celebrityList : data
                });
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
    getfilmsListPic:function(e){
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var film_info = app.globalData.filmInfo;
      var oldSrc = film_info.image;
      if (oldSrc == src) {
        film_info['image'] = "/image/baseMap/baseMap2.jpg";
      }
      self.setData({
        film_info: film_info
      });
    },
    // 评价电影
    filmReviews:function(){
        var token = common.getToken();
        if(token){
            wx.navigateTo({
                url: '/page/static/scoreFilms/scoreFilms',
            })
        }else{
            common.showMsg('登录之后才能评价','是否登录？',function(){
                wx.navigateTo({
                    url: '/page/login/index'
                })
            },function(){
            });
        }
    },
    //评论点赞
    filmReviewsUp:function(e){
        var self = this;
        var token = common.getToken();
        if (token) {
            var reviewinfo = e.currentTarget.dataset.reviewinfo;
            var index = e.currentTarget.dataset.index;
            var data = {
                name_hash: reviewinfo.name_hash,
                grade: reviewinfo.grade,
                info: reviewinfo.info,
                film_name:reviewinfo.film_name,
                token : token,
                id: reviewinfo.id,
                praise:1
            }
            wx.request({
                url: api.createFilmReviews,
                data: data,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.code == 0) {
                        if (!wx.getStorageSync('filmPraise')){
                            wx.setStorageSync('filmPraise',[]);
                        }
                        var filmPraiseArr = wx.getStorageSync('filmPraise');
                        if (filmPraiseArr.length > 50){
                            filmPraiseArr.splice(0,1)
                        }
                        var filmPraiseFlag = {
                            name_hash: data.name_hash,
                            id: data.id
                        };
                        var pushFlag = false;
                        filmPraiseArr.push(filmPraiseFlag);
                        wx.setStorageSync('filmPraise', filmPraiseArr);
                        var reviewsList = self.data.reviewsList;
                        reviewsList[index].praise = Number(reviewinfo.praise) + 1;
                        reviewsList[index].hasPraiseUp = true;
                        self.setData({
                            reviewsList: reviewsList
                        })
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
            common.showMsg('登录之后才能点赞', '是否登录？', function () {
                wx.navigateTo({
                    url: '/page/login/index'
                })
            }, function () {
            });
        }
    },
    filmReviewsDown:function(e){
        var self = this;
        var token = common.getToken();
        if (token) {
            var reviewinfo = e.currentTarget.dataset.reviewinfo;
            var index = e.currentTarget.dataset.index;
            var data = {
                name_hash: reviewinfo.name_hash,
                grade: reviewinfo.grade,
                info: reviewinfo.info,
                film_name: reviewinfo.film_name,
                token: token,
                id: reviewinfo.id,
                praise: -1
            }
            wx.request({
                url: api.createFilmReviews,
                data: data,
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.code == 0) {
                        if (!wx.getStorageSync('filmPraise')) {
                            wx.setStorageSync('filmPraise', []);
                        }
                        var filmPraiseArr = wx.getStorageSync('filmPraise');
                        var filmPraiseFlag = {
                            name_hash: data.name_hash,
                            id: data.id
                        };
                        for (var x = 0; x < filmPraiseArr.length; x++) {
                            if (filmPraiseArr[x].name_hash == filmPraiseFlag.name_hash && filmPraiseArr[x].id == filmPraiseFlag.id){
                                filmPraiseArr.splice(x, 1);
                            }
                        };
                        wx.setStorageSync('filmPraise', filmPraiseArr);
                        var reviewsList = self.data.reviewsList;
                        reviewsList[index].praise = Number(reviewinfo.praise) - 1;
                        reviewsList[index].hasPraiseUp = false;
                        self.setData({
                            reviewsList: reviewsList
                        })
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
        } else {
            common.showMsg('登录之后才能取消点赞', '是否登录？', function () {
                wx.navigateTo({
                    url: '/page/login/index'
                })
            }, function () {
            });
        }
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
        this.setData({ page: 1 })
    },
    onLoad: function (options) {
        var self = this;
        var randomNum = parseInt((Math.random() * 1000) + 1);
        self.setData({
            want_watch: randomNum
        })
        var film_info = app.globalData.filmInfo;
        if ((film_info.info)[(film_info.info).length-1] == "瓣"){
            var length = film_info.info.length;
            film_info.info = film_info.info.replace("©豆瓣","");
        }
        film_info.screen_time = turnDate(film_info.screen_time);
        self.setData({
            film_info: film_info
        });
        var data = {
            name_hash : film_info.name_hash
        }
        function turnDate(time){
            if(!time){
                return 0
            }else{
                var date = new Date(parseInt(time) * 1000);
                return date.getFullYear();
            }
        };
      var token = common.getToken();
      if(!!token) {
        console.log(token);
        self.getCollectFilmsList();
      }else{
        self.setData({
          wordsColor: "#fff",
          collectionWords: "收藏",
          collectionSign: "no"
        })
      }
    },
    openActive: function () {
       
    },
    onShareAppMessage: function () {
       
    },
    getUserActivity : function () {
       
    },
    //上拉加载
    onReachBottom: function () {
       var self = this;
       if (self.data.moreReviewFlag){
           self.getFilmReviewsList(page);
       }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        // var self = this;
        // if (self.data.moreReviewFlag) {
        //     self.getFilmReviewsList(page);
        // }
        wx.stopPullDownRefresh();
    },

})
