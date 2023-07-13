// 域名地址(项目实地址)
const Host = 'wss://bfengzl.com/ws';
// const Host = 'ws://127.0.0.1:8089/ws';
// 标识
var auth = 'aaa';

export function setAuth(val){
  auth = val
}
export var webSocket = {
  // 连接Socket
  connectSocket: function (options) {
    wx.showLoading({
      title: '连接服务中',
      mask: true,
    });
    wx.connectSocket({
      url: Host,
      // protocols: [auth],
      success: function (res) {
        if (options) {
          options.success && options.success(res);
        }
      },
      fail: function (res) {
        if (options) {
          options.fail && options.fail(res);
        }
      }
    })
  },
  // 发送消息
  sendSocketMessage: function (options) {
    wx.sendSocketMessage({
      data: options.msg,
      success: function (res) {
        if (options) {
          options.success && options.success(res);
        }
      },
      fail: function (res) {
        if (options) {
          options.fail && options.fail(res);
        }
      }
    })
  },
  // 关闭Socket
  closeSocket: function (options) {
    wx.closeSocket({
      success: function (res) {
        if (options) {
          options.success && options.success(res);
        }
      },
      fail: function (res) {
        if (options) {
          options.fail && options.fail(res);
        }
      }
    })
  },
  // 收到消息
  onSocketMessageCallback: function (msg) {},
};

// 监听WebSocket打开连接
wx.onSocketOpen(function (res) {
    wx.hideLoading();
});

// 监听WebSocket错误
wx.onSocketError(function (res) {
  console.log('WebSocket连接打开失败，请检查！', res);
});
// 监听WebSocket接受到服务器的消息
wx.onSocketMessage(function (res) {
  webSocket.onSocketMessageCallback(res.data);
});