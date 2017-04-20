Date.prototype.getFullWeek = function(){
    var baseDay = new Date(1970, 1, 5);
    return Math.ceil((this.getTime() - baseDay.getTime()) / (7 * 24 * 3600 * 1000));
}

module.exports = {
    formatTimeNatural: function(timestamp) {
        let date = new Date(timestamp)
        let now = new Date()
        let nowTime = now.getTime()
        let dsec = parseInt((timestamp - nowTime) / 1000)
        if (Math.abs(dsec) < 60) {
            return '现在'
        }
        let dmin = parseInt(dsec / 60)
        if (Math.abs(dmin) < 60) {
            return Math.abs(dmin) + '分钟' + (dmin < 0 ? '前' : '后')
        }
        let dhr = parseInt(dmin / 60)
        if (date.getDate() == now.getDate()) {
            return Math.abs(dhr) + '小时' + (dhr < 0 ? '前' : '后')
        }
        return this.formatDateNatural(timestamp)
    },

    formatPeriodNatural: function(start, end) {
        let startDate = this.formatDateNatural(start)
        let endDate = this.formatDateNatural(end)
        if (startDate == endDate) {
            return startDate + ' ' + this.formatTime(start, 'H:mm') + '~' + this.formatTime(end, 'H:mm')
        } else {
            return startDate + ' ' + this.formatTime(start, 'H:mm') + '~' + endDate + this.formatTime(end, 'H:mm')
        }
    },

    formatDateNatural: function(timestamp) {
        let date = new Date(timestamp)
        let today = new Date()
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        today.setHours(0)
        today.setMinutes(0)
        today.setSeconds(0)
        today.setMilliseconds(0)

        let dday = parseInt((date.getTime() - today.getTime()) / 1000 / 60 / 60 / 24)
        if (dday == 0) { return '' } // 省略今天
        if (dday == 1) { return '明天' }
        if (dday == 2) { return '后天' }
        if (dday == -1) { return '昨天' }
        if (dday == -1) { return '前天' }
        if (date.getFullWeek() == today.getFullWeek()) {
            return '周' + ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
        }
        if (date.getFullWeek() == today.getFullWeek() - 1) {
            return '上周' + ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
        }
        if (date.getFullWeek() == today.getFullWeek() + 1) {
            return '下周' + ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
        }
        if (date.getMonth() == today.getMonth()) {
            return Math.abs(dday) + '天' + (dday < 0 ? '前' : '后')
        }
        if (date.getFullYear() == today.getFullYear()) {
            return this.formatTime(timestamp, 'M月d日')
        }
        return this.formatTime(timestamp, 'yyyy年M月d日')
    },

    formatTime: function(timestamp, format) {
        var date = new Date(timestamp)
        var o = {
            "M+" : date.getMonth()+1, //月份
            "d+" : date.getDate(), //日
            "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时
            "H+" : date.getHours(), //小时
            "m+" : date.getMinutes(), //分
            "s+" : date.getSeconds(), //秒
            "q+" : Math.floor((date.getMonth()+3)/3), //季度
            "S" : date.getMilliseconds() //毫秒
        }
        var week = {
            "0" : "/u65e5",
            "1" : "/u4e00",
            "2" : "/u4e8c",
            "3" : "/u4e09",
            "4" : "/u56db",
            "5" : "/u4e94",
            "6" : "/u516d"
        }
        if(/(y+)/.test(format)){
            format=format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length))
        }
        if(/(E+)/.test(format)){
            format=format.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[date.getDay()+""])
        }
        for(var k in o){
            if(new RegExp("("+ k +")").test(format)){
                format = format.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)))
            }
        }
        return format
    }
}