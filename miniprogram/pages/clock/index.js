// pages/clock.js
// const {WebSocket , auth} = require('../../utils/webSocket.js')
import Notify from '@vant/weapp/notify/notify';
import {
  webSocket as WebSocket,
  setAuth
} from '../../utils/webSocket'
import {
  grayscaleImage
} from '../../utils/grayscale';
import moment from 'moment'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logInfo: [],
    format: 'YYYY-MM-DD HH:mm:ss',
    userInfo: {},
    show: false,
    columns: ['未知', 'test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10'],
    codeShow: false,
    codeValue: '',
    imgSrcValue: '',
    loginShow: false,
    receiverName: '', // 接收者
    onlineUserArr: [], //在线者
    username: '',
    password: '',
    viewResultShow: false,
    viewResultImgUrl: '',
    controllerName: '',
    userInfo: []
  },
  onChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    wx.setStorageSync('signature', value)
  },

  onConfirm() {
    this.signature = wx.getStorageSync('signature')
    console.log(this.signature)
    this.setData({
      receiverName: wx.getStorageSync('signature')
    });
    WebSocket.connectSocket();
    // 设置接收消息回调
    WebSocket.onSocketMessageCallback = this.onSocketMessageCallback;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.getUserInfo();
    if (wx.getStorageSync('signature')) {
      this.setData({
        show: false,
        signature: wx.getStorageSync('signature')
      });
      WebSocket.connectSocket();
      // 设置接收消息回调
      WebSocket.onSocketMessageCallback = this.onSocketMessageCallback;
    } else {
      this.setData({
        show: true
      });
    }
    this.signature = wx.getStorageSync('signature')
    this.setData({
      receiverName: wx.getStorageSync('signature')
    });
    grayscaleImage('https://www.bfengzl.com/images/fd212194ef36a616b0054613b.png').then(function (result) {
      console.log('处理后的图片路径：', result);
    })
    .catch(function (error) {
      console.error('处理图片出错：', error);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var setIntervalEvent = setInterval(() => {
      this.setData({
        nowTime: moment().format('HH:mm:ss')
      })
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    WebSocket.closeSocket();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.onRefresh();
  },
  /** 刷新 */
  onRefresh: function () {
    // 关闭已创建的连接
    WebSocket.closeSocket();
    // 创建连接
    WebSocket.connectSocket();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },

  getUserName() {
    var msg = JSON.stringify({
      msg: 'getName',
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 签入操作 */
  handleClockIn() {
    //服务端通讯 
    var msg = JSON.stringify({
      msg: 'clockIn',
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 刷新页面 */
  handleReload() {
    var msg = JSON.stringify({
      msg: 'reload',
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 登录操作 */
  handleLogin() {
    const msg = JSON.stringify({
      msg: 'login',
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** Socket收到的信息 */
  onSocketMessageCallback: function (res) {
    console.log(res)
    // 获取链接用户
    if (res.includes('当前连接的全部用户')) {
      const onlineUser = res.split('：')[1].split('|').filter((item) => item !== '')
      this.setData({
        onlineUserArr: onlineUser
      })
      this.getUserName();
    }
    if (this.logInfo === undefined) {
      this.logInfo = []
    }
    Notify({
      type: 'primary',
      message: res
    });
    // 日志
    this.logInfo.push({
      info: res,
      time: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    this.setData({
      logInfo: this.logInfo
    })
    // // 判断是否http开头，是则显示图片
    // const httpFlag = new RegExp("http");
    // if (httpFlag.test(res)) {
    //   console.log('img', res)
    //   this.setData({
    //     imgCodeSrc: res
    //   })
    // }
    const _res = res.includes('{') ? JSON?.parse(res) : res;
    if (_res?.msg?.status === 200 && _res?.msg?.type === 'view') {
      this.setData({
        viewResultShow: true,
        viewResultImgUrl: `https://bfengzl.com/images/${_res.msg.url}`
      })
      return
    }
    if (_res.accept === `userName_${wx.getStorageSync('signature')}`) {
      this.setData({
        controllerName: _res.msg
      })
      return
    }
    if (_res?.msg?.status === 200) {
      this.setData({
        codeShow: true,
        imgSrcValue: `https://bfengzl.com/images/${_res.msg.url}`
      })
    }

  },
  getLogDateStr: function (e) {
    return `[${moment().format('YYYY-MM-DD HH:mm:ss')}]  >>>  🚀  `
  },
  /** 清空日志 */
  handleDelLog() {
    this.logInfo = [];
    this.setData({
      logInfo: this.logInfo
    })
  },
  /** 回传验证码 */
  onConfirmCode() {
    console.log(this.data.codeValue)
    const msg = JSON.stringify({
      msg: 'code',
      value: this.data.codeValue,
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 手动填写账户密码 */
  handleManual() {
    this.setData({
      loginShow: true
    })
  },
  /** 手动账户密码回调 */
  onConfirmLogin() {
    const {
      username,
      password
    } = this.data
    const info = JSON.stringify({
      username,
      password
    })
    const msg = JSON.stringify({
      msg: 'ManualLog',
      value: info,
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 注销 */
  handleSignOut() {
    const msg = JSON.stringify({
      value: 'signOut',
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 查看打卡结果 */
  handleViewResult() {
    const msg = JSON.stringify({
      value: 'viewResult',
      to: wx.getStorageSync('signature')
    })
    this.send(msg);
  },
  /** 发送数据 */
  send(msg) {
    WebSocket.sendSocketMessage({
      msg
    })
  },
  /** 接受者tab 点击事件 */
  handleChangeAccept() {
    console.log('切换')
    // this.setData({
    //   show: true
    // })
  },
  /** 获取用户信息 */
  getUserInfo() {
    wx.request({
      url: 'https://wujicode.cn/api/private/object?appid=clock&schemaid=user_db&schemakey=c1bd23ae666d4e17bc3ac11a5fc0d366',
      method: 'get',
      success: res => {
        const {
          data
        } = res;

        if (data.code === 200) {
          this.userInfo = data.data;
          this.setData({
            userInfo: this.userInfo
          });
        }
      },
      fail: err => {
        console.error(err);
      }
    })
  },
  /** 快捷点击 */
  handleSelectUser(row) {
    console.log(row)
    const {
      item
    } = row.currentTarget.dataset;
    this.setData({
      username: item.username,
      password: item.password,
    })
  },
  /** 识别图片OCR */
  pictureOCR(url) {
    // const invokeRes = wx.serviceMarket.invokeService({
    //   service: '',
    //   api: '',
    //   data: {
    //     img_url: "https://www.bfengzl.com/images/8b48fb7bced010827955451a7.png",
    //     data_type: 3,
    //     ocr_type: 8
    //   }
    // });
    // console.log('111111', invokeRes)
  }

})