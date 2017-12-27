// 半智能的三位学号采样器
// 可按顺序均匀采集各个班级的学号后三位，并根据反馈的情况，动态去掉疑似不存在或遍历完毕的班级以提高效率
const sampler = {
  // 各个班级的 [Object]
  classes: [],
  // 当前班级的下标，初值为 -1，有效值 0~9
  currentClass: -1,
  // 采样结束，不能继续提供学号
  ended: false,
  // 最后一道防线，全局的成功数，连续失败数
  successes: 0,
  fails: 0,
  // 初始化采样器
  init() {
    // 初始化班级列表
    this.classes = []
    this.currentClass = -1
    this.ended = false
    this.successes = this.fails = 0
    for (let i = 0; i < 10; i++) {
      this.classes.push({
        current: 1, // 当前已遍历的学号
        success: 0, // 成功人数
        fail: 0, // 失败人数
        disabled: false // 当前班级关闭
      })
    }
  },
  // 获取下一个学号
  next() {
    // 调用 next() 前必须先判断
    if (this.ended) throw new Error('Ended')
    // 选择下一个未关闭的班级
    do {
      this.currentClass = (this.currentClass + 1) % 10
    } while (this.classes[this.currentClass].disabled)
    let cur = this.classes[this.currentClass]
    // 返回并自增该班级当前学号
    let num = cur.current++
    num = ('0' + num).slice(-2)
    return this.currentClass + num
  },
  // 请求成功时，调用此函数反馈
  reportSuccess() {
    this.classes[this.currentClass].success++
    // 全局成功数增加；有成功的请求时，全局连续失败数重置为0
    this.successes++
    this.fails = 0
    // 若全局成功数达到20，不再请求
    if (this.successes >= 20) this.ended = true
  },
  // 请求失败时，调用此函数反馈
  reportFail() {
    // 全局连续失败数增加；若全局连续失败数达到20，不再请求
    this.fails++
    if (this.fails >= 20) this.ended = true
    // 当前班级失败数增加
    let cur = this.classes[this.currentClass]
    cur.fail++
    // 求剩余班级数
    let left = this.classes.filter(k => !k.disabled).length
    // 班级淘汰机制
    // 剩余班级越少，淘汰班级的门槛就越高：
    // 剩余超过3个班级，只要失败达到2次的班级就淘汰（例如普通的9系，8系，6系这种）；
    // 剩余2~3个班级，失败达到5次才淘汰；
    // 剩余1个班级，失败10次才淘汰（例如对于软件全英班这种只有一个班的专业，要保证足够的样本留存率）。
    // 为了防止意外，迭代达到80号的班级也淘汰。
    if ((left > 3 && cur.fail >= 2 || left > 1 && cur.fail >= 5 || cur.fail >= 10) && cur.success == 0 || cur.current >= 80) {
      cur.disabled = true
      left--
      // 若所有班级都已关闭，结束迭代
      if (left < 1) {
        this.ended = true
      }
    }
  }
}

