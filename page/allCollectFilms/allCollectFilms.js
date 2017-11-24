var app = getApp();
const config = require('../../config').config;
const api = require('../../config').api;
const common = require('../common/js/common.js');
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
        baseMap: "image/baseMap/baseMap.jpg",
        noFilms:"none",
        yesFilms:true
    },
    onShow: function () {
       this.setData({
         b:false
       });
       this.getCollectFilms();
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
    },
    onLoad: function (options) {
      var url = api.getCollectionSpecialList;
      var imageBaseUrl = this.data.imageBaseUrl;
      
    },
    // 查看电影详情
    gotoDetailFilm: function (event) {
      //获取电影详情
      var that = this;
      // that.setData({ hidden: false });
    //   wx.showToast({
    //     title: '加载中',
    //     mask: true,
    //     icon: 'loading',
    //     duration: 1000
    //   })
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
    //拉取收藏电影列表
    getCollectFilms: function () {
      //common.getCollectFilmsList();
      var self = this;
      var data = {};
      data['token'] = common.getToken();
      wx.request({
        url: api.getCollectFilms,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          app.globalData.collectFilms = res.data.data.list.data;
          //console.log(res);
          var data = res.data.data.list.data;
          var length = data.length;
          if (length == 0) {
            self.setData({
              noFilms: "block",
              yesFilms:false
            });
          } else {
            self.setData({
              noFilms: "none",
              yesFilms: true
            });
            
          }
          self.setData({
            hotFilms: data,
            imageBaseUrl: "",
            getList: length
          });
          if (length < self.data.count) {
            self.setData({
              loadMore: "block"
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
    //处理电影图片显示错误
    gethotFilmsPic: function (e) {
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
    openActive: function () {
       
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
