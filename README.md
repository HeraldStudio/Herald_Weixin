# 小猴偷米2微信小程序

微信公众平台AppID: wx003836e71bc7c618

以下教程拷贝自相关项目

# 微信小程序开发的基本环境

微信小程序的IDE只能满足基本的代码编辑工作。

参考前端自动化构建流程，搭建了微信小程序的开发环境。

---
文件目录
```
project
│   README.md           // 你正在阅读的文件
│   .babelrc            // Babel配置文件   
│   .editorconfig       // editorconfig配置文件
│   .eslintrc.js        // ESLint配置文件
│   .flowfonfig         // Flow配置文件
│   .gitignore          
│   newPage.js          // 创建小程序页面的工具       
│   gulpfile.js         // 编译代码          
└───src  // 微信小程序的源码目录
└───dest // 微信小程序的编译目录，执行`npm run watch`后生成
```

---

第一次使用：

1. 安装[node.js](https://nodejs.org/zh-cn/)
2. 使用命令行(Windows下推荐使用Git Bash)进入项目目录，安装项目依赖包，将会安装再node_modules路径下：

        npm install

3. 配置editorconfig

    项目使用.editorconfig管理代码格式，请使用[支持editorconfig的文本编辑器](http://editorconfig.org/#download)。

    推荐： [Sublime](https://www.sublimetext.com/)

    Sublime使用editorconfig的[方法](https://jarontai.github.io/blog/2014/11/16/sublime-editorconfig/).

    插件安装完成后会在新建文件时生效。

4. 编译小程序的运行代码：

        `npm run watch`

    执行Flow, ESLint, Babel编译过程。

    可能出现CRLF问题，见下方。

    成功后，不要关闭命令行。

    会在dist目录下出现小程序运行需要的代码。

5. 启动小程序开发工具，创建项目，目录选择dist目录。进入小程序开发工具后，项目-预览，能在手机上正常运行。

6. 开始在src目录写代码。每次保存文件后都重新执行Flow, ESLint, Babel编译过程。将改动代码同步到dist目录下。因此可以实时在小程序开发工具中调试预览。

---

第二次使用： 重复4-6的过程。

注意：小程序开发工具的调试工具有问题，要多在真机上调试。

---

问题：

CRLF问题：

在这个项目中，所有的换行符使用LF，具体配置请参考.editorconfig文件。

git有个配置[crlf](https://git-scm.com/book/zh/v1/%E8%87%AA%E5%AE%9A%E4%B9%89-Git-%E9%85%8D%E7%BD%AE-Git):这个配置为true时，在clone时会把所有的换行符从LF替换为CRLF。


问题解决方法：

先将git的CRLF配置改为false，

    git config --global core.autocrlf false


再将项目文件删除(下一行有个注意！)，重新从coding平台上clone，再执行`npm run watch`

注意！node_modules保存的是项目的依赖包，可以先将node_modules保存到其他文件夹，clone完成后放到项目中，避免重新下载所有依赖包。

---

PS:

1. 'npm run watch'偶尔不响应Ctrl-C，直接关命令行窗口。
2. Sublime下.wxss和.wxml文件的代码高亮问题：
        Sublime将.wxss和.wxml文件识别为纯文本。点击右下角的`Plan Text`,选择最上方的`Open all With ....`,再选择对于的`css`和`xml`即可。
3. 在Sublime里执行newPage.js，创建小程序的页面：

        Tools -> Build System -> New Build System...
        Enter the below text in the new file
        {
            "cmd": ["node", "$file"],
            "selector": "source.js"
        }

        Save the file as "nodejs.sublime-build"
        Tools -> Build System -> nodejs
        Press Ctrl+B to run the opened js file.



