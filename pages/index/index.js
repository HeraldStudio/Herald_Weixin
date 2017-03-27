//index.js
//获取应用实例
var app = getApp();
var module =["template","test"];
var testinsert=require("../../module/Template/template.js")
var pageObj={
  data: {
     swiperItem:[],
     text:false,
     buttonclick:"buttonclick",
     modules:[{
       id:1,
       name:"template",
       title:"从js渲染出来的模块",
       popnumber:["true","1232"],
       popdot:false,
       subtitle:"男默女泪，金星看了默默流泪",
       data:{index:"海通兽大哥哥最帅啦"}
     }]
    },

 onLoad:function(){
        this.addSwiperItem({src:"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1488956552501&di=18842dd1a011655d06b54f13ecb080ab&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fforum%2Fw%253D580%2Fsign%3De5af69b9700e0cf3a0f74ef33a44f23d%2F7bd8128b87d6277febd2f6932a381f30eb24fcb0.jpg",func:"tap"});
        console.log(this.swiperItem);
        console.log(testinsert.data.name);

      },
//绑定在控件上调试用
      tap:function(event){
        console.log("clicked");
        wx.showToast({title:"You clicked me!"});
        wx.navigateTo({
          url: 'http://my.seu.edu.cn/',
          success: function(res){
            // success
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        });
        setTimeout(wx.hideToast,1000);

        
      },

//addSwiperItem方法用于在页面初始化时设定swiper的内容
//接受不限制数量的表示swiper显示图片和绑定函数的对象
//要不要改成绑定链接而不是绑定函数？
//{src:"./res/slide1.jpg",func:"tap"}
      addSwiperItem:function(){
        
        for(var i=0;i<arguments.length;i++){
          this.data.swiperItem.push(arguments[i]);
        }
        this.setData({
          swiperItem:this.data.swiperItem
        });
      },

      addModule:function () {
          for(var i=0;i<arguments.length;i++){
              var tempModule={
                  id:0,
                  name:arguments[i].name,
                  title:arguments[i].title,
                  subtitle:arguments[i].subtitle,

              }
              this.data.modules.push(tempModule);

          }

          this.setData({
              modules:this.data.modules
          });
      }
     

}
Page(pageObj)