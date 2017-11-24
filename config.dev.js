/**
 * 小程序配置文件
 */


//var host = "ft.qnbar.com"
// var host = "ft.qnbar.cn/test/api";
var host = "ft.qnbar.cn/develop/api";
var server = "https://" + host;
var config = {
  // oss图片接口
  imageUrl: `http://qnbar-test.oss-cn-hangzhou.aliyuncs.com/`,
  appUiUrl: "http://qnbar-test.oss-cn-hangzhou.aliyuncs.com/ftang/appUI/",
  payType: {
    appointment: 1,
    recharge: 2,
    deposit: 3,
    compensate: 4
  },
  payTimeOutTime: 5 * 60,
  errDug: true,
  orderRefundTimeOut: 5 * 60 * 60
};

var api = {
  getFilmList: server + "/film/getFilmList",
  getUserBaseInfo: server + "/user/getUserBaseInfo",
  UnifiedOrder: server + "/wx/UnifiedOrder",
  getDepositNum: server + "/getDepositNum",
  getStoreList: server + "/store/getStoreList",
  openRoom: server + "/index/openRoom",
  getRoomInfo: server + "/room/getRoomInfo",
  getDurationStateList: server + "/duration/getDurationStateList",
  createOrder: server + "/order/createOrder",
  payCompensate: server + "/compensate/createOrder",
  refundOrder: server + "/wx/refundOrder",
  getDepositSN: server + "/deposit/getDepositSN",
  baseInterface: server + "/setting/baseInterface",
  chargeDeposit: server + "/deposit/chargeDeposit",
  getOrderList: server + "/order/getOrderList",
  userRegister: server + "/common/userRegister",
  login: server + "/common/login",
  getSMSCode: server + "/common/getSMSCode",
  setPassword: server + "/common/setPassword",
  userDeleteOrder: server + "/order/userDeleteOrder",
  activityCodePay: server + "/order/activityCodePay",
  getUserCodeList: server + "/activity/getUserCodeList",
  getSysCopyDaily: server + "/setting/getSysCopyDaily",
  getStoreMaxCopyTime: server + "/setting/getStoreMaxCopyTime",
  createReviews: server + "/reviews/createReviews",
  getStoreReviewsList: server + "/reviews/getStoreReviewsList",
  isShowRed: server + "/user/isShowRed",
  getVideo: server + "/vanvideo/getVideo",
  getEquStatus: server + "/equ/getEquStatus",
  setEquStatus: server + "/equ/setEquStatus",
  setFilmSeriesPlay: server + "/equ/setFilmSeriesPlay",
  getFilmSeriesPlay: server + "/equ/getFilmSeriesPlay",
  getUserActivity: server + "/activity/getUserActivity",
  createCoupon: server + "/coupon/createCoupon",
  getCoupon: server + "/coupon/getCoupon",
  couponPay: server + "/order/couponPay"
}

var errCode = {
  "998": "系统未知错误",
  "1000": "系统内部错误",
  "1001": "参数错误",
  "1002": "请求方式错误",
  "1008": "文件上传失败",
  "1010": "短信发送失败",
  "1011": "密码错误",
  "1012": "登录已过期，请重新登陆",
  "1013": "未登录",
  "1014": "图片上传错误",
  "1015": "获取微信OPENID失败",
  "1016": "账号已禁用",
  "1017": "账号不存在",
  "1018": "验证码错误",
  "8000": "你有未消费订单，暂时不能申请退还押金",
  "8001": "你有罚金，暂时不能申请退还押金",
  "8040": "二维码错误",
  "8041": "订单不存在",
  "8042": "关系不存在",
  "8045": "订单当前时间不允许",
  "8046": "当前时间不允许退单",
  "8047": "退款失败",
  "8048": "该订单不允许退单",
  "8103": "开门失败,请在预约的前五分钟扫码开门",
  "8104": "开门失败,无可用订单",
  "2001": "房间错误",
  "2002": "所创建的房间的门店不存在",
  "2003": "房间或者门店不存在",
  "2004": "门店地址错误",
  "3002": "门店错误",
  "4001": "时段错误",
  "4002": "当前时段在其他时段中",
  "5001": "该员工手机号已经存在",
  "5002": "该员工编码不存在",
  "5003": "员工门店关系已经存在",
  "6001": "电影的hash已存在",
  "8205": "您的免费观影次数已达上限，请选择其他方式支付",
  "8206": "体验码已被使用",
  "8207": "体验码已过期"
}

module.exports = {
  config: config,
  api: api,
  errCode: errCode
}