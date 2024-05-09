// ==UserScript==
// @name         打卡脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://om.tencent.com/attendances/*
// @match        https://om.tencent.com/attendances/*
// @match        https://tapd.tencent.com/ptlogin/ptlogins/*
// @grant        GM_getValue
// @require      https://cdn.bootcdn.net/ajax/libs/moment.js/2.29.4/moment.min.js
// @require      http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// ==/UserScript==

// ***************xpath -- start*********************

// 签入
var checkin_btn = '//*[@id="checkin_btn"]'
// 签出
var checkout_btn = '//*[@id="checkout_btn"]'
// 加班签出
var overtime_checkout_btn = '//*[@id="overtime_checkout_btn"]'
// 确认
var check = '//*[@id="tdialog-buttonwrap"]/a[1]'
// 取消
var clost = '//*[@id="tdialog-buttonwrap"]/a[2]'
// 验证码输入框
var code_input = '//*[@id="code_input"]'
// 验证码图片点击切换事件
var secur_code_change = '//*[@id="secur_code_change"]'
// 图片
var image = '//*[@id="image"]'
// 再次确认
var checkS = '//*[@id="tdialog-buttonwrap"]/a'
// 登录按钮
var login = '//*[@id="login_button"]'
// 选中一周内自动登录
var checkboxSevenDay = '//*[@id="rememberButton"]'
// 英文账号名
var username = '//*[@id="username"]'
// 密码框
var password = '//*[@id="password_input"]'
// 判断是否存在验证码 --暂时不用这个判断
var authCode = '//*[@id="check_in_table"]/tbody/tr[5]/td[1]'
// 验证码input -- 根据这个判断
var codeValue = '//*[@id="code_input"]'
// 验证码错误文案
var codeError = '//*[@id="code-div"]/div[2]'
// 注销
var signOut = '//*[@id="user_infor"]/div[3]/a'
// ***************xpath -- end***********************

// 设置时间
var globalTime = null
var formatData = 'YYYY-MM-DD HH:mm:ss'

var ws = null
var id = 'test1'
var msg = {
    msg: '',
    // 接受依据
    accept:''
}
var nowTimeStr = null
// webSocket链接地址
var web_socket_url = 'wss://bfengzl.com/ws';
//var web_socket_url = 'wss://124.222.160.56/ws';

$(document).ready(function () {
    webSocket()
})

// 获取时间
getTime = function getTime() {
    nowTimeStr = moment().format('HH:mm:ss').split(':').join('')
    console.log(nowTimeStr)
    msg.msg = '打卡脚本执行中...'
    ws.send(JSON.stringify(msg))
    if (isAfternoon()) {
        //下午
        if(isDom(checkout_btn)){
            nightEvent()
            return
        }
        if(isDom(login)){
            msg.msg = '需要执行【登录】操作，再进行【打卡】。'
            ws.send(JSON.stringify(msg))
            return
        }
        msg.msg = '签出DOM不存在，无法执行【签出】操作，先执行【刷新打卡页面】，再进行操作。'
        ws.send(JSON.stringify(msg))
        return
    }
    //上午
    if(isDom(checkin_btn)){
        morningEvent()
        return
    }
    if(isDom(login)){
        msg.msg = '需要执行【登录】操作，在进行【打卡】。'
        ws.send(JSON.stringify(msg))
        return
    }
    msg.msg = '签入DOM不存在，无法执行【签入】操作，先执行【刷新打卡页面】，再进行操作。'
    ws.send(JSON.stringify(msg))
    return
}

// 上午执行事件 - 签入
function morningEvent() {
    // 早上打卡时间段 - 签入
    const _morningFlag = +'080000' <= +nowTimeStr && +nowTimeStr <= +'093000'
    if (_morningFlag) {
        const pro = new Promise((resolve, reject) => {
            checkinBtn()
            msg.msg = '已打开签入确认弹框，请等待...'
            ws.send(JSON.stringify(msg))
            setTimeout(() => {
                resolve()
            }, 2000)
        })
        pro.then(() => {
            msg.msg=isDom(codeValue)
            ws.send(JSON.stringify(msg))
            if(isDom(codeValue)){
                getCode();
                return
            }
            checkAffirm()
            //closeIt
        })
        return
    }
    if (!Xpath(checkin_btn)) {
        msg.msg = '已签入'
        ws.send(JSON.stringify(msg))
        return
    }
    msg.msg = '现在时间点还不可以进行打卡，请在[08:00:00 - 09:30:00]打卡。'
    ws.send(JSON.stringify(msg))
}

