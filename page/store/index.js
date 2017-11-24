var app = getApp();
const api = require('../../config').api;
const conf = require('../../config').config;
const common = require('../common/js/common.js');
Page({
  data: {
    imageUrl:null,
    hidden: false,
    loadText: ['上拉加载更多', '没有更多了'],
    loadTextIndx: 0,
    region: ['全部', '高新区', '龙泉驿区', '成华区', '双流'],
    region_index: 0,
    storeList: [],
    isShowFilm: false,
    filmInfo: [],
    keyWord: '',
    navigateToNextDelta: false,
    jumpSign:1
  },
  onLoad: function () {
    this.getStoreList();
    // console.log("onload")
  },
  onShow: function (options) {
    
    // console.log(options); 
    if (app.globalData.filmInfo != null) {
      // console.log(app.globalData.imageUrl);
      // console.log(app.globalData.filmInfo);
      this.setData({ imageUrl: app.globalData.imageUrl });
      this.setData({ isShowFilm: true });
      this.setData({ filmInfo: app.globalData.filmInfo});
    } else {
      this.setData({ isShowFilm: false });
    }
  
    // var sign = app.jumpAllFilmsCopy;
    // ++sign;
    // var fixSign = app.jumpFilms;//固定标识
    // var newJumpSign = app.jumpAllFilms;//动态标识
    // if (fixSign == 2){
    //   if (newJumpSign == sign){
    //     app.jumpAllFilms = 1;
    //     app.jumpAllFilmsCopy = 1;
    //   }else{
    //     app.jumpAllFilms = 1;
    //     app.jumpAllFilmsCopy = 1;
    //     wx.switchTab({ url: '/page/film/index' });
    //   }
    // }
  },
  //上拉加载
  // onReachBottom: function () {
  //   this.getStoreList();
  // },

  //下拉刷新 
  onPullDownRefresh:function(){
    this.getStoreList();
  },
  bindPickerChange: function (e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region_index: e.detail.value
    })
  },
  bindKeyWordInput: function () {
    //获取输入框的内容
    this.setData({
      keyWord: e.detail.value
    })
  },
  searchStore: function () {
    //搜索门店
  },
  openLocation: function (event) {
    //获取门店地图位置
    var storeInfo = event.currentTarget.dataset.storeinfo;
    // var path_x = Number(Number(storeInfo.path_x).toFixed(6));
    // var path_y = Number(Number(storeInfo.path_y).toFixed(6));
    // wx.openLocation({
    //   longitude: path_y,
    //   latitude: path_x,
    //   name: storeInfo.store_name,
    //   address: storeInfo.address
    // });
    wx.navigateTo({
      url: '/page/store/pages/storeDetail/storeDetail?store_info=' + JSON.stringify(storeInfo),
    })
  },
  //获取我的地图位置 
  getMyLocation: function () {
    var ret = { longitude: 0, latitude: 0 };
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        ret.longitude = res.longitude;
        ret.latitude = res.latitude;
      }
    });
    return ret;
  },
  choose: function (event) {
    // this.setData({
    //   navigateToNextDelta:true
    // });
    var store_info = event.target.dataset.store_info;
    console.log(store_info);
    if (store_info.status == 2){
      common.showMsg("温馨提示", "该门店暂停营业，请选择其他门店！");
      return;
    }
    app.globalData.storeInfo = store_info;
    app.moreFilms = store_info.store_sn;;
    app.globalData.newStoreData = "";
    // 如果是所有电影界面跳转过来，选择之后跳转回去
    if (app.globalData.allFilmPageFlag){
      app.globalData.remeberInfo = "";
      app.globalData.remeberNum = "";
        wx.navigateTo({ url: '/page/static/allFilms/allFilms' });
        app.globalData.allFilmPageFlag = false;
        return;        
    }
    wx.switchTab({ url: '/page/film/index' });
    // if (app.globalData.filmInfo != null) {
    //   wx.navigateTo({ url: '/page/room/index?enterType=0' });
    // } else {
    //   app.globalData.newStoreData = "";
    //   wx.switchTab({ url: '/page/film/index' });
    // }
  },
  clearFilm: function () {
    app.globalData.filmInfo = null;
    this.setData({ isShowFilm: false });
  },
  gotoFilmDetail(event) {
    // console.log(event);
    var film_info = event.currentTarget.dataset.film_info
    wx.navigateTo({ url: '/page/film/pages/filmDetail/filmDetail?film_info=' + JSON.stringify(film_info) });
  },
  getStoreList: function () {
    var self = this;
    self.setData({ hidden: false });
    var myLocation = common.getMyLocation();
    wx.request({
      url: api.getStoreList,
      data: {
        'latitude': myLocation.latitude,
        'longitude': myLocation.longitude
      },
      method: "post",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({ storeList: res.data.data });
        self.setData({ hidden: true });
      },
      complete: function () {
        self.setData({ hidden: true });
        wx.stopPullDownRefresh();
      }
    })

  }
})