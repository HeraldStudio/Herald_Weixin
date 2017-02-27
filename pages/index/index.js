//index.js
//获取应用实例
var app = getApp()
var pageObj={
  data: {
     swiperItem:[],
     text:false,
     buttonclick:"buttonclick"
    },

 onLoad:function(){
        this.addSwiperItem({src:"./res/slide1.jpg",func:"taps"},{src:"./res/slide2.jpg",func:"tap"},{src:"./res/slide3.jpg",func:"tap"});
        console.log(this.swiperItem);
        
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