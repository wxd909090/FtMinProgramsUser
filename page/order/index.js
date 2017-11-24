var num = 5 * 60//计时  
var strH = ''
var strM = ''
var strS = ''
var timer = '';
var app = getApp();
var config = require('../../config').config;
const common = require('../common/js/common.js');
const api = require('../../config').api;
var time_task = '';
Page({
    data: {
        hidden: true,
        storeInfo: [],
        filmInfo: [],
        roomInfo: [],
        fromPage: '',
        items: [{ value: 1, name: '微信支付', checked: 'true' }, { value: 2, name: '其他' }],
        compensationInfo: {
        txt: '尊敬的13225563366用户你好。你上次在XXX店包间消费，损坏杯子一个，要赔偿认人民币10元，若有异议请联系客户。',
        price: 10,
        imgUrl: {
            1: '',
            2: '',
            3: ''
        }
        },
        timeText: '',//展示
        second: 60,
        payOverTime: config.payTimeOutTime,
        isShowCode: false,
        activity_code: '',
        activity_code_type: 0,
        codeList: [],
        // codeListLen:0,  
        couponList: [],
        coupon_status : 1,
        activeForbidCoupon : false,
        san_title_top: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/san_title_top.png",
        san_title_bottom: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/san_title_bottom.png",
        couponPrice:0,
        canTuseCoupon :false,
        fromPage: '',
        hasCoupon:[],
        addReviewsTextarea:false,
        placeHolderText: "店家有了新的回复，欢迎填写追加评论！",
        addReviewsInfo:"",
        orderInfo:{
            image: "http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/error_bear.jpg"
        },
        loseStyle: "background: url('http://qnbar.oss-cn-hangzhou.aliyuncs.com/ftang/public/wxMinApp/lose_order_icon.png') no-repeat;background-position:100% 40%;background-size: 150rpx 150rpx;",
        maskdisplay:0,
        currentchecked: 1,    
    },
    onLoad: function (option) {
        this.setData({ fromPage: option.page });
        if (option.page == "myOrder"){
            this.setData({
                coupon_status : 0
            })
        }
        // 页面初始化 options为页面跳转所带来的参数
        // console.log(JSON.parse(option.orderInfo));
        if (this.data.fromPage == "msgList" || this.data.fromPage == "myOrder"){
            var orderInfo = app.globalData.msgToOrderInfo;
        }else{
            var orderInfo = JSON.parse(option.orderInfo);
        }
        console.log(orderInfo);
        if (orderInfo.reviews){
            if (orderInfo.reviews.reply1) {
                orderInfo.reviews.reply1 = orderInfo.reviews.reply1.split(":")[1];
            };
            if (orderInfo.reviews.reply2) {
                orderInfo.reviews.reply2 = orderInfo.reviews.reply2.split(":")[1];
            }
            if (orderInfo.reviews.add_info) {
                var add_infoArr = orderInfo.reviews.add_info.split(":");
                orderInfo.reviews.add_info_time = "20" + add_infoArr[0];
                orderInfo.reviews.add_info = add_infoArr[1];
            }
        }
        var fromPage = option.page;
        if (orderInfo.coupon_price){
            this.setData({
                couponPrice: Number(orderInfo.coupon_price),
                canTuseCoupon : true
            })
        }
        // 赔偿图片字符串转换为数组
        if (!orderInfo.damage_image_urls){
            orderInfo.damage_image_urls = []
        }else{
            if (orderInfo.damage_image_urls.length == 0){
                orderInfo.damage_image_urls = []
            }else{
                orderInfo.damage_image_urls = orderInfo.damage_image_urls.split(",");
            }
        }
        for (var i = 0; i < orderInfo.damage_image_urls.length;i++){
            orderInfo.damage_image_urls[i] = config.imageUrl + orderInfo.damage_image_urls[i]
        }
        // 将时间戳转换为年月日
        if (orderInfo.reviews) {
            var newDate = new Date();
            newDate.setTime(orderInfo.reviews.create_time * 1000);
            orderInfo.reviews.create_time = newDate.toLocaleDateString().replace(/\//g, '-')
        }
        this.setData({
            orderInfo: orderInfo,
            payOverTime: config.payTimeOutTime,
            fromPage: fromPage,
        });
        if (fromPage == 'myOrder') {
            this.setData({
                payOverTime: orderInfo.pay_time_num - 3
            });
        }
        if (orderInfo.status == 5) {
            this.setData({ payOverTime: 0 });
        }
        if (app.globalData.filmInfo){
        this.setData({
            filmInfo: app.globalData.filmInfo
        })
        }
        time_task = setInterval(this.move, 1000);
    },
    onReady: function () {
        // 页面渲染完成
    },
    onShow: function () {
    // this.move(timer);
    // timer = setInterval(this.move, 1000);//计时开始 后面的1000是毫秒 每1000毫秒跳一次 
    // clearInterval(time_task); 
    var self = this;
    var orderInfo = self.data.orderInfo;
    var reserve_time = parseInt(orderInfo.reserve_time) - 8 * 60 * 60 + parseInt(orderInfo.begin_time) * 60;
    var getOutTime = reserve_time - Date.parse(new Date()) / 1000;
    orderInfo.getOutTime = getOutTime;
    if (orderInfo.date){
        orderInfo.date = orderInfo.date.replace(/\//g, '-');
    };
    var timeArr = [];
    timeArr.push(orderInfo.duration_time.split("-")[0].split(":"))
    timeArr.push(orderInfo.duration_time.split("-")[1].split(":"))
    var begin_time = Number(timeArr[0][0]) * 60 + Number(timeArr[0][1]);
    var end_time = Number(timeArr[1][0]) * 60 + Number(timeArr[1][1]);
    if (begin_time > end_time){
        if ((end_time + 1440 - begin_time) >= 240) {
            self.setData({
                items: [{ value: 1, name: '微信支付', checked: 'true' }],
            })
        }
    }else{
        if (end_time - begin_time >= 240) {
            self.setData({
                items: [{ value: 1, name: '微信支付', checked: 'true' }],
            })
        }
    }

    self.getCouponList();
    if (orderInfo.coupon_price && (parseInt(orderInfo.coupon_price) != 0)) {
        self.setData({
            items: [{ value: 1, name: '微信支付', checked: 'true' }],
        });
        self.setData({
            coupon_status : 0
        })
    }
    orderInfo.price = parseInt(orderInfo.price);
    self.setData({
        orderInfo: orderInfo
    })
    if (!app.globalData.reviews) {
        return;
    }
    var orderInfo = self.data.orderInfo;
    orderInfo.reviews = app.globalData.reviews;
    var date = new Date();
    date = Date.parse(date) / 1000;
    orderInfo.reviews.create_time = date;
    if (orderInfo.reviews) {
        var newDate = new Date();
        newDate.setTime(orderInfo.reviews.create_time * 1000);
        orderInfo.reviews.create_time = newDate.toLocaleDateString().replace(/\//g, '-')
    }
    self.setData({
        orderInfo: orderInfo
    })
    //     if (option.reviews){
    //   var reviews = JSON.parse(option.reviews);
    // }
    // console.log("reviews: "+reviews)
    },
    onHide: function () {
    // 页面隐藏
    },
    onUnload: function () {
    // 页面关闭
    },
    postOrder: function () {
    wx.navigateTo({ url: '/page/order/pages/confirmOrder/confirmOrder' });
    },

    // 打开支付方式选择
    showPayType: function () {
        var self = this;
        var data = {
            user_sn: common.getUserSn(),
            store_sn: self.data.storeInfo.store_sn
        };
        wx.request({
            url: api.getRechargeInfo,
            data: data,
            method: 'POST',
            success: function (res) {
                if (res.data.code == 0) {
                    self.setData({
                        cardBlance: res.data.data.surplus,
                        cardUserName: res.data.data.real_name
                    })
                } else {
                    common.errMsg(res.data);
                }
            },
            fail: function (res) {
                common.errMsg(res.data);
            },
            complete: function (res) {
                self.setData({ hidden: true });
            }
        })
        self.setData({
            maskdisplay: 1
        })
    },
    // 选择支付方式
    clickimg: function (e) {
        console.log(e)
        var self = this;
        var chooseType = e.currentTarget.dataset.id;
        self.setData({
            currentchecked: chooseType
        })
    },
    // 隐藏支付方式选择
    hiddenpayment: function () {
        var self = this;
        self.setData({
            maskdisplay: 0
        })
    },


    pay: function (event) {
        var that = this;
        console.log(that.data);
        return;
        var orderInfoPrice = Number(that.data.orderInfo.price);
        var couponPrice = 0;
        if (that.data.couponPrice) {
            var couponPrice = that.data.couponPrice;
        }
        var price = (orderInfoPrice - couponPrice) < 0 ? 0 : (orderInfoPrice- couponPrice);
        if (that.data.payOverTime <= 0 || that.data.orderInfo.status == 5) {
        common.showMsg('', '支付已超时，请重新下单');
        clearInterval(time_task);
        return;
        } else {
        var coupon_sn = ""
        for (var i = 0; i < that.data.couponList.length;i++){
            if (that.data.couponList[i].chooseStatus == 1){
            coupon_sn = that.data.couponList[i].coupon_sn
            }
        }
        if (coupon_sn){
            var data = {
            order_sn : that.data.orderInfo.order_sn,
            coupon_sn: coupon_sn,
            token: common.getToken()
            }
            wx.request({
            url: api.couponPay,
            data: data,
            method: 'GET',
            success: function (res) {
                if (res.data.code == 0) {

                    if (res.data.data.need_wx_pay == 1){
                        common.pay(that, that.data.orderInfo.order_sn, function (payRet) {
                        that.getCouponList();
                        that.setData({
                            coupon_status: false,
                            canTuseCoupon: true
                        })
                        if (payRet.code == 0) {
                            common.showMsg('预约成功', "请在“我的订单”中查看订单信息 ，请于观影前五分钟扫码进厅，祝您观影愉快", function () {
                                wx.redirectTo({
                                    url: "/page/order/pages/orderComplete/orderComplete?payType=微信支付&price=" + price +"&orderInfo=" + JSON.stringify(that.data.orderInfo)
                                })
                                // wx.redirectTo({ url: '/page/order/pages/myOrder/myOrder?currentTab=1'})
                                // if (that.data.fromPage == 'room') {
                                //     wx.switchTab({ url: "/page/personal/index" });
                                // }
                                // if (that.data.fromPage == 'myOrder') {
                                //     wx.navigateBack({ url: "/page/order/pages/myOrder/myOrder" });
                                // }
                            });
                        } else if (payRet.code == 1) {
                            ommon.showMsg('错误提示', payRet.msg,function(){
                                console.log("支付失败！")
                                // wx.redirectTo({ url: "/page/order/pages/myOrder/myOrder" });
                            });
                        } else if (payRet.code == 2) {
                            // common.showMsg('温馨提示', "请及时支付，超过支付时间，该订单将失效！", function(){
                            //     console.log("支付失败！")
                            //     // wx.redirectTo({ url: "/page/order/pages/myOrder/myOrder" });
                            // });
                        } else {
                            common.showMsg('错误提示', "未知支付错误",function(){
                                console.log("支付失败！")
                                // wx.redirectTo({ url: "/page/order/pages/myOrder/myOrder" });
                            });
                        }

                        });
                    }else{
                        wx.redirectTo({
                            url: "/page/order/pages/orderComplete/orderComplete?payType=微信支付&price=" + price + "&orderInfo=" + JSON.stringify(that.data.orderInfo)
                        })
                            // common.showMsg('温馨提示', "预约成功！请在“我的订单”中查看订单信息 ，可提前五分钟扫码进场，祝你观影愉快", function () {
                            // if (that.data.fromPage == 'room') {
                            //     wx.switchTab({ url: "/page/personal/index" });
                            // }
                            // if (that.data.fromPage == 'myOrder') {
                            //     wx.navigateBack({ url: "/page/order/pages/myOrder/myOrder" });
                            // }
                            // });
                    }
                } else {
                common.errMsg(res.data);
                }
            },
            fail: function (res) {
                // common.errMsg(res.data);
            },
            complete: function (res) {
                that.setData({ hidden: true });
            }
            });
        }else{
            common.pay(that, that.data.orderInfo.order_sn, function (payRet) {
            if (payRet.code == 0) {
                    wx.redirectTo({
                        url: "/page/order/pages/orderComplete/orderComplete?payType=微信支付&price=" + price + "&orderInfo=" + JSON.stringify(that.data.orderInfo)
                    })
                // common.showMsg('预约成功', "请在“我的订单”中查看订单信息 ，请于观影前五分钟扫码进厅，祝您观影愉快", function () {
                //   // wx.redirectTo({ url: '/page/order/pages/myOrder/myOrder?currentTab=1'});
                //   if (that.data.fromPage == 'room') {
                //     wx.switchTab({ url: "/page/personal/index" });
                //   }
                //   if (that.data.fromPage == 'myOrder') {
                //     wx.navigateBack({ url: "/page/order/pages/myOrder/myOrder" });
                //   }
                // });
            } else if (payRet.code == 1) {
                common.showMsg('错误提示', payRet.msg,function(){
                    console.log("支付失败")
                    // wx.redirectTo({ url: "/page/order/pages/myOrder/myOrder" });
                });
            } else if (payRet.code == 2) {
                // common.showMsg('温馨提示', "请及时支付，超过支付时间，该订单将失效！",function(){
                //     console.log("支付失败")
                //     // wx.redirectTo({ url: "/page/order/pages/myOrder/myOrder" });
                // });
            } else {
                common.showMsg('错误提示', "未知支付错误",function(){
                    console.log("支付失败")
                    // wx.redirectTo({ url: "/page/order/pages/myOrder/myOrder" });
                });
            }

            });
        };
        }

    },
    code_input: function (event) {
        // console.log(event.detail.value );
        var activity_code = event.detail.value;
        var reg = /^[0-9]*$/;
        if (!reg.test(activity_code)) {
        common.showMsg("温馨提示", "体验码格式不正确");
        return;
        }
        this.setData({ activity_code: activity_code, activity_code_type: 0 });
    },
    activityCodePay: function () {
        var that = this;
        if (that.data.activity_code == '' || that.data.activity_code == undefined) {
        common.showMsg('温馨提示', '请输入体验码');
        return;
        }
        if (that.data.activity_code_type == 0) {
        that.checkActivityCodeType();
        }
        var postData = {
        token: common.getToken(),
        order_sn: that.data.orderInfo.order_sn,
        activity_code: that.data.activity_code,
        activity_code_type: that.data.activity_code_type
        }
        console.log(postData.activity_code.length)
        if (postData.activity_code.length != 8 && postData.activity_code.length != 10){
        common.showMsg('温馨提示', '请输入正确位数的体验码');
        return;
        }
        that.setData({ hidden: false });
        wx.request({
        url: api.activityCodePay,
        data: postData,
        method: 'GET',
        success: function (res) {
            // success
            if (res.data.code == 0) {
                wx.redirectTo({
                    url: "/page/order/pages/orderComplete/orderComplete?payType=团购码支付"
                })
            //   common.showMsg('温馨提示', "预约成功！请在“我的订单”中查看订单信息 ，可提前五分钟扫码进场，祝你观影愉快", function () {
            //     if (that.data.fromPage == 'room') {
            //       wx.switchTab({ url: "/page/personal/index" });
            //     }
            //     if (that.data.fromPage == 'myOrder') {
            //       wx.navigateBack({ url: "/page/order/pages/myOrder/myOrder" });
            //     }

            //   });
            } else if (res.data.code == 8105) {
            common.showMsg('温馨提示', '此码无效,请检查是否输入正确');
            } else {
            common.errMsg(res.data);
            }
        },
        fail: function (res) {
            // common.errMsg(res.data);
        },
        complete: function (res) {
            that.setData({ hidden: true });
        }
        })
    },
    move: function () {
        var that = this;
        var num = that.data.payOverTime;
        if (num <= 0) {
        clearInterval(timer);
        return
        }
        var M = '' + Math.abs(parseInt(num / 60 % 60));
        var S = '' + Math.abs(parseInt(num % 60));
        if (M.length < 2) {
        M = '0' + M
        }
        if (S.length < 2) {
        S = '0' + S
        }
        this.setData({ timeText: M + ":" + S });
        this.setData({ payOverTime: num - 1 });
    },
    radioChange: function (event) {
        if (parseInt(event.detail.value) == 1) {
            this.setData({ isShowCode: false });
            this.setData({
                items: [{ value: 1, name: '微信支付', checked: 'true' }, { value: 2, name: '其他' }],
            })
            if (this.data.fromPage == 'myOrder'){
                return;
            }
            this.setData({ coupon_status: 1 }); 
        }
        if (parseInt(event.detail.value) == 2) {
            this.setData({
                items: [{ value: 1, name: '微信支付' }, { value: 2, name: '其他', checked: 'true'  }],
            })
        for (var i = 0; i < this.data.couponList.length; i++) {
            this.data.couponList[i].chooseStatus = 0
        };
        var newCouponList = this.data.couponList
        this.setData({ couponList: newCouponList });
        this.setData({ coupon_status: 0 }); 
        this.setData({ isShowCode: true });
        this.setData({ couponPrice: 0 });
        }
    },
    gotoReviews() {
        wx.showToast({
        title: '加载中',
        mask: true,
        icon: 'loading',
        duration: 2000
        })
        wx.navigateTo({
        url: '/page/order/pages/reviews/reviews?orderInfo=' + JSON.stringify(this.data.orderInfo)
        });
    },
    isShowRedStatus: function () {
        var data = {
        token: common.getToken(),
        user_sn: common.getUserSn()
        }
        wx.request({
        url: api.isShowRed,
        data: data,
        header: {
            'content-type': 'application/json'
        },
        success: function (res) {
            if (res.data.code == 0) {
            app.globalData.isShowRed = res.data.data;
            } else {
            common.errMsg(res.data)
            }
        },
        complete: function () {

        }
        })
    },

    // 支付赔偿金
    gotoPayCompensate : function () {
        //下赔偿单
        var self = this;
        wx.request({
        url: api.payCompensate,
        header: {
            "Content-Type": "application/json"
        },
        data: {
            token: common.getToken(),
            order_sn: self.data.orderInfo.order_sn
        },
        success: function (res) {
            var data = res.data;
            // console.log(data);
            if (data.code === 0) {
            self.setData({ order_sn: data.data.c_order_sn, price: data.data.price })
            common.pay(self, data.data.c_order_sn, function (payRet) {
                if (payRet.code == 0) {
                common.showMsg("温馨提示", "违约金支付成功", function () {
                    wx.navigateBack({ url: '/page/order/pages/myOrder/myOrder?currentTab=1'})
                });
                }
            });
            } else {
            common.errMsg(res.data);
            }
        },
        fail: function () {
            console.log("personal:createCompensateOrder fail");
        }
        })
    },
    //图片预览
    previewImage: function (e) {
        console.log(e.currentTarget.dataset);
        var url = e.currentTarget.dataset.url;
        wx.previewImage({
        current: url, // 当前显示图片的http链接
        urls: [url] // 需要预览的图片http链接列表
        })
    },  
    getMycode: function () {
        var that = this;
        common.getUserInfo(function (userInfo) {
        that.setData({ hidden: false });
        wx.request({
            url: api.getUserCodeList,
            data: {
            token: userInfo.token,
            user_sn: userInfo.user_sn,
            usable: 1
            },
            success: function (res) {
            if (res.data.code == 0) {
                var list = res.data.data
                var len = list.length;
                for (var i = 0; i < len; i++) {
                list[i].date = common.formatDateTime(list[i].expire_time * 1000);
                }
                that.setData({ codeList: list, codeListLen: len });
            } else {
                common.errMsg(res.data);
            }
            },
            complete: function () {
            that.setData({ hidden: true });
            }
        })
        })
        this.showModal();
    },
    useCode: function (e) {
        // console.log(e.currentTarget.dataset);
        this.setData({ activity_code: e.currentTarget.dataset.code, activity_code_type: 1 });
        this.hideModal();
    },


    showModal: function () {
        // 显示遮罩层
        var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
        animationData: animation.export(),
        showModalStatus: true
        })
        setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
            animationData: animation.export()
        })
        }.bind(this), 200)
    },
    hideModal: function () {
        // 隐藏遮罩层
        var animation = wx.createAnimation({
        duration: 200,
        timingFunction: "linear",
        delay: 0
        })
        this.animation = animation
        animation.translateY(300).step()
        this.setData({
        animationData: animation.export(),
        })
        setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
            animationData: animation.export(),
            showModalStatus: false
        })
        }.bind(this), 200)
    },
    getCouponList: function () {
        var self = this;
        common.getUserInfo(function (userInfo) {
        wx.request({
            url: api.getCoupon,
            data: {
            token: userInfo.token
            },
            success: function (res) {
            var hasCoupon = self.data.hasCoupon;
            if (res.data.code == 0) {
                if (res.data.data.length > 0) {
                for (var i = 0; i < res.data.data.length; i++) {
                    res.data.data[i].price = parseInt(res.data.data[i].price);
                    res.data.data[i].chooseStatus = 0;
                };
                for (var q = 0; q < res.data.data.length;q++){
                    if (parseInt(res.data.data[q].is_used) == 0){
                    hasCoupon.push(res.data.data);
                    }
                };
                self.setData({
                    hasCoupon: hasCoupon
                });
                }

                if (res.data.data.length == 0){
                self.setData({
                    hasCoupon: []
                })
                }
                self.setData({
                couponList: res.data.data
                });
                var date = parseInt((new Date().getTime()) / 1000);
                var timeFlag = true;
                if (self.data.couponList.length > 0){
                    var coupon = self.data.couponList[0];
                    for (var k = 0; k < coupon.not_use_daily.length; k++) {
                        if (date > Number(coupon.not_use_daily[k]) && date < (Number(coupon.not_use_daily[k]) + 24 * 60 * 60)) {
                            // common.showMsg('温馨提示', '今日无法使用红包抵用券');
                            timeFlag = false;
                        }
                    }
                }
                if (!timeFlag) {
                    self.setData({
                        activeForbidCoupon : true
                    })
                }
                
                
            
            } else {
                common.errMsg(res.data);
            }
            },
            complete: function () {
            self.setData({ loading: false });
            }
        })
        })
    },
    changeCouponStatus: function(){
        var self = this;
        if (self.data.isShowCode){
        return;
        }
        if (self.data.canTuseCoupon){
        return;
        }
        if (self.data.coupon_status == 0){
        self.setData({ coupon_status : 1})
        }else{
        self.setData({ coupon_status: 0 })
        }
    },
    addReviewsOpen:function(){
        var self = this;
        self.setData({
        addReviewsTextarea:true
        });
        setTimeout(function(){
        wx.pageScrollTo({
            scrollTop: 9999
        })
        },300)
    },
    confirmInfo: function (option) {
        var self = this;
        self.setData({ addReviewsInfo: option.detail.value });
        self.setData({ placeHolderText: "" });
    },
    addReviewsSub: function(){
        var self = this;
        var orderInfo = self.data.orderInfo;
        var addInfo = self.data.addReviewsInfo;
        if (addInfo.trim()==""){
        common.showMsg("温馨提示", "请填写追加评论的内容！", function () {
            return;
        });
        return;
        }
        var data = {
        token: common.getToken(),
        order_sn: orderInfo.order_sn,
        add_info: addInfo
        };
        common.getWxUserInfo(function (wxUserInfo) {
        data.nick_name = wxUserInfo.nickName;
        wx.request({
            url: api.operateReviews,
            data: data,
            method: 'POST',
            success: function (re) {
            if (re.data.code == 0) {
                var orderInfo = self.data.orderInfo;
                orderInfo.reviews.add_info = addInfo;
                orderInfo.reviews.add_info_time = new Date().toLocaleDateString().replace(/\//g, '-')
                self.setData({
                addReviewsTextarea:false,
                orderInfo: orderInfo
                })
            } else {
                common.errMsg(re.data)
            }

            },
            fail: function () {

            },
            complete: function () {

            }
        })
        });
    },
    chooseCoupon: function (event){
        var self = this;
        var coupon = event.currentTarget.dataset.coupon;
        var index = event.currentTarget.dataset.index;
        var arrTime = self.data.orderInfo.date.split("-");
        var orderInfoDate = new Date(arrTime[0], arrTime[1]-1, arrTime[2]).getTime() / 1000;
        var useCouponFlag = true;
        for (var q = 0; q < coupon.not_use_daily.length;q++){
            if (parseInt(orderInfoDate) + 8 * 60 * 60 == Number(coupon.not_use_daily[q])){
                useCouponFlag = false;
            }
        }
        if (!useCouponFlag){
            common.showMsg("温馨提示", "七夕节红包抵用当日无法使用，请其他日期使用！")
            return;
        }
        for (var i = 0; i < self.data.couponList.length;i++){
        self.data.couponList[i].chooseStatus = 0
        };
        if (coupon.chooseStatus == 0){
        self.data.couponList[index].chooseStatus = 1
        self.setData({ couponPrice: coupon.price})
        }else{
        self.data.couponList[index].chooseStatus = 0
        self.setData({ couponPrice: 0 })
        }
        var newCouponStatusList = self.data.couponList;
        self.setData({
        couponList: newCouponStatusList
        })
    },
    checkActivityCodeType: function () {
        var codeList = this.data.codeList;
        var len = codeList.length;
        for (var i = 0; i < len; i++) {
            if (codeList[i]['code'] == this.data.activity_code) {
                this.setData({ activity_code_type: 1 });
                break;
            }
        }
    },
    //退单
    refundOrder: function (e) {
        // console.log(e);return;
        var that = this;
        var orderInfo = e.currentTarget.dataset.order_info;
        var reserve_time = parseInt(orderInfo.reserve_time) - 8 * 60 * 60 + parseInt(orderInfo.begin_time) * 60;
        var diff = reserve_time - Date.parse(new Date()) / 1000;
        if (diff < 0) {
            common.showMsg('温馨提示', "您预约的电影时段已经开始，不能取消预约");
            return;
        }
        if (diff < config.orderRefundTimeOut) {
            wx.showModal({
                title: '温馨提示',
                content: '电影开始前5小时内取消预约将扣除预约金额10%的手续费，是否确认取消预约？',
                showCancel: true,
                confirmText: "继续使用",
                confirmColor: "#1AAD19",
                cancelText: "取消预约",
                cancelColor: "#a9a9a9",
                success: function (res) {
                    if (res.confirm) {
                        // console.log('用户点击确定')
                    } else if (res.cancel) {
                        that.requestRefundOrder(orderInfo);
                    }
                }
            })
        } else {
            wx.showModal({
                title: '温馨提示',
                content: '是否确认取消预约？',
                showCancel: true,
                confirmText: "继续使用",
                confirmColor: "#1AAD19",
                cancelText: "取消预约",
                cancelColor: "#a9a9a9",
                success: function (res) {
                    if (res.confirm) {
                        // console.log('用户点击确定')
                    } else if (res.cancel) {
                        that.requestRefundOrder(orderInfo);
                    }
                }
            })
        }
    },
    //发起退单请求
    requestRefundOrder: function (orderInfo) {
        console.log(orderInfo);
        var that = this;
        that.setData({ hidden: false });
        wx.request({
            url: api.refundFilmOrder,
            data: {
                order_sn: orderInfo.order_sn,
                token: common.getToken()
            },
            success: function (res) {
                if (res.data.code == 0) {
                    common.showMsg("温馨提示", "退单成功，预约金额会24小时内返回到您的微信中，请注意查收", function () {
                        wx.navigateBack({ url: "/page/order/pages/myOrder/myOrder" });
                    });
                } else {
                    common.errMsg(res.data);
                }
            },
            fail: function () {

            },
            complete: function () {
                that.setData({ hidden: true });
            }
        })
    }
  })
