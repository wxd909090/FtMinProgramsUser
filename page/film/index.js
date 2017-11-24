var app = getApp();
const config = require('../../config').config;
const api = require('../../config').api;
const common = require('../common/js/common.js');
var page = 1;
Page({
    data: {
        focus:false,
        hidden: false,
        imageBaseUrl: config.imageUrl,
        UI: config.imageUrl + "ftang/appUI/",
        isShowStore: false,
        keyWord: '',//电影的搜索条件
        loadText: ['上拉加载更多', '没有更多了'],
        loadTextIndx: 0,
        storeInfo: [],
        baseMap:"image/baseMap/baseMap.jpg",
        filmList1: [
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" },
        { film_name: 15515, grade: 9.0, director: "anfkjahfh", protagonist: "sagnkjsahg" }
        ],
        filmList: [],
        showMovieXfSrc : false,
        movieXfSrc:"",
        posterImg:"",
        showMovieXfImg:true,
        isShowStoreFilmSearch: false,
        searchName : "",
        activity_sn : "",
        isShowVouchers : false,
        isShowGetVouchers : true,
        isShowVouchersInfo: false,
        couponList : [],
        filmFlag : "film",
        showLoveActive:false,
        image_error: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/error_bear.jpg",


        hotFilms:[],
        getNewFilmList:[],
        getSpecialList:[],
        hasNoHotFilm:"",
        hasNoAddFilm:"",
        hasNoSpecial:""
    },
    onShow: function () {
        if (app.globalData.storeInfo != null) {
            this.setData({ isShowStore: true });
            this.setData({ storeInfo: app.globalData.storeInfo });
            } else {
            this.setData({ isShowStore: false });
            }
            if (app.globalData.storeInfo != app.globalData.oldStoreInfo){
            if (app.globalData.storeInfo){
                page = 1;
                this.setData({ loadTextIndx: 0, filmList: [] });
                // this.setData({ hidden: false });
                // this.getFilmList();
                this.getHotFilm();
                this.getNewFilmList();
                this.getSpecialList();
            }
        }
        this.getUserActivity();
        // common.updateUserInfo()
        // console.log(common.errMsg({'code':1001,msg:"自定义"}));
        
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
    },
    onLoad: function (options) {
        // console.log(options);
        this.setData({ hidden: false });
        var self = this;
        self.openActive();
        this.getStoreList();
        this.getVideo();
    },
    jumpsearch:function(){
      wx.navigateTo({
        url: '../static/moreFilms/moreFilms',
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
    jumpMoreFilms:function(e){
      var dom = e.currentTarget;
      var text = dom.dataset.name;
      wx.navigateTo({
        url: '../static/searchFilms/searchFilms?sign=' + text,
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
    //热映
    getHotFilm: function () {
      var self = this;
      var data = {};
      data['store_sn'] = this.data.storeInfo.store_sn;
      data['count'] = 10;
      wx.request({
        url: api.getHotFilms,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data.data;
          self.setData({
            hotFilms: data,
            hasNoHotFilm: "暂无热映电影"
          })
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
    getHotFilmPic: function (e) {
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var hotFilms = self.data.hotFilms;
      for (var i = 0; i < hotFilms.length; i++) {
          var obj = hotFilms[i];
          if (obj['image'] == src) {
              obj['image'] = "/image/baseMap/baseMap.jpg";
          }
      }
      self.setData({
          hotFilms: hotFilms
      })
    },
    //最近更新
    getNewFilmList: function () {
      var self = this;
      var data = {};
      data['store_sn'] = this.data.storeInfo.store_sn;
      data['count'] = 10;
      wx.request({
        url: api.getNewFilmList,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data.data;
          if(res.data.code == 0){
              self.setData({
                  getNewFilmList: data,
                  hasNoAddFilm:"暂无最近更新"
              });
              if (self.data.getNewFilmList.length == 0){
                  common.showMsg('当前门店暂无电影', '是否切换？', function () {
                      wx.switchTab({ url: '/page/store/index' });
                  }, function () {
                  });
              }
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
    getNewFilmListPic:function(e){
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var getNewFilmList = self.data.getNewFilmList;
      for (var i = 0; i < getNewFilmList.length; i++){
        var obj = getNewFilmList[i];
        if(obj['image'] == src){
          obj['image'] = "/image/baseMap/baseMap.jpg";
        }
      }
      self.setData({
        getNewFilmList: getNewFilmList
      })
    },
    //专题合集
    getSpecialList: function () {
      var self = this;
      var data = {};
    //   data['store_sn'] = this.data.storeInfo.store_sn;
      wx.request({
        url: api.getSpecialList,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data.data;
          self.setData({
            getSpecialList: data,
            hasNoSpecial:"暂无专题合集"
          })
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
    getSpecialListPic: function (e) {
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var getSpecialList = self.data.getSpecialList;
      for (var i = 0; i < getNewFilmList.length; i++) {
        var obj = getSpecialList[i];
        if (obj['image'] == src) {
          obj['image'] = "/image/baseMap/baseMap.jpg";
        }
      }
      self.setData({
        getSpecialList: getSpecialList
      })
    },
    // 活动时间
    openActive: function () {
        var self = this;
        var todayDate = new Date().getTime() / 1000;
        if (todayDate < 1504886401) {
            setTimeout(function () {
                self.setData({
                showLoveActive: true
                });
            }, 500)
        }
    },

    // 查看电影详情
    gotoDetailFilm: function (event){
        //获取电影详情
        var that = this;
        // that.setData({ hidden: false });
        wx.showToast({
            title: '加载中',
            mask: true,
            icon: 'loading',
            duration: 2000
        })
        var film_info = event.currentTarget.dataset.film_info;
        app.globalData.filmInfo = film_info;
        wx.navigateTo({
            url: '/page/film/pages/detailFilm/detailFilm',
            success: function () {
                // that.setData({hidden:true});
            },
            complete: function () {
                // that.setData({hidden:true});
            }
        });
    },
    //查看合集
    gotoSpecialList:function(event){
      //获取电影详情
      var that = this;
      // that.setData({ hidden: false });
    //   wx.showToast({
    //     title: '加载中',
    //     mask: true,
    //     icon: 'loading',
    //     duration: 2000
    //   })
      var film_info = event.currentTarget.dataset.film_info;
      app.globalData.filmInfo = film_info;
      wx.navigateTo({
        url: '/page/static/collectionFilms/collectionFilms',
        success: function () {
          // that.setData({hidden:true});
        },
        complete: function () {
          // that.setData({hidden:true});
        }
      });
    },
    onShareAppMessage: function () {
        // 用户点击右上角分享
        return {
            title: '青柠影咖', // 分享标题
            desc: '提供无人观影体验', // 分享描述
            path: '/page/film/index?user_sn=123', // 分享路径
            success:function(res){
                //console.log(res);
            }
        }
    },
    getUserActivity : function () {
        var self = this;
        var token = common.getToken();
        if(!token){
        return;
        }
        wx.request({
        url: api.getUserActivity,
        data: { token : token},
        success: function (res) {
            if (res.data.code == 0){
                if (res.data.data.length > 0) {
                    self.setData({ activity_sn: res.data.data[0].activity_sn });
                    self.setData({ isShowVouchers: true })
                }
            }
        },
        fail: function () {

        },
        complete: function () {
            self.setData({
                hidden: true
            })
        }
        })
    },
    choose: function (event) {
        //预定电影
        var film_info = event.target.dataset.film_info;
        if (film_info.is_play == 0){
        if (app.globalData.storeInfo){
            if (app.globalData.storeInfo.mobile){
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
            common.showMsg("温馨提示", "电影正在院线上映，请到店咨询！", function () {
            return;
            });
        }
        return;
        };
        app.globalData.filmInfo = film_info;
        if (app.globalData.storeInfo != null) {
            if (app.globalData.storeInfo.status == 2) {
                common.showMsg("温馨提示", "该门店暂停营业，请选择其他门店！",function(){
                    wx.switchTab({ url: '/page/store/index' });
                });
                return;
            }
        app.globalData.roomInfo = null;
        wx.navigateTo({ url: '/page/room/index?enterType=0' });
        } else {
            wx.switchTab({ url: '/page/store/index' });
        }
    },
    //上拉加载
    onReachBottom: function () {
        if (this.data.loadTextIndx == 0) {
            // this.setData({ hidden: false });
            // this.getFilmList(this.data.keyWord);
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        page = 1;
        this.setData({ loadTextIndx: 0 })
        wx.stopPullDownRefresh();
        // this.getFilmList();
        this.setData({
            searchName: "",
            keyWord : ""
        })
    },
    clearStore: function () {
        app.globalData.storeInfo = null;
        this.setData({ isShowStore: false });
    },
    gotoFilmDetail(event) {
        //获取电影详情
        var that = this;
        // that.setData({ hidden: false });
        wx.showToast({
            title: '加载中',
            mask: true,
            icon: 'loading',
            duration: 2000
        })
        var film_info = event.currentTarget.dataset.film_info;
        app.globalData.filmInfo = film_info;
        wx.navigateTo({
            url: '/page/film/pages/filmDetail/filmDetail',
            success: function () {
                // that.setData({hidden:true});
            },
            complete: function () {
                // that.setData({hidden:true});
            }
        });
    },
    bindKeyWordInput: function (e) {
        //获取输入框的内容
        this.setData({
            keyWord: e.detail.value
        })
    },
    searchFilm: function () {
        // this.setData({ isShowStoreFilmSearch: true, focus: true});
        //搜索电影
        page = 1;
        this.setData({ loadTextIndx: 0, filmList: [] })
        // this.getFilmList(this.data.keyWord);
    },
    searchBlur: function () {
        this.setData({ isShowStoreFilmSearch: false, focus: false });
        if (this.data.keyWord == ""){
            // this.getFilmList();
        }
    },
    searchText: function (e) {
        var value = e.detail.value;
        this.data.keyWord = value;
        this.setData({ keyWord: value});
        // if (value.length > 0){
        //   this.searchFilm();
        // }
        if (value == ""){
            this.setData({ loadTextIndx: 0, filmList: [] });
            page = 1;
            // this.getFilmList();
        }
    },
    clearInput : function(){
        page = 1;
        this.setData({ loadTextIndx: 0 })
        this.data.searchName = "";
        this.setData({ searchName: "" });
        this.data.keyWord = "";
        this.setData({ keyWord: "" });
        // this.getFilmList();
    },
    openLocation: function (event) {
        // //获取门店地图位置
        // var storeInfo = event.currentTarget.dataset.storeinfo;
        // wx.openLocation({
        //     longitude: Number(storeInfo.path_y),
        //     latitude: Number(storeInfo.path_x),
        //     name: storeInfo.name,
        //     address: storeInfo.address
        // });
        //获取门店地图位置
        // var storeInfo = event.currentTarget.dataset.storeinfo;
        // wx.openLocation({
        //     longitude: Number(storeInfo.path_y),
        //     latitude: Number(storeInfo.path_x),
        //     name: storeInfo.name,
        //     address: storeInfo.address
        // })
        var storeInfo = event.currentTarget.dataset.storeinfo;
        wx.navigateTo({
            url: '/page/store/pages/storeDetail/storeDetail?store_info=' + JSON.stringify(storeInfo),
        })
    },
    getFilmList: function (keyWord = '') {
        var self = this;
        self.setData({ hidden: false });
        var Param = {
        page: page,
        // store_sn: storeSN
        // keyWord: 
        }
        if (app.globalData.storeInfo != null){
        Param['store_sn'] = app.globalData.storeInfo.store_sn;
        }
        if (keyWord != ''){
        Param['key_word'] = keyWord;      
        }

        wx.request({
        url: api.getFilmList,
        data: Param,
        header: {
            'content-type': 'application/json'
        },
        success: function (res) {
            // console.log(res.data.data.list.data);
            if (res.data.code == 0) {
                if (res.data.data.list.updateCount){
                    self.setData({
                        msgData: "电影共有" + res.data.data.list.allCount + "部，本月更新" + res.data.data.list.updateCount + "部"
                    });
                }
                self.setData({ hidden: true });
                if (res.data.data.list.data.length > 0) {
                    var list = self.data.filmList;
                    if (page == 1) {
                    list = res.data.data.list.data;
                    } else {
                    list = list.concat(res.data.data.list.data);
                    }

                    self.setData({ filmList: list, imageBaseUrl: res.data.data.imageBaseUrl });
                    // self.setData({ imageBaseUrl: res.data.data.imageBaseUrl});
                    app.globalData.imageUrl = res.data.data.imageBaseUrl;
                    app.globalData.imageBaseUrl = res.data.data.imageBaseUrl;

                    if (res.data.data.list.data.length == 10) {
                    page++;
                    } else {
                    self.setData({ loadTextIndx: 1 });
                    }
                }
                else {
                    self.setData({ loadTextIndx: 1 });
                }
            } else {
            // common.showMsg('');
            }
        },
        complete: function () {
            self.setData({ hidden: true });
            wx.hideNavigationBarLoading();
            wx.stopPullDownRefresh();
            app.globalData.oldStoreInfo = app.globalData.storeInfo;
        }
        })
    },
    getVideo: function () {
        var self = this;
        wx.request({
        url: api.getVideo,
        data: {},
        header: {
            'content-type': 'application/json'
        },
        success: function (res) {
            // console.log(res.data.data.list.data);
            if (res.data.code == 0) {
            if (!(res.data.data instanceof Array)){
                self.setData({ movieXfSrc: res.data.data.url });
                self.setData({ posterImg: res.data.data.image });
                self.setData({ showMovieXfSrc: true });
            }else{
                self.setData({ showMovieXfSrc: false });
            }
            } else {
            // common.showMsg('');
            console.log('电影先锋拉取失败信息:' + res.data);
            }
        },
        complete: function () {
        }
        })
    },
    hideImg: function() {
        var self = this;
        self.setData({ showMovieXfImg: false });
    },
    imgae_err: function (e) {
        var idx = e.currentTarget.dataset.index;
        var param = {};
        var str = "filmList[" + idx + "].image";
        var img_url = "ftang/appUI/film_img_err.png";
        if (this.data.imageBaseUrl == '' || this.data.imageBaseUrl == null || this.data.imageBaseUrl == undefined){
        img_url = this.data.UI + "ftang/appUI/film_img_err.png";
        }
        param[str] = "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/error_bear.jpg";
        this.setData(param);
    },

    //获取距离最近门店
    /**
     * 1.先判断本地存储中是否有location，
     * 2.有的话不需定位直接拉取门店，
     * 3.没有的话重新定位，定位成功之后再拉取门店信息,设置globalData.storeInfo
     * 4.根据门店store_sn获取电影
     * 
     */
    getStoreList: function () {
        
        var self = this;
        self.setData({ hidden: false });
        wx.getStorage({
        key: 'myLocation',
        success: function (res) {
            wx.request({
            url: api.getStoreList,
            data: {
                'latitude': res.data.latitude,
                'longitude': res.data.longitude
            },
            method: "post",
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {

                // self.setData({ storeList: res.data.data });
                var store = self.getShortDistance(res.data.data);
                app.globalData.storeInfo = store;
                self.setData({ storeInfo: app.globalData.storeInfo });
                self.setData({"isShowStore":true});
                self.setData({ filmList: [] });
                page = 1;
                app.moreFilms = self.data.storeInfo.store_sn;
                self.getHotFilm();
                self.getNewFilmList();
                self.getSpecialList();
                //self.getFilmList();
                // console.log(this.storeInfo);
                // setTimeout(function () {
                //   console.log(self.storeInfo);
                //   self.getHotFilm();
                // }, 5000)
            },
            complete: function () {
                wx.stopPullDownRefresh();
                
                
            }
            })
        },
        fail : function (){
            wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                if (res.errMsg == "getLocation:ok") {
                // console.log("wxGetMyLocation success");
                app.globalData.myLocation = { latitude: res.latitude, longitude: res.longitude };
                wx.setStorageSync('myLocation', app.globalData.myLocation)
                wx.request({
                    url: api.getStoreList,
                    data: {
                    'latitude': res.latitude,
                    'longitude': res.longitude
                    },
                    method: "post",
                    header: {
                    'content-type': 'application/json'
                    },
                    success: function (res) {
                    // self.setData({ storeList: res.data.data });
                    var store = self.getShortDistance(res.data.data);
                    app.globalData.storeInfo = store;
                    self.setData({ storeInfo: app.globalData.storeInfo });
                    self.setData({ "isShowStore": true });
                    self.setData({ filmList: [] });
                    page = 1;
                    app.moreFilms = self.data.storeInfo.store_sn;
                    self.getHotFilm();
                    self.getNewFilmList();
                    self.getSpecialList();
                    // self.getFilmList();
                    },
                    complete: function () {
                    wx.stopPullDownRefresh();
                    }
                })
                } else {
                console.log("wxGetMyLocation fail:" + res.errMsg);
                }

            },
            fail: function (res) {
                console.log("授权获取地理位置失败");
                wx.request({
                url: api.getStoreList,
                data: {
                    'latitude': null,
                    'longitude': null
                },
                method: "post",
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    // self.setData({ storeList: res.data.data });
                    if (res.length > 0) {
                    var store = res.data.data[0]
                    }
                    app.globalData.storeInfo = store;
                    self.setData({ filmList: [] });
                    page = 1;
                    // self.getFilmList();
                },
                complete: function () {
                    wx.stopPullDownRefresh();
                }
                })
                self.showModal('无法获取您的地理位置，请删除后再次进入并允许获取您的地理位置');
            }
            });
        }
        })

        // wx.getLocation({
        //   type: 'wgs84',
        //   success: function (res) {
        //     if (res.errMsg == "getLocation:ok") {
        //       // console.log("wxGetMyLocation success");
        //       // app.globalData.myLocation = { latitude: res.latitude, longitude: res.longitude };
        //       // wx.setStorageSync('myLocation', self.globalData.myLocation)
        //       wx.request({
        //         url: api.getStoreList,
        //         data: {
        //           'latitude': res.latitude,
        //           'longitude': res.longitude
        //         },
        //         method: "post",
        //         header: {
        //           'content-type': 'application/json'
        //         },
        //         success: function (res) {
                
        //           // self.setData({ storeList: res.data.data });
        //           var store = self.getShortDistance(res.data.data);
        //           app.globalData.storeInfo = store;
        //           self.setData({ filmList: [] });
        //           page = 1;
        //           self.getFilmList();
        //         },
        //         complete: function () {
        //           wx.stopPullDownRefresh();
        //         }
        //       })
        //     } else {
        //       console.log("wxGetMyLocation fail:" + res.errMsg);
        //     }

        //   },
        //   fail: function (res) {
        //     console.log("授权获取地理位置失败");
        //     wx.request({
        //       url: api.getStoreList,
        //       data: {
        //         'latitude': null,
        //         'longitude': null
        //       },
        //       method: "post",
        //       header: {
        //         'content-type': 'application/json'
        //       },
        //       success: function (res) {
        //         console.log(res)
        //         // self.setData({ storeList: res.data.data });
        //         if(res.length > 0){
        //           var store = res.data.data[0]
        //         }
        //         app.globalData.storeInfo = store;
        //         console.log(app.globalData.storeInfo);
        //         self.setData({filmList:[]});
        //         page = 1;
        //         self.getFilmList();
        //       },
        //       complete: function () {
        //         wx.stopPullDownRefresh();
        //       }
        //     })
        //     self.showModal('无法获取您的地理位置，请删除后再次进入并允许获取您的地理位置');
        //   }
        // });

    },
    // 热映电影错误图片处理
    errorImgHot : function (e) {
        var self = this;
        var index = e.target.dataset.index;
        var hotFilms = self.data.hotFilms;
        hotFilms[index].image = 'http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/baseMap.jpg'
        self.setData({
            hotFilms: hotFilms
        });
    },
    // 最近更新错误图片处理
    errorImgNew: function (e) {
        var self = this;
        var index = e.target.dataset.index;
        var getNewFilmList = self.data.getNewFilmList;
        getNewFilmList[index].image = 'http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/baseMap.jpg'
        self.setData({
            getNewFilmList: getNewFilmList
        });
    },
    getShortDistance(data) {
        var num = data.length;
        var minDistance = 100;
        var store = null;
        for(var i=0; i<num; i++){
        if (parseFloat(data[i].distance) < minDistance){
            minDistance = parseFloat(data[i].distance);
            store = data[i];
        }
        }
        if(store == null){
            store = data[0];
        }
        return store;
    },
    // 切换门店
    chooseStore() {
      app.jumpFilms = "1";//固定标识
      wx.switchTab({ url: '/page/store/index' });
    },
    getVouchersBtn: function () {
        var self = this;
        var token = common.getToken();
        var data = {
        token: token,
        activity_sn: self.data.activity_sn
        }
        wx.request({
        url: api.createCoupon,
        data: data,
        success: function (res) {
            if (res.data.data.length > 0) {
            for (var i = 0; i < res.data.data.length; i++) {
                res.data.data[i].price = parseInt(res.data.data[i].price)
            }
            }
            if (res.data.code == 0) {
            self.setData({ couponList: res.data.data });
            self.setData({ isShowGetVouchers: false });
            self.setData({ isShowVouchersInfo: true });
            } else {
            self.setData({ isShowVouchers: false });
            self.setData({ isShowGetVouchers: true });
            self.setData({ isShowVouchersInfo: false });
            common.errMsg(res.data);
            }
        },
        fail: function () {
            self.setData({ isShowVouchers: false });
            self.setData({ isShowGetVouchers: true });
            self.setData({ isShowVouchersInfo: false });
        },
        complete: function () {
            self.setData({
            hidden: true
            })
        }
        })

    },
    closeVouchers: function () {
        // if (app.globalData.filmInfo){
        //   app.globalData.roomInfo = null;
        //   wx.navigateTo({ url: '/page/room/index?enterType=0' });
        // }
        var self = this;
        if (app.globalData.chooseOrderInfo) {
        common.createOrder(app.globalData.chooseOrderInfo.orderInfo, self);
        } else {
        wx.switchTab({ url: '/page/film/index' });
        }
        this.setData({ isShowVouchers: false });
        this.setData({ isShowGetVouchers: true });
        this.setData({ isShowVouchersInfo: false });
    },
    // 关闭七夕节活动
    closeLover: function(){
        var self = this;
        self.setData({
        showLoveActive : false
        })
    },
    //跳转活动界面
    goToActive: function(){
        var self = this;
        self.closeLover();
        wx.navigateTo({ url: '/page/activePic/activePic' });
    },
    //跳转到全部电影
    allFilms:function(){
      wx.navigateTo({
        url: '../static/allFilms/allFilms',
        success: function (res) {
          console.log("成功");
          // try {
          //   wx.setStorageSync('remeberInfo', "");
          //   wx.setStorageSync('remeberNum', "");
          //   //wx.setStorageSync('remeberCarrayShow', "6");
          // } catch (e) {
          // }
        },
        fail: function (data) {
          console.log("失败");
          console.log(data);
        },
        complete: function () {
          console.log("完成");
        }
      })
    }
})
