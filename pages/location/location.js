Page({
    // 初始数据
    data: {
        mapName: '',       // 地图名字
        mapImage: '',      // 地图图片 url
        point: {           // 当前估测所在点
            x: 0,
            y: 0
        },
        locations: [],     // 各个采集点对应的位置和 Wifi 列表
        wifiList: [],      // 当前位置扫描到的 Wifi 列表
        wifiMap: {},       // 当前位置扫描到的 Wifi MAC 地址对应的 Wifi 和它们的预估位置
        updateTime: 0,     // 上次 Wifi 扫描结果发生变化的时间，毫秒
        lastAddTime: 0,    // 上次进行采集的时间，毫秒
    },
    onLoad(options) {
        // 如果有分享来的数据，取出分享数据进行展示
        if (options.data) {
            console.log(options.data);
            this.setData(JSON.parse(options.data));
        } else {
            // 否则尝试取本地缓存数据，无缓存则用初始数据
            this.setData(wx.getStorageSync('wifi-location-data') || {});
        }
        
        // 启动 Wifi 扫描
        wx.startWifi({
            success: () => {
                // 每隔 1 秒重新扫 Wifi，然后估算当前位置和各个 Wifi 的估计位置
                setInterval(() => {
                    this.updateCurrentPoint();
                    this.updateWifiEstimatedPoint();
                }, 1000);
            },
            fail: () => {
                wx.showModal({
                    title: '提示',
                    content: '当前设备不支持，请使用 Android 设备打开'
                })
            }
        });
    },
    onHide() {
        // 小程序关闭时将数据缓存在本地
        wx.setStorageSync('wifi-location-data', this.data);
    },
    onShareAppMessage() {
        // 转发分享时，将当前的采集点信息、地图名和地图图片 url 发送出去
        let { locations, mapName, mapImage } = this.data;
        return {
            title: '室内定位 - ' + (this.data.mapName || '新建地图'),
            path: '/pages/location/location?data=' + JSON.stringify({ locations, mapName, mapImage })
        }
    },
    onNameInput(e) {
        // 输入地图名字，改变地图名字
        this.setData({
            mapName: e.detail.value
        });
    },
    onTap(e) {
        // 如果没有地图图片，选择并上传地图图片
        if (!this.data.mapImage) {
            this.chooseMapImage();
        } else {
            // 否则进行采集
            console.log(e);
            let { x, y } = e.detail;
            // 将事件点击的位置换算成相对于正方形地图区域的位置
            x = Math.round(x - e.currentTarget.offsetLeft);
            y = Math.round(y - e.currentTarget.offsetTop);
            this.addLocation({ x, y });
        }
    },
    chooseMapImage() {
        // 选择并上传地图图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album'],
            // 得到已选图片，准备上传
            success: (res) => {
                wx.showLoading({
                    title: '上传中',
                });
                let filePath = res.tempFilePaths[0];
                // 获得当前小猴七牛key和token
                wx.request({
                    url: 'https://myseu.cn/ws3/api/qiniu',
                    success: (res) => {
                        let { key, uptoken: token } = res.data.result;
                        // 将图片上传到七牛
                        wx.uploadFile({
                            url: 'https://up.qbox.me',
                            filePath,
                            name: 'file',
                            formData: { key, token },
                            success: (res) => {
                                wx.hideLoading();
                                // 得到图片地址，进行展示
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
    // 点击地图，进行采集
    addLocation({ x, y }) {
        // 如果上次采集之后 Wifi 列表还没变，不让采集新的
        if (this.data.lastAddTime > this.data.updateTime) {
            wx.showModal({
                title: '无法采集',
                content: '当前位置已采集，请等待重新扫描',
            })
            return;
        }
        // 选择采集一次还是五次
        wx.showActionSheet({
            itemList: ['快速采集', '精确采集'],
            success: (res) => {
                // 如果采集一次，用 getWifiList，否则用 getPreciseWifiList，参数一样
                [this.getWifiList, this.getPreciseWifiList][res.tapIndex].call(this, (result) => {
                    let { locations } = this.data;

                    // 构造已有采集点，用坐标和采集到的 wifi list（map）
                    let newLocation = {
                        point: { x: x, y: y },
                        wifiList: result
                    };

                    // 在之前已有的采集点中，去掉跟要采集的地点坐标相同的
                    locations = locations.filter((k) => k.point.x !== x || k.point.y !== y);

                    // 将当前地点添加到已有采集点
                    locations.push(newLocation);

                    // 更新界面上的采集点，更新最近采集时间
                    this.setData({
                        locations: locations,
                        lastAddTime: +new Date()
                    });

                    // 在 data 中的采集点更新完之后，利用新的采集点列表，更新估算自己位置和估算 Wifi 热点位置
                    this.updateCurrentPoint();
                    this.updateWifiEstimatedPoint();

                    // 打出最新的采集点列表
                    console.log(locations);

                    wx.showToast({
                        title: '采集成功',
                    });
                });
            }
        });
    },
    updateCurrentPoint() {
        // 更新估算自己位置
        // 首先更新 Wifi 列表再估算
        this.getWifiList((currentWifiList) => {
            // 用当前搜到的 Wifi 列表来估算，即得到自己的估计位置
            this.setData({ point: this.getEstimatedLocation(currentWifiList) });
        })
    },
    // 更新各 Wifi 的估测位置
    updateWifiEstimatedPoint() {
        // 对于每个 Wifi
        for (let wifi of this.data.wifiList) {
            // 把这个 Wifi 的估测位置更新到 wifiMap 中
            this.data.wifiMap[wifi.BSSID] = {
                wifi,
                // 把 Wifi 看做一个只搜到了自己的人
                // 模拟一个只搜到了它自己的 Wifi 列表，进行估算，即得到这个 Wifi 自己的估测位置
                estimatedPoint: this.getEstimatedLocation({ [wifi.BSSID]: 100 })
            };
        }
        // 将 wifiMap 更新到界面
        this.setData({
            wifiMap: this.data.wifiMap
        })
    },
    // 传入当前搜索到的 wifi 信号对应的 object，返回估算的位置点
    // 用于：1. 通过传入用户搜到的 wifi，估算用户所在位置；
    //      2. 通过只传入 wifi 自己（并假设信号为 100），估算 wifi 热点所在位置。
    getEstimatedLocation(currentWifiList) {
        let { locations } = this.data;

        // 如果完全没有采集点，没法估测
        if (!locations.length) {
            return { x: 0, y: 0 };
        }

        // 用于保存所有可能接近的采集点及其距离
        let neighbors = [];

        // 对于每个采集点
        for (let location of locations) {
            let { point, wifiList } = location;

            // 求采集点的 Wifi MAC 列表和自己的 Wifi MAC 列表
            let macsA = Object.keys(wifiList);
            let macsB = Object.keys(currentWifiList);

            // 取交集，得到自己和这个采集点同时能搜到的 Wifi MAC 列表
            let intersect = macsB.filter((k) => macsA.find((x) => x == k));

            // 如果自己和这个采集点没法搜到任何共同 Wifi，直接 pass，接着看下一个采集点
            if (!intersect.length) {
                continue;
            }

            // 如果有共同 Wifi，求出这些共同 Wifi 信号强度差值的几何平均值
            let sum = 0;

            // 对于每个共同 Wifi，对信号强度之差的平方进行累加
            for (let mac of intersect) {
                sum += Math.pow(currentWifiList[mac] - wifiList[mac], 2);
            }

            // 累加后取平均值
            let avg = sum / intersect.length;

            // 平均值开根号，得到几何平均值（相当于欧氏距离），作为与这个采集点的距离
            neighbors.push({
                point,
                distance: Math.sqrt(avg)
            })
        }

        // 最后将所有可能是采集点的点的距离进行排序，取最近的至多 3 个点
        neighbors = neighbors.sort((a, b) => a.distance - b.distance).slice(3)

        // 对这 3 个点做加权平均，用欧氏距离的平方的倒数作为权值
        //（距离越近权值越高，平方是为了加强距离远近的对权值大小的影响）
        let x = 0, y = 0, weight = 0;
        for (let neighbor of neighbors) {
            // 对每个点的坐标与权值乘积进行累加
            let w = 1 / Math.pow(neighbor.distance || 1, 2);
            x += neighbor.point.x * w;
            y += neighbor.point.y * w;
            // 对权值进行累加
            weight += 1 * w;
        }

        // 如果完全没有邻居可能会导致除以零，这里规避一下
        weight = weight || 1;

        // 取加权平均坐标作为估测坐标
        return { x: x / weight, y: y / weight };
    },
    // 获取当前 Wifi 扫描结果
    // 受限于机型问题，可能和上次结果相同
    getWifiList(callback) {
        wx.getWifiList({
            success: () => {
                wx.onGetWifiList(({ wifiList }) => {
                    // 过滤掉信号低于 75、以及信号等于最大值 99 的
                    // 只有信号强度高于一定水平的时候，两次搜索的信号强度越接近，才能说明两次搜索的位置越接近
                    // 如果信号强度不到 75，两次搜索的信号强度相近只能说明两次搜索在同一个衰减半径上，并不能说明位置接近
                    // 如果信号强度等于 99，这样的 Wifi 很有可能是功率非常大的设备，在很多地方都是 99，导致结果不准
                    wifiList = wifiList.filter((k) => k.signalStrength >= 75 && k.signalStrength < 99);
                    let result = {};
                    let wifiMap = this.data.wifiMap;
                    
                    for (let wifi of wifiList) {
                        // 为了节省存储空间，防止分享路径过长，需要尽可能缩短 MAC 地址
                        wifi.BSSID = wifi.BSSID.splice(2, 8);
                        let { SSID, BSSID, signalStrength } = wifi;

                        // 返回结果是一个 map，以 MAC 为键，信号强度为值
                        result[BSSID] = signalStrength;
                    }
                    // 如果扫描结果和上次结果不同，则更新列表、更新扫描时间
                    if (JSON.stringify(this.data.wifiList) !== JSON.stringify(wifiList)) {
                        this.setData({
                            wifiList,
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
    // 采集五次，每秒一次，将采集结果汇总
    getPreciseWifiList(callback) {
        wx.showLoading({
            title: '正在采集',
        })
        // 综合采集结果
        let comprehensive = {};

        // 异步循环需要递归，times 是当前的次数，默认第 0 次
        let pickOnce = (times = 0) => {
            // 每次扫一下 Wifi
            this.getWifiList((result) => {
                // 对于扫到的每个 Wifi
                for (let mac in result) {
                    // 如果之前没扫到，先初始化一下
                    if (!comprehensive[mac]) {
                        comprehensive[mac] = { sum: 0, count: 0 };
                    }
                    // 更新这个 Wifi 扫到的次数和总的信号强度
                    comprehensive[mac].sum += result[mac];
                    comprehensive[mac].count++;
                }
            })

            // 如果次数不够就 1 秒后递归
            if (times < 5) {
                setTimeout(() => pickOnce(times + 1), 1000);
            } else {
                // 次数够了，对每个扫到的 Wifi 求出平均信号强度取整并返回
                for (let mac in comprehensive) {
                    comprehensive[mac] = Math.round(comprehensive[mac].sum / comprehensive[mac].count);
                }
                callback(comprehensive);
                wx.hideLoading();
            }
        }
        // 开始第一次扫描
        pickOnce();
    },
    clear() {
        // 重置地图
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
                        lastAddTime: 0
                    })
                }
            }
        });
    }
});