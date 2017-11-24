var app = getApp();
const config = require('../../../config').config;
const api = require('../../../config').api;
const common = require('../../common/js/common.js');
var page = 1;
Page({
    data: {
        b: true,
        hotName:[],
        inputValue:'',
        getFilmlList:[],
        filmsList:[],
        allPage:1,
        display_view:"none",
        loadMore:"none",
        hot_words:"block",
        nowPage:1,
        searchData:"none",
        baseMap: "image/baseMap/baseMap.jpg",
        bindInputValue:"none"
    },
    onShow: function () {
       this.setData({
         b:false
       });
       this.getHotFilm();
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
    },
    onLoad: function (options) {

    },
    cancel:function(){
      this.setData({
        inputValue: "",
        filmsList:[],
        hot_words:"block",
        bindInputValue:"none",
        searchData:"none"
      });
    },
    backIndex:function(){
      wx.switchTab({
        url: "../../film/index"
      });
    },
    bindKeyInput: function (e) {
      var self = this;
      self.setData({
        inputValue: e.detail.value
      });
      if (self.data.inputValue.length>0){
        self.setData({
          bindInputValue:"block"
        })
      }else{
        self.setData({
          bindInputValue: "none"
        })
      }
    },
    //点击搜索
    searchFilm:function(){
      var self = this;
      self.setData({
        allPage:1,
        hot_words:"none",
        nowPage:1,
        filmsList:[]
      });
      var data = {};
      data['type'] = 0;
      data['key_word'] = self.data.inputValue;
      data['store_sn'] = app.moreFilms;
      var num = 1;
      self.keyWord(data, num);
    },
    //key_word搜索
    keyWord:function(data,num){
      var self= this;
      wx.request({
        url: api.getConditionFilmList+"?page=" + num,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data.data.list.data;
          if(data.length>0){
            var allData = self.data.filmsList;
            var newAllData = allData.concat(data)
            self.setData({
              filmsList: newAllData,
              allPage: res.data.data.list.last_page,
              searchData:"none",
              display_view:"block"
            })
          }else{
            self.setData({
              loadMore:"none",
              searchData:"block",
              display_view: "none"
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
    },
    getfilmsListPic: function (e) {
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var filmsList = self.data.filmsList;
      for (var i = 0; i < filmsList.length; i++) {
        var obj = filmsList[i];
        if (obj['image'] == src) {
          obj['image'] = "/image/baseMap/baseMap.jpg";
        }
      }
      self.setData({
        filmsList: filmsList
      })
    },
    //热映
    getHotFilm: function () {

      var self = this;
      var data = {};
      var mess = app.globalData.storeInfo.store_sn;
      data['store_sn'] = mess;
      data['count'] = 8;
      wx.request({
        url: api.getHotFilms,
        data: data,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          var data = res.data.data;
          console.log(data);
          self.setData({
            hotName: data
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
      if (self.data.nowPage < self.data.allPage) {
        // wx.showToast({
        //   title: '加载中',
        //   mask: true,
        //   icon: 'loading',
        //   duration: 1500
        // });
        var num = ++self.data.nowPage;
        self.setData({
          nowPage:num
        })
        var data = {};
        data['type'] = 0;
        data['key_word'] = self.data.inputValue;
        data['store_sn'] = app.moreFilms;
        self.keyWord(data, num);
      }else{
        self.setData({
          loadMore:"block"
        })
      }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    }
    })
