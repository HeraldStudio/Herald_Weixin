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
       title:"从js渲染出来的模块1",
       popnumber:["true","12"],
       popdot:false,
       subtitle:"这个模块是从js文件中渲染出来的啦~",
       data:{index:"狼剩子小朋友每天都要坚持码代码~"}
     },{
       id:2,
       name:"template",
       title:"关于我们班运动会的口号",
       subtitle:"我觉得这样比较好",
       data:{index:"计一计一,宇宙第一,明年大二，今年大一"}
     },{
       id:0,
       name:"template",
       title:"召唤海通兽~",
       subtitle:"海通兽也是你想召唤就能召唤的？！！",
       popdot:true
     }]
    },

 onLoad:function(){
        this.addSwiperItem({src:"./res/slide1.jpg",func:"taps"},{src:"./res/slide2.jpg",func:"tap"},{src:"./res/slide3.jpg",func:"tap"});
        console.log(this.swiperItem);
        console.log(testinsert.data.name);
      },
//绑定在控件上调试用
      tap:function(event){
        console.log("clicked");
        wx.showToast({title:"You clicked me!"});
        
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
      }

     

}
Page(pageObj)