var app = getApp();
const config = require('../../../config').config;
const api = require('../../../config').api;
const common = require('../../common/js/common.js');
var page = 1;
Page({
    data: {
        UI: config.imageUrl + "ftang/appUI/",
        loadText: ['上拉加载更多', '没有更多了'],
        image_error: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/error_bear.jpg",
        storeInfo:null,
        getFilmlList:[],
        allCondition:{},
        isShowStore:true,
        b: true,
        condition3: [{ "name": "排行榜", "border": "1rpx solid #5fbe51", "color": "#7fcb74" }, { "name": "评分榜", "border": "0px", "color": "#000" }],
        // condition1: [{ "name": "全部类型", "border": "1rpx solid #5fbe51", "color": "#7fcb74" }, { "name": "剧情", "border": "0rpx", "color": "#000" }, { "name": "爱情", "border": "0rpx", "color": "#000" }, { "name": "喜剧", "border": "0px", "color": "#000" }, { "name": "科幻", "border": "0px", "color": "#000" }, { "name": "动作", "border": "0px", "color": "#000" }, { "name": "悬疑", "border": "0px", "color": "#000" }, { "name": "犯罪", "border": "0px", "color": "#000" }, { "name": "恐怖", "border": "0px", "color": "#000" }, { "name": "青春", "border": "0px", "color": "#000" }, { "name": "励志", "border": "0px", "color": "#000" }, { "name": "战争", "border": "0px", "color": "#000" }, { "name": "文艺", "border": "0px", "color": "#000" }, { "name": "传记", "border": "0px", "color": "#000" }, { "name": "家庭", "border": "0px", "color": "#000" }],
        condition1: [{ "name": "全部类型", "border": "1rpx solid #5fbe51", "color": "#7fcb74" }, { "name": "剧情", "border": "0rpx", "color": "#000" }, { "name": "爱情", "border": "0rpx", "color": "#000" }, { "name": "喜剧", "border": "0px", "color": "#000" }, { "name": "科幻", "border": "0px", "color": "#000" }, { "name": "动画", "border": "0px", "color": "#000" },{ "name": "动作", "border": "0px", "color": "#000" }, { "name": "悬疑", "border": "0px", "color": "#000" }, { "name": "犯罪", "border": "0px", "color": "#000" }, { "name": "恐怖", "border": "0px", "color": "#000" },   { "name": "战争", "border": "0px", "color": "#000" }],
        condition2: [{ "name": "全部年份", "border": "1rpx solid #5fbe51", "color": "#7fcb74" },{ "name": 2017, "border": "0rpx", "color": "#000" }, { "name": 2016, "border": "0rpx", "color": "#000" }, { "name": 2015, "border": "0rpx", "color": "#000" }, { "name": 2014, "border": "0rpx", "color": "#000" }, { "name": 2013, "border": "0rpx", "color": "#000" }, { "name": 2012, "border": "0rpx", "color": "#000" }, { "name": 2011, "border": "0rpx", "color": "#000" }, { "name": "2010-2000", "border": "0rpx", "color": "#000" }, { "name": "更早", "border": "0rpx", "color": "#000"  }],
        allPage:1,
        nowPage:1,
        allFilms:[],
        baseMap: "image/baseMap/baseMap.jpg",
        showConditionView:false,
        showConditions: [{ "name": "排行榜" }, { "name": "全部类型" }, { "name": "全部年份" }],
        headView:"block",
        changeOptions:true,
        noMoreFilms:false,
        hitMovies:true,
        jumpSign:1
    },
    // onShow: function () {
    //    this.setData({
    //      b:false
    //    });
    //    var newData = {};
    //    var store_sn = app.globalData.storeInfo;
    //    store_sn = store_sn.store_sn;
    //    newData['store_sn'] = store_sn;
    //    var allCondition = {};
    //    allCondition['store_sn'] = store_sn;
    //    this.setData({
    //        allCondition : allCondition
    //    })
    //    var url = 1;
    //    this.allConditionFunc(newData, url);
    //   //  app.jumpAllFilms = 1;
    //   //  app.jumpAllFilmsCopy = 1;
    //     hitMovies:true
    //     // remeberNum:1,
    //     // remeberInfo:{}
    // },
    onShow: function () {
      //var signShow = wx.getStorageSync('remeberCarrayShow');
      //if (signShow == "6"){
        // this.setData({
        //   b:false
        // });
        // var newData = {};
        // var storeInfo = app.globalData.storeInfo;
        // var store_sn = storeInfo.store_sn;
        // var url = 1;
        //   newData['store_sn'] = store_sn;
        //   var allCondition = {};
        //   allCondition['store_sn'] = store_sn;
        //   this.setData({
        //     allCondition: allCondition
        //   })
        // this.allConditionFunc(newData, url);
      //}else{}
    },
    onHide: function(){
        this.setData({ isShowVouchers: false })
    },
    onLoad: function (options) {
        var self = this;
        var storeInfo = app.globalData.storeInfo;
        self.setData({
            storeInfo: storeInfo
        });
        this.setData({
          b: false
        });
        var newData = {};
        var storeInfo = app.globalData.storeInfo;
        var store_sn = storeInfo.store_sn;
        var url = 1;
        newData['store_sn'] = store_sn;
        var allCondition = {};
        allCondition['store_sn'] = store_sn;
        this.setData({
          allCondition: allCondition
        })
        this.allConditionFunc(newData, url);
    },
    // 切换门店
    chooseStore() {
        app.globalData.allFilmPageFlag = true
        wx.switchTab({ url: '/page/store/index' });
    },
    // 门店详情
    openLocation: function (event) {
        var storeInfo = event.currentTarget.dataset.storeinfo;
        wx.navigateTo({
            url: '/page/store/pages/storeDetail/storeDetail?store_info=' + JSON.stringify(storeInfo),
        })
    },
    changeCondition1: function (event){
      var self = this;
      var dom = event.currentTarget;
      var num = dom.id;
      // var newCondition = [{ "name": "全部类型", "border": "0rpx", "color": "#000" }, { "name": "剧情", "border": "0rpx", "color": "#000" }, { "name": "爱情", "border": "0rpx", "color": "#000" }, { "name": "喜剧", "border": "0px", "color": "#000" }, { "name": "科幻", "border": "0px", "color": "#000" }, { "name": "动作", "border": "0px", "color": "#000" }, { "name": "悬疑", "border": "0px", "color": "#000" }, { "name": "犯罪", "border": "0px", "color": "#000" }, { "name": "恐怖", "border": "0px", "color": "#000" }, { "name": "青春", "border": "0px", "color": "#000" }, { "name": "励志", "border": "0px", "color": "#000" }, { "name": "战争", "border": "0px", "color": "#000" }, { "name": "文艺", "border": "0px", "color": "#000" }, { "name": "传记", "border": "0px", "color": "#000" }, { "name": "家庭", "border": "0px", "color": "#000" }];
      var newCondition = [{ "name": "全部类型", "border": "0rpx", "color": "#000" }, { "name": "剧情", "border": "0rpx", "color": "#000" }, { "name": "爱情", "border": "0rpx", "color": "#000" }, { "name": "喜剧", "border": "0px", "color": "#000" }, { "name": "科幻", "border": "0px", "color": "#000" }, { "name": "动画", "border": "0px", "color": "#000" }, { "name": "动作", "border": "0px", "color": "#000" }, { "name": "悬疑", "border": "0px", "color": "#000" }, { "name": "犯罪", "border": "0px", "color": "#000" }, { "name": "恐怖", "border": "0px", "color": "#000" }, { "name": "战争", "border": "0px", "color": "#000" }];
      newCondition[num].border = "1rpx solid #5fbe51";
      newCondition[num].color = "#7fcb74";
      var store_sn = app.globalData.storeInfo;
      store_sn = store_sn.store_sn;
      var newData = self.data.allCondition;
      newData['store_sn'] = store_sn;
      newData['film_type'] = dom.dataset.item;
      var copeNewData = {};
      var newShowConditions = self.data.showConditions;

      if (dom.dataset.item == "全部类型") {
        newShowConditions[1].name = "全部类型"
        for (var attr in newData) {
          if (attr == "film_type") {

          } else {
            copeNewData[attr] = newData[attr]
          }
        }
      } else {
        copeNewData = newData;
        for (var attr in copeNewData) {
          if (attr == "film_type") {
            newShowConditions[1].name = copeNewData[attr]
          }
        };
      };
      self.setData({
        condition1: newCondition,
        allCondition: copeNewData,
        nowPage: 1,
        allFilms:[],
        allPage: 1,
        showConditions: newShowConditions
      });
      var url = 1;
      self.allConditionFunc(copeNewData,url);
    },
    changeCondition2: function (event) {
      // var num = this.getTimeByTimeZone(8);
      var self = this;
      var dom = event.currentTarget;
      var num = dom.id;
      var newCondition = [{ "name": "全部年份" },{ "name": 2017 }, { "name": 2016 }, { "name": 2015 }, { "name": 2014 }, { "name": 2013 }, { "name": 2012 }, { "name": 2011 }, { "name": "2010-2000" }, { "name": "更早" }];
      newCondition[num].border = "1rpx solid #5fbe51";
      newCondition[num].color = "#7fcb74";
      var store_sn = app.globalData.storeInfo;
      store_sn = store_sn.store_sn;
      var newData = self.data.allCondition;
      newData['store_sn'] = store_sn;
      var time = newCondition[num].name;
      // var d = new Date();
      // var localTime = d.getTime();
      var localOffset = -2678400;
      if(parseInt(time)>= 2011){  
        var startTime = new Date(time,1,1).getTime() / 1000;
        var endTime = new Date(time,12,31).getTime() / 1000;  
      } else if (time == "更早"){
          var startTime = "";
          var endTime = parseInt(new Date(1999,12,31).getTime()) / 1000;
      } else if (time == "全部年份"){
        var startTime = "";
        var endTime = "";
      }else{
        var endTime = parseInt(new Date(2010,12,31).getTime()) / 1000;
        var startTime = parseInt(new Date(2000, 1, 1).getTime()) / 1000;
      }
      newData['begin_time'] = startTime + localOffset;
      newData['end_time'] = endTime + localOffset;
      var copyNewData = {};
      if (!startTime && !endTime){  
        for(var attr in newData){
          if (attr == "begin_time" || attr == "end_time"){
          }else{
            copyNewData[attr] = newData[attr]
          }
        }
      } else if (!startTime && !!endTime){
        for (var attr in newData) {
          if (attr == "begin_time") {
          } else {
            copyNewData[attr] = newData[attr]
          }
        }
      }else{
        copyNewData = newData;
      }
      var newShowConditions = self.data.showConditions;
      newShowConditions[2].name = time;
      self.setData({
        condition2: newCondition,
        allCondition: copyNewData,
        nowPage: 1,
        allFilms: [],
        allPage: 1,
        showConditions: newShowConditions
      });
      var url = 1;
      self.allConditionFunc(copyNewData,url);
    },
    changeCondition3: function (event) {
      var self = this;
      var dom = event.currentTarget;
      var num = dom.id;
      var newCondition = [{ "name": "排行榜", "border": "0rpx", "color": "#000" }, { "name": "评分榜", "border": "0px", "color": "#000" }];
      newCondition[num].border = "1rpx solid #5fbe51";
      newCondition[num].color = "#7fcb74";
      var store_sn = app.globalData.storeInfo;
      store_sn = store_sn.store_sn;
      var newData = self.data.allCondition;
      newData['store_sn'] = store_sn;
      if (num == 0){
        newData['order_type'] = 1;
      }else{
        newData['order_type'] = 0;
      }
      self.setData({
        condition3: newCondition,
        allCondition: newData,
        nowPage: 1,
        allFilms: [],
        allPage:1
      });
      var url = 1;
      var newShowConditions = self.data.showConditions;
      for (var attr in newData){
        if (attr == "order_type"){
          if (newData['order_type'] == 0){
            newShowConditions[0].name = "评分榜"
          }else{
            newShowConditions[0].name = "排行榜"
          }
        }
      };
      self.setData({
        showConditions: newShowConditions
      });
      self.allConditionFunc(newData, url);
    },
    allConditionFunc:function(data,url){
      var self = this;
      var num = self.data.allPage;

      //self.data.remeberInfo = data;
      console.log(data);
      console.log(url);
      if (url <= num){
        console.log(num);
        wx.request({
          url: api.getConditionFilmList+"?page="+url,
          data: data,
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            var data = res.data.data.list.data;
            var arr = self.data.allFilms;
            var newArr = arr.concat(data);
            self.setData({
              getFilmlList: newArr,
              allPage: res.data.data.list.last_page,
              allFilms: newArr
            });
            if (newArr.length>0){
              self.setData({
                noMoreFilms: false,
                hitMovies: true
              });
            }else{
              self.setData({
                noMoreFilms: true,
                hitMovies: false
              });
            }
            //var num = url+1;
            // self.setData({
            //   remeberNum: num
            // })
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
        // self.setData({
        //   remeberNum: url
        // })
      }
    },
    getFilmlListPic:function(e){
      var self = this;
      var dom = e.currentTarget;
      var src = dom.dataset.pic;
      var getFilmlList = self.data.getFilmlList;
      for (var i = 0; i < getFilmlList.length; i++) {
        var obj = getFilmlList[i];
        if (obj['image'] == src) {
          obj['image'] = "/image/baseMap/baseMap.jpg";
        }
      }
      self.setData({
        getFilmlList: getFilmlList
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
      var self = this;
      var newData = self.data.allCondition;
      var url = self.data.nowPage;
      ++url;
      
      self.setData({
        nowPage:url,
        hidden: true
      });
      console.log(url);
      console.log(newData);
      self.allConditionFunc(newData, url);
    },
    // 查看电影详情
    gotoDetailFilm: function (event) {
      var that = this;
      //app.globalData.remeberInfo = this.data.remeberInfo;//记住条件
      //app.globalData.remeberNum = this.data.remeberNum;//记住页码
      //本地存储条件和页码
     
      console.log(this.data.allCondition);
      //获取电影详情
      
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
          // try {
          //   wx.setStorageSync('remeberInfo', that.data.remeberInfo);
          //   wx.setStorageSync('remeberNum', that.data.remeberNum);
          //   wx.setStorageSync('remeberCarrayShow', "");
          // } catch (e) {
          // };
          that.setData({hidden:true});
        },
        complete: function () {
            that.setData({
                hidden: true
            })
          // that.setData({hidden:true});
        }
      });
    },
    //下拉刷新
    onPullDownRefresh: function () {
        console.log("onPullDownRefresh");
        wx.stopPullDownRefresh();
    },
    onPageScroll:function(e){
      var self = this;
      if(e.scrollTop >= 150){
        self.setData({
          showConditionView:true
        })
      } else{
        self.setData({
          showConditionView: false
        });
      }
    },
    backView: function(){
      var self = this;
      self.setData({
        showConditionView: false
      });
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
})