//下午执行事件 - 签出
function nightEvent() {
    // 晚上打卡时间段 - 签出
    const _ngihtFlag = +'180000' <= +nowTimeStr && +nowTimeStr <= +'240000'
    if (_ngihtFlag) {
        const pro = new Promise((resolve, reject) => {
            checkinOut()
            setTimeout(() => {
                resolve()
            }, 2000)
        })
        pro.then(() => {
            msg.msg=isDom(codeValue)
            ws.send(JSON.stringify(msg))
            if(isDom(codeValue)){
                getCode();
                return
            }
            checkAffirm()
            //closeIt
        })
        return
    }
    msg.msg = '现在时间点还不可以进行打卡，请在[18:00:00 - 24:00:00]打卡。'
    ws.send(JSON.stringify(msg))
}
// 签入
function checkinBtn() {
    Xpath(checkin_btn).click()
}

// 签出
function checkinOut() {
    Xpath(checkout_btn).click()
}

// 确认
function checkAffirm() {
    console.log('🚀 确认中...', moment().format(formatData))
    Xpath(check).click()
    msg.msg = '打卡成功，待验证'
    ws.send(JSON.stringify(msg))
    //ws.closeSocket()
}

// 关闭弹框
function clostDialog() {
    console.log('🚀 关闭弹框...', moment().format(formatData))
    Xpath(checkS).click()
    msg.msg = '关闭弹框'
    ws.send(JSON.stringify(msg))
    //ws.closeSocket()
}

// 取消
function closeIt() {
    console.log(`[${moment().format(formatData)}]  >>>  🚀 取消...`)
    Xpath(clost).click()
    msg.msg = '已取消操作'
    ws.send(JSON.stringify(msg))
    //ws.closeSocket()
}

//登录
function Login(){
    console.log(`[${moment().format(formatData)}]  >>>  🚀 登录...`)
    Xpath(login).click()
    msg.msg='登录中...'
    ws.send(JSON.stringify(msg))
}

// 账号填写
function usernameValue(usernameVal = 'v_boofeng'){
    console.log(`[${moment().format(formatData)}]  >>>  🚀 username填写中...`)
    Xpath(username).value = usernameVal
    msg.msg='username填写中...'
    ws.send(JSON.stringify(msg))
}

// 密码填写
function passwordValue(passwordVal = 'wq8607WQA'){
    console.log(`[${moment().format(formatData)}]  >>>  🚀 password填写中...`)
    Xpath(password).value = passwordVal
    msg.msg='password填写中...'
    ws.send(JSON.stringify(msg))
}

function setCodeValue(value){
    console.log(`[${moment().format(formatData)}]  >>>  🚀 验证码校验中...`)
    Xpath(codeValue).value = value
    msg.msg='验证码校验中...'
    ws.send(JSON.stringify(msg))
}

// 注销
function signOutHandle(){
    console.log(`[${moment().format(formatData)}]  >>>  🚀 注销...`)
    Xpath(signOut).click()
    msg.msg='注销中...'
    ws.send(JSON.stringify(msg))
}

//通过xpath获取dom元素 → 执行事件
function Xpath(xpath) {
    //var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    var result = document.evaluate(xpath, document).iterateNext()
    return result
}

// 判断Xpath在当前的页面元素是否存在
function isDom(xpath){
    // 获取页面中的根元素
    var rootNode = document.documentElement;
    // 执行 XPath 查询
    var result = document.evaluate(xpath, rootNode, null, XPathResult.ANY_TYPE, null);
    // 迭代查询结果
    var element = result.iterateNext();
    // 判断是否找到了匹配的元素
    return element;
}

// 判断上午 - false  下午 - true
function isAfternoon() {
    // 当天中午距离此刻的时间
    let timeDis = moment().startOf('day').valueOf() + 12 * 60 * 60 * 1000 - new Date().valueOf()
    if (timeDis < 0) {
        console.log('现在已经是下午')
    } else {
        console.log('现在已经是上午')
    }
    return timeDis < 0
}
const dialog = '//*[@id="tdialog-wrapper"]'
//验证码图片--存在返回验证码， 不存在 - false
function getCode() {
    msg.msg = '存在验证码，图片链接正在回传中...';
    ws.send(JSON.stringify(msg));
    setTimeout(()=>{
        screenshot()
    },2000)
}