Page({
  data: {
    preferLongTerm: false,
    people: 0, // 样本容量
    schoolnum: '', // 设置的学号前五位
    results: [], // 列表结果原始数据
    classes: [], // 列表结果统计数据
    periods: [], // 柱形图结果原始数据
    periodResult: [] // 柱形图结果统计数据
  },
  curPage: 0,
  ended: false,
  onLoad(options) {
    // 获取用户学号，若未登录，置空
    let user = wx.$.util('user')
    if (user.isLogin()) {
      this.setData({ schoolnum: user.getUser().schoolnum.slice(0, 5) })
    }
    // 开始查询
    this.updateQuery()
  },
  onSchoolnumChange(event) { // 输入事件
    // 过滤无效字符
    this.data.schoolnum
      = event.detail.value
      = event.detail.value.toUpperCase().replace(/[^0-9A-CY]/, '')
    // 数据回流到输入框
    this.setData({ schoolnum: this.data.schoolnum })
    // 光标保持
    return event.detail
  },
  updateQuery() {
    let that = this

    // 学号不合法，什么也不做
    if (that.data.schoolnum.length !== 5) {
      return
    }

    // 初始化柱形图原始数据，单位为人次
    let periods = []
    for (let i = 0; i < 13; i++) {
      periods.push(0)
    }

    // 清空数据
    this.setData({
      results: [], // 列表原始数据
      classes: [], // 列表统计数据
      periods, // 柱形图原始数据
      periodResult: periods.slice(), // 柱形图统计数据
      people: 0 // 样本容量
    })
    // 要抓取的学期，现在暂时置空，在第一次调用fun之前会被正确设置
    let currentTerm = ''
    // 初始化采样器
    sampler.init()
    // 每次迭代的函数，本质上是回调递归
    // FIXME 啥时候用 async await 重写一下？
    let fun = () => {
      // 若采样结束，停止加载并退出迭代
      if (sampler.ended) {
        that.setData({ loading: false })
        return
      }
      // 拼接完整的样本学号
      let schoolnum = this.data.schoolnum.slice(0, 3) + (parseInt(this.data.schoolnum.slice(3, 5)) - 1) + sampler.next()
      // 请求样本的课表数据
      wx.$.requestSimple({
        url: 'https://boss.myseu.cn/ws3/api/curriculum?cardnum=' + schoolnum + '&term=' + currentTerm,
        complete(res) {
          if (res.statusCode < 400) {
            // 请求成功，交给 appendResult 处理
            that.setData({ people: that.data.people + 1 })
            that.appendResult(res.data)
            // 向采样器报告成功，进入下次迭代
            sampler.reportSuccess()
            fun()
          } else {
            // 请求失败，像采样器报告失败，进入下次迭代
            sampler.reportFail()
            fun()
          }
        }
      })
    }
    // 开始加载
    this.setData({ loading: true })
    // 请求当前学期
    wx.$.requestApi({
      route: 'api/term',
      complete (res) {
        // 将学期号分离为特殊进制
        currentTerm = res.data.content[0].split('-')
        // 对特殊进制模拟借位减法，向前回滚2学期，得到「去年的下学期」
        let minus = 2
        // 若不看短学期，且当前是春学期，则向前回滚1学期，得到「去年的下下学期」
        if (that.data.preferLongTerm && currentTerm[3] == 3) {
          minus = 1
        }
        // 根据要回滚的学期数量，模拟计数器进行自减
        for (let i = 0; i < minus; i++) {
          currentTerm[2]--
          if (currentTerm[2] == 0) {
            // 借位
            currentTerm[2] = 3
            // 被借的位是年份，如「17-18」，两个数视为同一位数，同时增减
            currentTerm[1]--
            currentTerm[0]--
          }
        }
        // 拼接得到回滚后的学期
        // 这个程序肯定不会一直用到210x年，所以先这么直接拼了，不考虑一位数年份问题
        currentTerm = currentTerm.join('-')
        // 得到学期后，开始第一次迭代
        fun()
      }
    })
  },
  // 得到一个样本的所有课程数据后的处理
  appendResult(data) {
    let that = this
    // 对于数据中的不同key（周一至周五以及others），取出值中的列表，直接拼成一个大表
    let cur = Object.keys(data.curriculum).map(k => data.curriculum[k]).reduce((a, b) => a.concat(b), [])
    // 对于部分院系，会普遍存在一个人有多个重名课的情况，为了防止被算作多个人，需要对此建立哈希表，进行去重
    let curFiltered = {}
    cur.forEach(k => {
      // 顺便先把每节课所占的时段扔到柱形图的数据源里
      if (k.beginPeriod) {
        for (let i = k.beginPeriod; i <= k.endPeriod; i++) {
          that.data.periods[i - 1]++
        }
      }
      // 若哈希表中没有这门课，添加这门课
      if (!curFiltered.hasOwnProperty(k.className)) {
        curFiltered[k.className] = k
        // 存在一个人一门课由多个老师上的情况，对这种情况，初始化老师的列表，用于把多个老师合并
        curFiltered[k.className].teachers = []
      }
      // 往对应课程的老师列表里扔这个老师（老师做错了什么，为什么要扔他）
      // 排除老师名称为空以及该老师已经存在的情况
      if (k.teacherName && k.teacherName.trim() && !curFiltered[k.className].teachers.filter(l => l == k.teacherName).length) {
        curFiltered[k.className].teachers.push(k.teacherName)
      }
    })
    // 先把刚才更新的柱形图更新到界面上
    that.setData({
      periods: that.data.periods,
      // 根据柱形图的原始数据（每个时段上课的人次）得到最终可展示的统计数据
      // 要除以当前人数，得到平均每人该时段有课天数；再除以5，得到平均每人该时段有课概率；再乘以100，得到百分比
      periodResult: that.data.periods.map(k => k / that.data.people * 100 / 5)
    })
    // 将哈希表的去重结果重新转为数组，拼到总数据里备用
    this.data.results = this.data.results.concat(Object.keys(curFiltered).map(k => curFiltered[k]))
    // 当前的总数据中包含所有已抓取的样本的课表，已经在每个样本内部去重一遍，可以用来计算选课人次

    // 现在再建立哈希表，做第二次去重，把所有同学选的同名课程合并起来，对应的人次进行叠加
    let resultsFiltered = {}
    this.data.results.forEach(k => {
      // 无学分的，设为0
      k.score = k.score || 0
      // 哈希表中没有的课程，进行添加
      if (!resultsFiltered.hasOwnProperty(k.className)) {
        resultsFiltered[k.className] = k
        resultsFiltered[k.className].hit = 0
      }
      // 该课程的人次自增
      resultsFiltered[k.className].hit++
      // 遍历该人所选该课程的老师列表，一般只有一个老师
      for (let t of k.teachers) {
        // 若结果里没有该老师，添加该老师
        if (!resultsFiltered[k.className].teachers.filter(l => l == t).length) {
          resultsFiltered[k.className].teachers.push(t)
        }
      }
    })

    // 排序需要，设定课程的权重计算式
    let weight = lesson => {
      // 首先按照人次（主排序）、学分（次排序）倒序排列
      let weight = -(lesson.hit * 100 + lesson.score)
      // 对于明显为英语（大学英语、学术交流英语、学术英语写作等）、体育，且选择人数少于一半的，强制排在下面
      // 限制选择人数少于一半是防止某些院系或年级将某种英语或体育课当做通识课，要求必修，这种情况仍需要跟专业课一起显示
      let isCollegeEnglish = /大学英语|学术.*英语/.test(lesson.className)
      // 体育课的特点：开头有大写字母和数字，且这部分的字数和后半部分的字数相等
      let matchPE = /^([0-9A-Z]+)/.exec(lesson.className)
      let isPE = matchPE && matchPE[1].length * 2 == lesson.className.length
      if ((isCollegeEnglish || isPE) && lesson.hit < that.data.people / 2) {
        weight += 10000
      }
      return weight
    }

    // 将哈希表中的去重结果重新转回数组，按照权重函数进行排序
    let classes = Object.keys(resultsFiltered).map(k => resultsFiltered[k]).sort((a, b) => {
      return weight(a) - weight(b)
    })

    // 最后，对于每个去重完成的课程，进行一系列收尾工作
    classes = classes.map(k => {
      // 命中百分比 = 命中量 / 人数 * 100
      k.hitPercent = Math.round(k.hit / that.data.people * 100)
      // 周次说明，起始周-结束周，若单双周则后面加上「隔周」二字，不写出具体是单周还是双周，因为不同届可能不一样
      k.weekSummary = (k.weeks || k.beginWeek + '-' + k.endWeek) + '周' + (k.flip && k.flip !== 'none' ? '隔周' : '')
      // 老师说明，如果有多个老师，用顿号隔开，最多显示两个
      k.teacherSummary = k.teachers.slice(0, 2).join('、')
      // 如果超过两个，最后写上老师的数量
      if (k.teachers.length > 2) {
        k.teacherSummary += '等' + k.teachers.length + '个老师'
      } else if (k.teachers.length == 0) {
        k.teacherSummary = '教师未知'
      }
      return k
    }).filter(k => k.hitPercent >= 10) // 命中率少于 10% 的课程不显示

    // 更新视图
    this.setData({
      classes
    })
  },
  onShareAppMessage() {
    return {
      title: '课表预测',
      path: '/pages/curriculumPreview/curriculumPreview'
    }
  }
})