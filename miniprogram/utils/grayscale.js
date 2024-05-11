// 将图像转换为灰度图像
export function grayscaleImage(imgUrl) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: imgUrl,
      success: res => {
        const canvasId = 'grayscaleCanvas';
        const canvas = wx.createCanvasContext(canvasId);

        // 设置canvas的宽高
        const width = res.width;
        const height = res.height;

        // 绘制图片到canvas
        canvas.drawImage(res.path, 0, 0, width, height);

        // 在绘制完成后执行回调函数
        canvas.draw(false, () => {
          // 获取画布上的图像数据
          wx.canvasGetImageData({
            canvasId: canvasId,
            x: 0,
            y: 0,
            width: width,
            height: height,
            success: imgDataRes => {
              let data = imgDataRes.data;
              // 对每个像素进行灰度化处理
              for (let i = 0; i < data.length; i += 4) {
                let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg; // red
                data[i + 1] = avg; // green
                data[i + 2] = avg; // blue
              }
              // 将处理后的数据放回
              wx.canvasPutImageData({
                canvasId: canvasId,
                data: data,
                x: 0,
                y: 0,
                width: width,
                height: height,
                success: () => {
                  // 导出图片
                  wx.canvasToTempFilePath({
                    canvasId: canvasId,
                    success: exportRes => {
                      const fileManager = wx.getFileSystemManager();
                      fileManager.readFile({
                        filePath: exportRes.tempFilePath,
                        encoding: 'base64',
                        success: readRes => {
                          resolve('data:image/png;base64,' + readRes.data);
                        },
                        fail: err => {
                          reject(err)
                        }
                      })
                    },
                    fail: err => {
                      reject(err);
                    }
                  });
                },
                fail: err => {
                  reject(err);
                }
              });
            },
            fail: err => {
              reject(err);
            }
          });
        });
      },
      fail: err => {
        reject(err);
      }
    });
  });
}