// Base64 转 blob 函数
function base64ToBlob(base64, mime) {
    mime = mime || ''
    var sliceSize = 1024
    var byteChars = window.atob(base64)
    var byteArrays = []

    for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
        var slice = byteChars.slice(offset, offset + sliceSize)

        var byteNumbers = new Array(slice.length)
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i)
        }
        var byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: mime })
}

function screenshot(){
    // 获取要截取的 DOM 元素
    var targetElement = document.getElementById('image');
    // 创建一个 canvas 元素用于绘制截图
    var canvasElement = document.createElement('canvas');
    canvasElement.width = targetElement.offsetWidth;
    canvasElement.height = targetElement.offsetHeight;
    var context = canvasElement.getContext('2d');
    setTimeout(()=>{
        // 绘制截图
        context.drawImage(targetElement, 0, 0, canvasElement.width, canvasElement.height);
        // 将 canvas 元素转换为图像数据（Base64 格式）
        var imageData = canvasElement.toDataURL('image/png');
        // 创建一个 FormData 对象用于上传文件
        var formData = new FormData();
        formData.append('screenshot', dataURItoBlob(imageData), 'screenshot.png');
        $.ajax({
            url: 'https://bfengzl.com/upload',
            type: 'post',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (res) {
                console.log('截图上传成功',res);
                msg.msg = res
                ws.send(JSON.stringify(msg))
            },
            error: function (err) {
                const error = {
                    url:'',
                    status:'400'
                }
                msg.msg = error
                ws.send(JSON.stringify(msg))
            }
        })
    }, 3000)
}

// 辅助函数：将数据 URI 转换为 Blob 对象
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// 获取生成的图片（调用此函数可获取图片并上传）
function getCanvas(canvas) {
    // 获得Canvas对象
    let ctx = canvas.getContext('2d')
    ctx.drawImage(canvas, 0, 500, 500, 500) // 参考 drawImage() 函数用法
    let dataURL = canvas.toDataURL('image/png') // 将canvas转换成base64
    dataURL = dataURL.substring(dataURL.indexOf(',') + 1, dataURL.length)
    var blob = base64ToBlob(dataURL, 'image/png') // 将base64转换成blob
    var imgData = new FormData()
    imgData.append('screenshot', blob, 'screenshot.png')
    // let imgSrc = window.URL.createObjectURL(blob)
    // console.log(imgSrc, '1111111111')
    $.ajax({
        url: 'https://bfengzl.com/upload',
        type: 'post',
        data: imgData,
        cache: false,
        processData: false,
        contentType: false,
        success: function (res) {
            console.log('截图上传成功',res);
            msg.msg = res
            msg.msg.type = 'view'
            ws.send(JSON.stringify(msg))
        },
        error: function (err) {
            const error = {
                url:'',
                status:'400'
            }
            msg.msg = error
            ws.send(JSON.stringify(msg))
        }
    })
}

// 获取打卡用户名称
function getUserName(){
    const element = document.querySelector('.dropdown-toggle');
    const content = element.textContent.replace(/\s+/g, ' ').trim();
    return content;
}

function initMsg(){
    msg.msg = '';
    msg.accept = '';
}

