var app = getApp();
const config = require('../../config').config;
const api = require('../../config').api;
const common = require('../common/js/common.js');
var page = 1;
Page({
    data: {
      reduceImg:false,
      packagesNumShow:false,
      packagesNum:0,
      selectedPackage: "/image/package/111.png",

      allPackages:[],//所有数据数组
      selectedView: [],//选择框数组
      addNum:[]//加减数量数组
    },
    onShow: function () {
      var self = this;
      self.getAllpackages();
    },
    onHide: function(){
       
    },
    onLoad: function (options) {
   
    },
    //上拉加载
    onReachBottom: function () {
        
    },
    //下拉刷新
    onPullDownRefresh: function () {
      wx.stopPullDownRefresh();
    },
    //获取全部套餐
    getAllpackages:function(){
      var self = this;
      var data = {};
      data['store_sn'] = app.globalData.storeInfo.store_sn;
      wx.request({
        url: api.getComboListFilms,
        data: data,
        method:"POST",
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res);
          
          var allPackages = res.data.data.data;
          var selectedView = [];
          var addNum = [];

          var obj = {};
          obj['reduce'] = "/image/package/333.png";
          obj['add'] = "/image/package/3333.png";
          obj['num'] = 0;
          obj['reduceImgShow'] = false;

          console.log(self);
          for (var i = 0; i < allPackages.length;i++){
            console.log(self);
            selectedView.push("/image/package/111.png");
            var copyObj = self.copy(obj);
            addNum.push(copyObj);
          }
          console.log(allPackages);
          self.setData({
            allPackages: allPackages,
            selectedView: selectedView,
            addNum: addNum
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
    copy:function(obj){
      var newObj = {};
      for (var item in obj){
        newObj[item] = obj[item];
      } 
      return newObj;
    },
    //事件
    //选择
    selectedPackage:function(e){
      var dom = e.currentTarget;
      var index = dom.dataset.index;
      var srcString = dom.dataset.src;

      var self = this;

      if (srcString == "/image/package/111.png"){
        var arr = self.data.selectedView;
        arr.splice(index, 1, "/image/package/selected.png");
        var num = self.data.addNum;
        num[index].num = 1;
        num[index].reduceImgShow = true;
        self.setData({
          selectedView: arr,
          addNum: num
        })
      }else{
        var arr = self.data.selectedView;
        arr.splice(index, 1, "/image/package/111.png");
        var num = self.data.addNum;
        num[index].num = 0;
        num[index].reduceImgShow = false;
        self.setData({
          selectedView: arr,
          addNum: num
        })
      }
    },
    //增加数量
    addPackageNum:function(e){
      var self = this;

      var dom = e.currentTarget;
      var index = dom.dataset.index;

      var arr = self.data.addNum;

      var num = arr[index].num;
      ++num;
      arr[index]['num'] = num;
      var newArr = self.data.selectedView;
      
      if(num>=1){
        arr[index]['reduceImgShow'] = true;
        newArr.splice(index, 1, "/image/package/selected.png");
      }else{
        arr[index]['reduceImgShow'] = false;
        newArr.splice(index, 1, "/image/package/111.png");
      }
      self.setData({
        addNum:arr,
        selectedView: newArr
      })
      
    },
    //减少数量
    reducePackageNum:function(e){

      var self = this;

      var dom = e.currentTarget;
      var index = dom.dataset.index;

      var arr = self.data.addNum;

      var num = arr[index].num;
      --num;
      arr[index]['num'] = num;
      var newArr = self.data.selectedView;
      if (num == 0) {
        arr[index]['reduceImgShow'] = false;
        newArr.splice(index, 1, "/image/package/111.png");
      } else {
        arr[index]['reduceImgShow'] = true;
        newArr.splice(index, 1, "/image/package/selected.png");
      }
      self.setData({
        addNum: arr,
        selectedView: newArr
      })
    },
    //确定
    sureButton:function(){
        var self = this;
        var snArr = [];//cb_sn组装
        var numArr = [];//数量组装
        //选中套餐
        var selectedView = self.data.selectedView;
        //数量
        var addNum = self.data.addNum;
        //获取cb_sn
        var allPackages = self.data.allPackages;

        //组装套餐数据
        var allSelectPackages = [];
            for (var i = 0; i < selectedView.length; i++){
                if (selectedView[i] == "/image/package/selected.png"){
                    numArr.push(addNum[i].num);
                    snArr.push(allPackages[i].cb_sn);
                    allSelectPackages.push(allPackages[i]);
                }
            };
        var comArr = [];
        var obj = {};
        obj['num'] = 0;
        obj['cb_sn'] = 0;
        for (var i = 0; i < numArr.length; i++) {
            obj['num'] = numArr[i];
            obj['cb_sn'] = snArr[i];
            var copyObj = self.copy(obj);
            comArr.push(copyObj);
        };
        try {
            wx.setStorageSync('allpackages', comArr);
            wx.setStorageSync('allSelectPackages', allSelectPackages);
        } catch (e) {
        }
        console.log(wx.getStorageSync('allpackages'));
        console.log(wx.getStorageSync('allSelectPackages'));
        //套餐数量
        wx.navigateBack({
            url: '/page/order/pages/createOrder/createOrder',
        })
    }
})
