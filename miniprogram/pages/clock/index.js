// pages/clock.js
// const {WebSocket , auth} = require('../../utils/webSocket.js')
import Notify from '@vant/weapp/notify/notify';
import {
  webSocket as WebSocket,
  setAuth
} from '../../utils/webSocket'
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
    columns: ['test1', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10']
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
    WebSocket.connectSocket();
    // 设置接收消息回调
    WebSocket.onSocketMessageCallback = this.onSocketMessageCallback;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
    console.log(this.signature)
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
  /**
   * 刷新
   */
  onRefresh: function () {
    // 关闭已创建的连接
    WebSocket.closeSocket();
    // 创建连接
    WebSocket.connectSocket();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 签入操作
   */
  handleClockIn() {
    //服务端通讯 
    var msg = JSON.stringify({
      msg: 'clockIn',
      to: wx.getStorageSync('signature')
    })
    //发送数据
    WebSocket.sendSocketMessage({
      msg
    })
  },

  //刷新页面
  handleReload() {
    var msg = JSON.stringify({
      msg: 'reload',
      to: wx.getStorageSync('signature')
    })
    //发送数据
    WebSocket.sendSocketMessage({
      msg
    })
  },
  // Socket收到的信息
  onSocketMessageCallback: function (res) {
    if (this.logInfo === undefined) {
      this.logInfo = []
    }
    Notify({
      type: 'primary',
      message: res
    });
    this.logInfo.push({
      info: `${this.getLogDateStr()} ${res}`
    })
    this.setData({
      logInfo: this.logInfo
    })
    // 判断是否http开头，是则显示图片
    const httpFlag = new RegExp("http");
    if (httpFlag.test(res)) {
      console.log('img', res)
      this.setData({
        imgCodeSrc: res
      })
    }
  },
  getLogDateStr: function (e) {
    return `[${moment().format('YYYY-MM-DD HH:mm:ss')}]  >>>  🚀  `
  },
  // 清空日志
  handleDelLog() {
    this.logInfo = [];
    this.setData({
      logInfo: this.logInfo
    })
  },
  getCodeImg() {
    console.log('11111111111111111111')
  }
})