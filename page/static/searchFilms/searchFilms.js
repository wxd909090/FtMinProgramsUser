var app = getApp();
const config = require('../../../config').config;
const api = require('../../../config').api;
const common = require('../../common/js/common.js');
var page = 1;
Page({
    data: {
        b: true,
        imageBaseUrl: config.imageUrl,
        hotFilms: [],
        getNewFilmList: [],
        getSpecialList: [],
        sign:'',
        loadMore:"none",
        count:12,
        num:1,
        getList:12,
        baseMap: "image/baseMap/baseMap.jpg"
    },
    onShow: function () {
       this.setData({
         b:false
       })
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
    },
    onLoad: function (options) {
      var self = this;
      var text = options.sign;
      self.setData({
        sign: text
      })
      if(text == 1){
        var url = api.getHotFilms;
        var imageBaseUrl = self.data.imageBaseUrl;
      }else if(text == 2){
        var url = api.getNewFilmList;
        var imageBaseUrl = self.data.imageBaseUrl;
      } else if(text == 3){
        var url = api.getSpecialList;
        var imageBaseUrl = "";
      }
      self.getHotFilm(url, imageBaseUrl,text);
    },
    // 查看电影详情
    gotoDetailFilm: function (event) {
      var text = this.data.sign;
      if(text == 3){
        //获取电影详情
        var that = this;
        // that.setData({ hidden: false });
        // wx.showToast({
        //   title: '加载中',
        //   mask: true,
        //   icon: 'loading',
        //   duration: 1000
        // })
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
      }else{
        //获取电影详情
        var that = this;
        // that.setData({ hidden: false });
        // wx.showToast({
        //   title: '加载中',
        //   mask: true,
        //   icon: 'loading',
        //   duration: 2000
        // })
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
        console.log("ssssssss")
      }
    },

    gotoFilmDetail(event) {
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
        url: '/page/film/pages/filmDetail/filmDetail',
        success: function () {
          // that.setData({hidden:true});
        },
        complete: function () {
          // that.setData({hidden:true});
        }
      });
    },
    gethotFilmsPic:function(e){
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
    //热映
    getHotFilm: function (url, imageBaseUrl,text) {
      
      var self = this;
      var data = {};
      data['store_sn'] = app.moreFilms;
      data['count'] = self.data.count;
      wx.request({
        url: url,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data.data;
          var length = data.length;
          console.log(data);
          self.setData({
            hotFilms: data,
            imageBaseUrl: imageBaseUrl,
            getList: length
          });
          if(text == 1){
            wx.setNavigationBarTitle({
              title: "热映电影"//页面标题为路由参数
            })
          }else if(text == 2){
            wx.setNavigationBarTitle({
              title: "最近更新"//页面标题为路由参数
            })
          }else if(text == 3){
            wx.setNavigationBarTitle({
              title: "专题合集"//页面标题为路由参数
            })
          }
          if (length < self.data.count){
            self.setData({
              loadMore:"block"
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
          });
        //   wx.showToast({
        //     title: '加载中',
        //     mask: false,
        //     icon: 'loading',

        //   });
        }
      })
    },
    openActive: function () {
       
    },
    onShareAppMessage: function () {
       
    },
    getUserActivity : function () {
       
    },
    //上拉加载
    onReachBottom: function () {
      
      console.log(this.data.count);
      var self = this;
      if (self.data.count == self.data.getList){
        // wx.showToast({
        //   title: '加载中',
        //   mask: true,
        //   icon: 'loading',
        //   duration: 2000
        // });
        
        var num = ++self.data.num;
        var countNum = num * 12;
        self.setData({
          count: countNum,
          hidden : false
        });
        var text = self.data.sign;
        if (text == 1) {
          var url = api.getHotFilms;
          var imageBaseUrl = self.data.imageBaseUrl;
        } else if (text == 2) {
          var url = api.getNewFilmList;
          var imageBaseUrl = self.data.imageBaseUrl;
        } else if (text == 3) {
          var url = api.getSpecialList;
          var imageBaseUrl = "";
        }
        self.getHotFilm(url, imageBaseUrl, text);
      }
    },
    //下拉刷新
    onPullDownRefresh: function () {
      var text = this.data.sign;
      if (text == 1) {
        var url = api.getHotFilms;
        var imageBaseUrl = self.data.imageBaseUrl;
      } else if (text == 2) {
        var url = api.getNewFilmList;
        var imageBaseUrl = self.data.imageBaseUrl;
      } else if (text == 3) {
        var url = api.getSpecialList;
        var imageBaseUrl = "";
      }
      self.getHotFilm(url, imageBaseUrl, text);
      wx.stopPullDownRefresh();
    }
    })
