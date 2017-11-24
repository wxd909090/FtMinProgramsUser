const api = require('../../../../config').api;
const common = require('../../../common/js/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    hidden: true,
    storeInfo: {},
    reviews: [],
    total: 0,
    current_page: 1,
    last_page: 0,
    /** 
        * 页面配置 
        */
    // winWidth: 0,
    // winHeight: 0,  
    currentTab: 1,
    // 商品data 
    classifyViewed: 30000,
    goods: [],
    isSelect: false,
    cart: {
      count: 0,
      total: 0,
      list: {}
    },
    cartNew: [],
    allGoods: [],
    showCartDetail: false,
    currentItem: 0,
    imgUrls: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    baseUrl: "",
    hotSelling:true,
    mypackage:false,
    current_hot:true,
    saveallgood:[],
    displaypackage:false,
    displayhot:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("执行onload")
    if (options.savestoreinfo) {
      var storeInfo = JSON.parse(options.savestoreinfo);
      this.setData({ storeInfo: storeInfo });
    } else {
      var storeInfo = JSON.parse(options.store_info);
      this.setData({ storeInfo: storeInfo });
    }
    // console.log(storeInfo);
    this.getReviews();
    this.getStorePoster();
    // 清除之前优惠券
    app.globalData.choosedCoupon ={price:0};
    // 获取所有套餐
    this.getallpackageinfo();
     
  },
  // 获取所有套餐
  getallpackageinfo: function () {
    var self = this;
    var data = {};
    data['store_sn'] = self.data.storeInfo.store_sn;
    data.token = common.getToken();
    wx.request({
      url: api.getComboListFilms,
      data: data,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var allpackagegoods = res.data.data.data
        for (var i = 0, len = allpackagegoods.length; i < len; i++) {
          allpackagegoods[i].id = "package" + allpackagegoods[i].id
          allpackagegoods[i].goods_hot = ""
          allpackagegoods[i].out_category_sn = ""
        }
        self.setData({
          allpackagegoods: allpackagegoods
        })
        // 获取所有商品
        self.getallgoods();
      },
    })
  },
  // 获取所有商品
  getallgoods: function () {
    var self = this;
    wx.request({
      url: api.getCommodityInformation,
      method: 'post',
      data: {
        token: common.getToken(),
        store_sn: self.data.storeInfo.store_sn,
        status: 1,
        page: 0,
      },
      success: function (res) {
        var allgoods = res.data.data
        if (res.data.code == 0) {
          allgoods = allgoods.concat(self.data.allpackagegoods)
          self.setData({
            goodsAndpackage: allgoods,
          });
          // 请求热销商品数据
          self.gethotgoods();
        } else {
          common.errMsg(res.data.msg);
        }
      },
      fail: function () {

      },
      complete: function () {

      }
    });
  },
  // 获取热销数据
  gethotgoods:function(){
    var self=this;
    var data = {};
    data['store_sn'] = self.data.storeInfo.store_sn;
    data.token = common.getToken();
    wx.request({
      url: api.getSellinggoods,
      data: data,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        self.setData({
          hotgoots:res.data.data
        })
        // 获取商品分类
        self.getCommodityClassification()
      }
    })
  },
  // 获取分类列表
  getCommodityClassification: function () {
    var self = this;
    wx.request({
      url: api.getCommodityClassification,
      method: 'post',
      data: {
        token: common.getToken(),
        store_sn: self.data.storeInfo.store_sn
      },
      success: function (res) {
        // console.log(self.data.goodsAndpackage)
        if (res.data.code == 0) {
          var listarr = res.data.data.data;
          var arr=[];
          // 判断每个类下面有无商品
          for (var i = 0, len = listarr.length;i<len;i++){
            var category_sn=listarr[i].category_sn
            for (var k = 0, lencl = self.data.goodsAndpackage.length; k < lencl; k++){
              if (category_sn == self.data.goodsAndpackage[k].out_category_sn){
                arr = arr.concat([listarr[i]])
                break;
              }
            }
          }
          // 重新排序
          var compare = function (prop) {
            return function (obj1, obj2) {
              var val1 = obj1[prop];
              var val2 = obj2[prop];
              if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                val1 = Number(val1);
                val2 = Number(val2);
              }
              if (val1 < val2) {
                return -1;
              } else if (val1 > val2) {
                return 1;
              } else {
                return 0;
              }
            }
          }
          var newarr = arr.sort(compare("priority"));
          self.setData({
            goodsList: newarr
          });
          if (self.data.hotgoots.length > 0) {
            self.taphotSelling()
          } else if (self.data.hotgoots.length <= 0 && self.data.allpackagegoods.length > 0) {
            self.tapmypackage()
          } else {
            self.tapClassify(self.data.goodsList[0].category_sn)
          }
        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {
         
      },
      complete: function () {
        
      }
    })
  },
  // 获取门店海报
  getStorePoster: function () {
    var self = this;
    wx.request({
      url: api.getStorePoster,
      data: {
        store_sn: self.data.storeInfo.store_sn
      },
      success: function (res) {
        if (res.data.code == 0) {
          self.setData({
            baseUrl: res.data.data.base_url,
            imgUrls: res.data.data.data
          });
          if (self.data.imgUrls.length == 0) {
            self.setData({

            })
          }
        } else {
          common.errMsg(res.data);
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var conheight = wx.getSystemInfoSync().windowHeight - ((wx.getSystemInfoSync().windowHeight / 603) * 298.5);
    this.setData({
      setheight: 0.98 * conheight
    });
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  // onShow: function () {
    
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  // onHide: function () {
    
  // },

  /**
   * 生命周期函数--监听页面卸载
   */
  // onUnload: function () {
  //   console.log("执行onUnload") 
  // },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {

  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
    if (this.data.last_page > this.data.current_page) {
      this.setData({
        current_page: Number(this.data.current_page) + 1
      })
    } else if (this.data.last_page == this.data.current_page) {
      return;
    }
    this.getReviews();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  openLocation: function () {
    //获取门店地图位置
    var storeInfo = this.data.storeInfo;
    var path_x = Number(Number(storeInfo.path_x).toFixed(6));
    var path_y = Number(Number(storeInfo.path_y).toFixed(6));
    wx.openLocation({
      longitude: path_y,
      latitude: path_x,
      name: storeInfo.store_name,
      address: storeInfo.address
    });
  },
  getReviews: function () {
    var that = this;
    var storeInfo = this.data.storeInfo;
    that.setData({
      hidden: false
    })
    wx.request({
      url: api.getStoreReviewsList,
      data: {
        store_sn: storeInfo.store_sn,
        page: that.data.current_page
      },
      success: function (res) {
        if (res.data.code == 0) {
          var reviews = that.data.reviews;
          reviews = reviews.concat(res.data.data.data);
          for (var i = 0; i < reviews.length; i++) {
            if (reviews[i].create_time[0] == 1) {
              var date = new Date();
              date.setTime(reviews[i].create_time * 1000);
              if (reviews[i].reply1) {
                reviews[i].reply1 = reviews[i].reply1.split(":")[1];
              }
              if (reviews[i].reply2) {
                reviews[i].reply2 = reviews[i].reply2.split(":")[1];
              }
              if (reviews[i].add_info) {
                var add_infoArr = reviews[i].add_info.split(":");
                reviews[i].add_info_time = "20" + add_infoArr[0];
                reviews[i].add_info = add_infoArr[1];
              }
              reviews[i].hasPraiseUp = false;
              reviews[i].create_time = date.toLocaleDateString();
              reviews[i].create_time = reviews[i].create_time.replace(/\//g, '-')
              reviews[i].reviewsNum = ((parseFloat(reviews[i].av) + parseFloat(reviews[i].health) + parseFloat(reviews[i].comfy)) / 3).toFixed(1)
            }
          }
          that.setData({
            reviews: reviews,
            total: res.data.data.total,
            last_page: res.data.data.last_page,
            current_page: res.data.data.current_page,
          });

        } else {
          common.errMsg(res.data);
        }
      },
      fail: function () {

      },
      complete: function () {
        that.setData({
          hidden: true
        })
      }
    })
  },
  upPraise: function (event) {
    var self = this;
    var praiseInfo = event.currentTarget.dataset.praiseinfo;
    var index = event.currentTarget.dataset.index;
    var reviews = self.data.reviews;
    if (praiseInfo.hasPraiseUp) {
      return;
    }
    var data = {
      token: common.getToken(),
      order_sn: praiseInfo.order_sn,
      praise: parseFloat(praiseInfo.praise) + 1,
    };
    wx.request({
      url: api.operateReviews,
      data: data,
      method: 'POST',
      success: function (res) {
        if (res.data.code == 0) {
          reviews[index].praise = data.praise;
          reviews[index].hasPraiseUp = true;
          self.setData({
            reviews: reviews
          })
          // var praiseArr = wx.getStorageSync('praiseArr');
          // if (praiseArr.length == 0){
          //   praiseArr = praiseInfo.id
          // }else{
          //   praiseArr += "," + praiseInfo.id
          // }
          // wx.setStorageSync('praiseArr', praiseArr);
        } else {
          common.errMsg(res.data)
        }

      },
      fail: function () {

      },
      complete: function () {

      }
    })
  },
  gotoRoom: function () {
    app.globalData.storeInfo = this.data.storeInfo;
    if (app.globalData.storeInfo.status == 2) {
      common.showMsg("温馨提示", "该门店暂停营业，请选择其他门店！");
      return;
    }
    wx.switchTab({ url: '/page/film/index' });
    // if (app.globalData.filmInfo != null) {
    //   wx.navigateTo({ url: '/page/room/index' });
    // } else {
    //   wx.switchTab({ url: '/page/film/index' });
    // }
  },
  // tab切换
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });

  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  // 商品js
  onShow: function () {

  },
  tapAddCart: function (e) {
    var token = common.getToken();
    var user_sn = app.globalData.userInfo.user_sn;
    var mystoreinfo = JSON.stringify(this.data.storeInfo)
    if (common.getToken()==null){
      common.showMsg("温馨提示", "请登录后选择商品", function () {
        wx.redirectTo({
          url: "/page/login/index?goodspage="+1+"&mystoreinfo="+mystoreinfo
        })
      })
    }else{
      this.addCart(e.target.dataset.id);
    }
    // console.log(e);
  },
  tapReduceCart: function (e) {
    this.reduceCart(e.target.dataset.id);
  },
  addCart: function (id) {
    // console.log(id)
    var self = this;
    var PreviousData = [];
    var currentI;
  
    // 给添加的商品加上num标识
    for (var i = 0, len = self.data.goodsAndpackage.length;i<len;i++){
      if (self.data.goodsAndpackage[i].id == id) {
        if (self.data.goodsAndpackage[i].num){
          var num = parseInt(self.data.goodsAndpackage[i].num);
          num++;
          if (num >= 99) {
            num = 99
          };
          self.data.goodsAndpackage[i].num = num;
        }else{
          var num=0;
          num++
          self.data.goodsAndpackage[i].num=num;
        }
        self.setData({
          goodsAndpackage: self.data.goodsAndpackage
        })
      }
    }
    // console.log(self.data.goodsAndpackage)
    //  购物车数据处理

    var PreviousData=[];
    // 购物车加数据处理
    if (self.data.cartNew.length > 0) {
      // console.log("有数据了")
      for (var i = 0, len = self.data.cartNew.length; i < len; i++) {
        if (self.data.cartNew[i].id == id) {
          PreviousData = PreviousData.concat([self.data.cartNew[i]])
          currentI= i;
        }
      }
    } else {
      
       
    }
    if (PreviousData.length == 1) {
      var num = parseInt(PreviousData[0].num);
      num++;
      if (num >= 99) {
        num = 99
      };
      this.data.cartNew[currentI].num = num;
      this.setData({
        cartNew: self.data.cartNew
      });
    } else {
      var nemArr = [];
      // console.log(self.data.saveallgood)
      // console.log(id)
      for (var i = 0, len = self.data.goodsAndpackage.length; i < len; i++) {
        if (self.data.goodsAndpackage[i].id == id) {
          nemArr = nemArr.concat([self.data.goodsAndpackage[i]])
        }
      }
      // console.log(nemArr[0])
      var goodname = nemArr[0].name;
      var goodprice;
      var cb_sn="";
      var g_sn="";
      if (self.data.current_package){
         goodprice = parseFloat(nemArr[0].pay_price);
         cb_sn = nemArr[0].cb_sn;
      }else{
         goodprice = parseFloat(nemArr[0].price);
         g_sn = nemArr[0].g_sn
      }
      var temporaryData = {
        id: id,
        num: 1,
        name: goodname,
        price: goodprice,
        cb_sn: cb_sn,
        g_sn: g_sn,
      };
      this.setData({
        cartNew: self.data.cartNew.concat([temporaryData])
      });
    }
    // 增加时重置当前显示信息

    if (self.data.current_package) {
      var current = true
      self.tapmypackage(current)
    } else if (self.data.current_hot) {
      var current = true
      self.taphotSelling(current)
    } else {
      var current = true
      self.tapClassify(current)
    }
    // 求和
    self.countCart();
  },
  reduceCart: function (id) {
    var self = this;
    var PreviousData = [];
    var currentI;
    // var currentgoodsI;

    // 给减少的商品加上num标识
    for (var i = 0, len = self.data.goodsAndpackage.length; i < len; i++) {
      if (self.data.goodsAndpackage[i].id == id) {
        var num = self.data.goodsAndpackage[i].num;
          num--;
          if(num<=0){
            num=0
          }
          self.data.goodsAndpackage[i].num = num;
        }
        self.setData({
          goodsAndpackage: self.data.goodsAndpackage
        })
    }
    
    // console.log(self.data.goodsAndpackage);

    // 购物车减数据处理
    if (self.data.cartNew.length > 0) {
      // console.log("有数据了")
      for (var i = 0, len = self.data.cartNew.length; i < len; i++) {
        if (self.data.cartNew[i].id == id) {
          PreviousData = PreviousData.concat([self.data.cartNew[i]])
          currentI = i;
          num = self.data.cartNew[i].num
        }
      }
    } else {

    }
    if (PreviousData.length == 1) {
      var num = parseInt(PreviousData[0].num);
      num--;
      if (num <= 0) {
        num = 0;
        self.data.cartNew.splice(currentI, 1);
      }else{
        this.data.cartNew[currentI].num = num;
      }   
      // console.log(num)
      this.setData({
        cartNew: self.data.cartNew
      });
    } else {
     
    }
    // 减少时时重置当前显示信息

    if (self.data.current_package) {
      var current = true
      self.tapmypackage(current)
    } else if (self.data.current_hot) {
      var current = true
      self.taphotSelling(current)
    } else {
      var current = true
      self.tapClassify(current)
    } 
    self.countCart();
  },
  countCart: function (id) {
    var self = this;
    var count = 0;
    var total = 0;
    for (var i = 0, len = self.data.cartNew.length; i < len; i++) {
      count += self.data.cartNew[i].num;
      self.data.cartNew[i].Singletotalprice = (parseFloat(self.data.cartNew[i].price) * 1000 * self.data.cartNew[i].num) / 1000
      total += (parseFloat(self.data.cartNew[i].price)*1000* self.data.cartNew[i].num)
    };
    this.data.cart.count = count;
    this.data.cart.total = total/1000
    if (this.data.cart.count==0){
      this.setData({
        showCartDetail: false,
      });
    }
    this.setData({
      cart: self.data.cart,
      cartNew: self.data.cartNew
    });
  },
  emptyCart: function () {
    var self=this;
    // console.log("情空函数")
    // 清空所有num
    for (var i = 0, len = self.data.goodsAndpackage.length; i < len; i++) {
      self.data.goodsAndpackage[i].num=0
    }
    // 清空时重置当前显示信息
    
    if (self.data.current_package) {
      var current = true
      self.tapmypackage(current)
    } else if (self.data.current_hot) {
      var current = true
      self.taphotSelling(current)
    } else {
      var current = true
      self.tapClassify(current)
    }
    // 清除购物车
    this.setData({
      cartNew:[]
    });
    this.setData({
      showCartDetail: false,
      cart: {
        count: 0,
        total: 0,
        list: {}
      },
    });
  },
  follow: function () {
    this.setData({
      followed: !this.data.followed
    });
  },
  //   商品-点击左侧导航栏
  // 点击热销
  taphotSelling:function(currttop){
    var self=this;
    if (currttop==true){
      
    }else{
      self.setData({
        scrollTop: 0,
      });
    }
    self.setData({
      mypackage: false,
      current_category_sn: '',
      hotSelling: true,
      current_hot: true,
      packagegoods: [],
      current_package: false,
    });
    var hotarr = [];
    for (var i = 0, len = self.data.goodsAndpackage.length; i < len; i++) {
      var hot = 1
      if (self.data.goodsAndpackage[i].goods_hot == hot) {
        hotarr = hotarr.concat([self.data.goodsAndpackage[i]])
      }
    }
    self.setData({
      hotgoots: hotarr,
    });
    self.setData({
      goods: self.data.hotgoots,
    });
  },
  // 点击套餐
  tapmypackage: function (currttop) {
    var self = this;
    if (currttop==true){
      
    }else{
      self.setData({
        scrollTop: 0,
      });
    }
    self.setData({
      hotSelling: false,
      current_category_sn: '',
      mypackage: true,
      current_hot: false,
      current_package: true,
      goods:[],
    });
    var packagearr = [];
    for (var i = 0, len = self.data.goodsAndpackage.length; i < len; i++) {
      var tostringId = self.data.goodsAndpackage[i].id.toString()
      if (tostringId.indexOf("package") != -1) {
        packagearr = packagearr.concat([self.data.goodsAndpackage[i]])
      }
    }
    self.setData({
      allpackagegoods: packagearr,
    });
    self.setData({
      packagegoods: self.data.allpackagegoods,
    })
  },
  // 点击商品类
  tapClassify: function (e) {
    // console.log(e)
    var self = this;
    if (e == true) {

    } else if (e.currentTarget){
      var category_sn = e.currentTarget.dataset.category_sn;
      // 设置全局当前类category_sn
      self.setData({
        scrollTop: 0,
        current_category_sn: category_sn
      })  
    }else{
      var category_sn = e;
      self.setData({
        scrollTop: 0,
        current_category_sn: category_sn
      }) 
    }
    self.setData({
      mypackage: false,
      hotSelling: false,
      current_hot: false,
      packagegoods: [],
      current_package: false,
    });
    var arr=[];
    for (var i = 0, len = self.data.goodsAndpackage.length;i<len;i++){
      if (self.data.current_category_sn == self.data.goodsAndpackage[i].out_category_sn){
        arr = arr.concat([self.data.goodsAndpackage[i]])  
      }
    }
    self.setData({
      goods: arr,
    })
  },
  showCartDetail: function () {
    this.setData({
      showCartDetail: !this.data.showCartDetail
    });
  },
  hideCartDetail: function () {
    this.setData({
      showCartDetail: false
    });
  },
  submit: function (e) {
    var merchandOrder = this.data.cart;
    // console.log(merchandOrder);
    app.globalData.choosedGoodsStore = this.data.storeInfo
    wx.setStorageSync("orderinformation",this.data.cartNew);

    wx.navigateTo({
      url: '/page/order/pages/merchandiseOrder/merchandiseOrder',
    })
  }
})