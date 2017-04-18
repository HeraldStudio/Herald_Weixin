var fs = require('fs')

function userName(){
  var path = require('path')
  var userName = process.env['USERPROFILE'].split(path.sep)[2]
  return userName
}

function currentDate(){
  var dateObj = new Date()
  var month = dateObj.getUTCMonth() + 1 //months from 1-12
  var day = dateObj.getUTCDate()
  var year = dateObj.getUTCFullYear()
  return newdate = year + "/" + month + "/" + day
}


function newPage(name, path = "./pages/"){
  var list = ['js','json','wxml','wxss']
  var date = new Date()
  var current_hour = date.getHours()
  var dir = path + name
  if (!fs.existsSync(dir)) {
    console.log("creating dir: " + dir)
    fs.mkdirSync(dir)
  }
  function createType(type){
    var fileName = dir + "/" + name + "." + type
    if(!fs.existsSync(fileName)){
      console.log("creating file: ", fileName)
      fs.writeFile(fileName,"", err => {
        if(err) {
          return console.log(err)
        }
      })
    } else {
      console.log(fileName, "\t already exists  !!!!!")
    }
  }
  list.map(createType)
}

if (process.argv.length > 2) {
  newPage(process.argv[2])
}

/*
  要新建页面可直接执行 node newPage [pageName]
*/