//websocket服务
const webSocket = () => {
    ws = new WebSocket(web_socket_url, id)
    // ws = new WebSocket('ws://127.0.0.1:8099', id)
    //申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
    ws.onopen = function () {
        //当WebSocket创建成功时，触发onopen事件
        //ws.send("hello"); //将消息发送到服务端
        heartCheck.reset().start(); //心跳检测重置
    }
    ws.onmessage = function (e) {
        heartCheck.reset().start(); //拿到任何消息都说明当前连接是正常的
        let info = e.data;
        console.log(`[${moment().format(formatData)}]  >>>  🚀 ${info}`);
        if(info == `webSocket连接成功-${id}`){
            msg.msg = `打卡页面响应-连接成功`
            ws.send(JSON.stringify(msg))
            return
        }

        // 角色
        let isRole = info.includes(id);
        // 打卡
        let isClockIn = info.includes('clockIn') || info.includes('打卡');
        //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
        if (isRole && isClockIn) {
            msg.msg = '正在执行中，请等待...'
            ws.send(JSON.stringify(msg))
            getTime()
            return
        }
        // 刷新
        let isReload = info.includes('reload');
        if (isRole && isReload) {
            location.reload()
            msg.msg = '已刷新页面'
            ws.send(JSON.stringify(msg))
            return
        }
        // 登录
        let isLogin = info.includes('login');
        // 手动登录
        let isManualLog = info.includes('ManualLog');
        if (isRole && (isLogin || isManualLog)) {
            // 判断登录按钮是否存在
            if(isDom(login)){
                if(isManualLog){
                    console.log(JSON.parse(info),'手动登录')
                    const _info = JSON.parse(info);
                    const { username, password} = JSON.parse(_info.value);
                    console.log(username, password)
                    usernameValue(username);
                    passwordValue(password);
                }else{
                    usernameValue();
                    passwordValue();
                }
                Login();
                msg.msg = '已登录'
                ws.send(JSON.stringify(msg))
                return
            }
            msg.msg = '登录DOM不存在，无法执行【登录】操作，可以正常进行【打卡操作】'
            ws.send(JSON.stringify(msg))
            return
        }
        //填写验证码
        let isCode = info.includes('code');
        if (isRole && isCode) {
            let _info = JSON.parse(info);
            setCodeValue(_info.value);
            msg.msg = '已填写验证码'
            ws.send(JSON.stringify(msg))
            console.log(isDom(codeError))
            setTimeout(()=>{
                // 执行确认操作
                checkAffirm()
                //closeIt
                setTimeout(()=>{
                    if(isDom(check)){
                        msg.msg = '验证码输入有误，请重新【刷新页面】，再进行打卡操作'
                        ws.send(JSON.stringify(msg))
                        return
                    }else{
                        msg.msg = '验证码输入正确，请前往地址查看是否已打卡'
                        ws.send(JSON.stringify(msg))
                    }
                },1000)

            },1000)
            return
        }
        // 注销
        let isSignOut = info.includes('signOut');
        if (isRole && isSignOut) {
            signOutHandle();
            msg.msg = '已注销'
            ws.send(JSON.stringify(msg))
            return
        }
        // 查看打卡结果
        let isViewResult = info.includes('viewResult');
        if (isRole && isViewResult) {
            msg.msg = '正在获取打卡结果中...'
            ws.send(JSON.stringify(msg))
            setTimeout(()=>{
                html2canvas(document.getElementById('check_in_tbl')).then(canvas => {
                    console.log(canvas)
                    getCanvas(canvas);
                })
            },2000)
            return
        }
        let isGetName =info.includes('getName')
        if(isRole &&isGetName){
            msg.msg = getUserName();
            msg.accept = `userName_${id}`;
            ws.send(JSON.stringify(msg))
            initMsg()
        }
    }
    ws.onclose = function (e) {
        //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
        console.log('websocket 断开: ' + e.code + 'reason:' + e.reason + '是否刷新' + e.wasClean)
        reconnect()
    }
    ws.onerror = function (e) {
        //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
        console.log('websocket发生错误' + e)
        reconnect()
    }
}

// 解决wabsocket 经常断开，加入心跳

var lockReconnect = false //避免ws重复连接

// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
    ws.close()
}

function reconnect() {
    if (lockReconnect) return
    lockReconnect = true
    setTimeout(function () {
        //没连接上会一直重连，设置延迟避免请求过多
        webSocket()
        lockReconnect = false
    }, 2000)
}

//心跳检测
var heartCheck = {
    timeout: 200000, //200s发一次心跳
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function() {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function() {
        var self = this;
        this.timeoutObj = setTimeout(function() {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            ws.send("ping");
            self.serverTimeoutObj = setTimeout(function() { //如果超过一定时间还没重置，说明后端主动断开了
                ws.close(); //这里为什么要在send检测消息后，倒计时执行这个代码呢，因为这个代码的目的时为了触发onclose方法，这样才能实现onclose里面的重连方法
                //所以这个代码也很重要，没有这个方法，有些时候发了定时检测消息给后端，后端超时（我们自己设定的时间）后，不会自动触发onclose方法。我们只有执行ws.close()代码，让ws触发onclose方法
                //的执行。如果没有这个代码，连接没有断线的情况下而后端没有正常检测响应，那么浏览器时不会自动超时关闭的（比如谷歌浏览器）,谷歌浏览器会自动触发onclose
                //是在断网的情况下，在没有断线的情况下，也就是后端响应不正常的情况下，浏览器不会自动触发onclose，所以需要我们自己设定超时自动触发onclose，这也是这个代码的
                //的作用。

            }, self.timeout)
        }, this.timeout)
    }
}
