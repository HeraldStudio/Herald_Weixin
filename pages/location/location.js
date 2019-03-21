Page({
    data: {
        mapName: '',
        mapImage: '',
        point: {
            x: 0,
            y: 0
        },
        locations: [],     // 采集点的位置坐标和对应的 Wifi 列表
        wifiList: [],      // 当前扫描到的 Wifi 列表
        wifiMap: {},
        updateTime: 0,
        lastAddTime: 0,
        updateTimeDisplay: '未扫描'
    },
    onLoad(options) {
        if (options.data) {
            console.log(options.data);
            this.setData(JSON.parse(decodeURIComponent(options.data)));
        } else {
            this.setData(wx.getStorageSync('wifi-location-data') || {});
        }
        
        wx.showLoading({
            title: '准备中',
        });
        wx.startWifi({
            success: () => {
                wx.hideLoading();
                setInterval(() => {
                    this.updateCurrentPoint();
                    this.updateWifiEstimatedPoint();
                }, 1000);
            },
            fail: () => {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '当前设备不支持，请使用 Android 设备打开'
                })
            }
        });
    },
    onHide() {
        wx.setStorageSync('wifi-location-data', this.data);
    },
    onShareAppMessage() {
        let { locations, mapName, mapImage } = this.data;
        return {
            title: '室内定位 - ' + (this.data.mapName || '新建地图'),
            path: '/pages/location/location?data=' + encodeURIComponent(JSON.stringify({ locations, mapName, mapImage }))
        }
    },
    onNameInput(e) {
        this.setData({
            mapName: e.detail.value
        });
    },
    onTap(e) {
        if (!this.data.mapImage) {
            this.chooseMapImage();
        } else {
            console.log(e);
            let { x, y } = e.detail;
            x = Math.round(x - e.currentTarget.offsetLeft);
            y = Math.round(y - e.currentTarget.offsetTop);
            this.addLocation({ x, y });
        }
    },
    chooseMapImage() {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: (res) => {
                wx.showLoading({
                    title: '上传中',
                });
                let filePath = res.tempFilePaths[0];
                wx.request({
                    url: 'https://myseu.cn/ws3/api/qiniu',
                    success: (res) => {
                        let { key, uptoken: token } = res.data.result;
                        wx.uploadFile({
                            url: 'https://up.qbox.me',
                            filePath,
                            name: 'file',
                            formData: { key, token },
                            success: (res) => {
                                wx.hideLoading();
                                this.setData({
                                    mapImage: JSON.parse(res.data).url
                                });
                            }
                        });
                    }
                });
            },
        });
    },
    addLocation({ x, y }) {
        if (this.data.lastAddTime > this.data.updateTime) {
            wx.showModal({
                title: '无法采集',
                content: '当前位置已采集，请等待重新扫描',
            })
            return;
        }
        wx.showActionSheet({
            itemList: ['快速采集', '精确采集'],
            success: (res) => {
                [this.getWifiList, this.getPreciseWifiList][res.tapIndex].call(this, (result) => {
                    let { locations } = this.data;
                    let newLocation = {
                        point: { x: x, y: y },
                        wifiList: result
                    };
                    locations = locations.filter((k) => k.point.x !== x || k.point.y !== y);
                    locations.push(newLocation);

                    this.setData({
                        locations: locations,
                        lastAddTime: +new Date()
                    });

                    this.updateCurrentPoint();
                    this.updateWifiEstimatedPoint();

                    console.clear();
                    console.log(locations);

                    wx.showToast({
                        title: '采集成功',
                    });
                });
            }
        });
    },
    updateCurrentPoint() {
        this.estimateCurrentPoint((point) => {
            this.setData({ point });
        });
    },
    // 更新各 Wifi 的估测位置
    updateWifiEstimatedPoint() {
        for (let wifi of this.data.wifiList) {
            this.data.wifiMap[wifi.BSSID] = {
                wifi,
                estimatedPoint: this.getEstimatedLocation({ [wifi.BSSID]: 100 })
            };
        }
        this.setData({
            wifiMap: this.data.wifiMap
        })
    },
    // 传入当前搜索到的 wifi 信号对应的 object，返回估算的位置点
    // 用于：1. 通过传入用户搜到的 wifi，估算用户所在位置；
    //      2. 通过只传入 wifi 自己（假设信号为 100），估算 wifi 热点所在位置。
    getEstimatedLocation(currentWifiList) {
        let { locations } = this.data;
        if (!locations.length) {
            return { x: 0, y: 0 };
        }

        let neighbors = [];
        for (let location of locations) {
            let { point, wifiList } = location;
            let macsA = Object.keys(wifiList);
            let macsB = Object.keys(currentWifiList);

            let intersect = macsB.filter((k) => macsA.find((x) => x == k));
            if (!intersect.length) {
                continue;
            }

            let sum = 0;
            for (let mac of intersect) {
                sum += Math.pow(currentWifiList[mac] - wifiList[mac], 2);
            }
            let avg = sum / intersect.length;
            neighbors.push({
                point,
                distance: Math.sqrt(avg)
            })
        }
        neighbors = neighbors
            .filter(k => k.distance < 30)
            .sort((a, b) => a.distance - b.distance)

        let x = 0, y = 0, weight = 0;
        for (let neighbor of neighbors) {
            let w = 1 / Math.pow(neighbor.distance || 1, 2);
            x += neighbor.point.x * w;
            y += neighbor.point.y * w;
            weight += 1 * w;
        }
        weight = weight || 1;
        return { x: x / weight, y: y / weight };
    },
    estimateCurrentPoint(callback) {
        this.getWifiList((currentWifiList) => {
            callback(this.getEstimatedLocation(currentWifiList));
        })
    },
    getPreciseWifiList(callback) {
        wx.showLoading({
            title: '正在采集',
        })
        let comprehensive = {};
        let pickOnce = (times = 0) => {
            this.getWifiList((result) => {
                for (let mac in result) {
                    if (!comprehensive[mac]) {
                        comprehensive[mac] = { sum: 0, count: 0 };
                    }
                    comprehensive[mac].sum += result[mac];
                    comprehensive[mac].count++;
                }
            })
            if (times < 5) {
                setTimeout(() => pickOnce(times + 1), 1000);
            } else {
                for (let mac in comprehensive) {
                    comprehensive[mac] = Math.round(comprehensive[mac].sum / comprehensive[mac].count);
                }
                callback(comprehensive);
                wx.hideLoading();
            }
        }
        pickOnce();
    },
    getWifiList(callback) {
        wx.getWifiList({
            success: () => {
                wx.onGetWifiList(({ wifiList }) => {
                    // wifiList = wifiList.filter((k) => k.SSID !== 'seu-wlan');
                    let result = {};
                    let wifiMap = this.data.wifiMap;
                    for (let wifi of wifiList) {
                        wifi.BSSID = wifi.BSSID.replace(/:/g, '');
                        let { SSID, BSSID, signalStrength } = wifi;
                        result[BSSID] = signalStrength;
                    }
                    if (JSON.stringify(this.data.wifiList) !== JSON.stringify(wifiList)) {
                        this.setData({
                            wifiList,
                            updateTimeDisplay: Date().split(' ')[4],
                            updateTime: +new Date(),
                            wifiMap
                        });
                    }
                    callback(result);
                });
            },
            fail: console.error
        });
    },
    clear() {
        wx.showModal({
            title: '重置',
            content: '是否确认重置地图，重新采集？',
            success: (res) => {
                if (res.confirm) {
                    this.setData({
                        mapName: '',
                        mapImage: '',
                        point: {
                            x: 0,
                            y: 0
                        },
                        locations: [],     // 采集点的位置坐标和对应的 Wifi 列表
                        wifiList: [],      // 当前扫描到的 Wifi 列表
                        wifiMap: {},
                        updateTime: 0,
                        lastAddTime: 0,
                        updateTimeDisplay: '未扫描'
                    })
                }
            }
        });
    }
});