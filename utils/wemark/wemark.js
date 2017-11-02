let Remarkable = require('./remarkable');
let parser = new Remarkable({
  html: true
});

function parse (md, page, options) {

  if (!options) options = {};
  if (!options.name) options.name = 'wemark';
  /*if(!options.imageWidth) {
    // 先写一个默认值
    let sysInfo = wx.getSystemInfoSync();
    options.imageWidth = sysInfo.windowWidth;
  }*/

  let tokens = parser.parse(md, {});

  // markdwon渲染列表
  let renderList = [];
  // 图片高度数组
  let imageHeight = {};
  // 返回的数据
  let ret = {
    renderList: renderList,
    imageHeight: imageHeight
  };

  let env = [];
  // 记录当前list深度
  let listLevel = 0;
  // 记录第N级ol的顺序
  let orderNum = [0, 0];
  let tmp;

  // 获取inline内容
  let getInlineContent = function (inlineToken) {
    let ret = [];
    let env;

    if (inlineToken.type === 'htmlblock') {
      // 匹配video
      // 兼容video[src]和video > source[src]
      let videoRegExp = /<video.*?src\s*=\s*['"]*([^\s^'^"]+).*?(poster\s*=\s*['"]*([^\s^'^"]+).*?)?(?:\/\s*\>|<\/video\>)/g;

      let match;
      let html = inlineToken.content.replace(/\n/g, '');
      while (match = videoRegExp.exec(html)) {
        if (match[1]) {
          let retParam = {
            type: 'video',
            src: match[1]
          };

          if (match[3]) {
            retParam.poster = match[3];
          }

          ret.push(retParam);
        }
      }
    } else {
      (inlineToken.children || []).forEach(function (token, index) {
        if (['text', 'code'].indexOf(token.type) > -1) {
          if (ret.length > 0 && ret.slice(-1)[0].type == 'a' && !ret.slice(-1)[0].content) {
            ret.slice(-1)[0].content = token.content
          } else {
            ret.push({
              type: env || token.type,
              content: token.content.replace(/\*\*/g, '')
            });
            env = '';
          }
        } else if (token.type === 'del_open') {
          env = 'deleted';
        } else if (token.type === 'strong_open') {
          env = 'strong';
        } else if (token.type === 'link_open') {
          ret.push({
            type: 'a',
            href: token.href
          });
        } else if (token.type === 'em_open') {
          env = 'em';
        } else if (token.type === 'image') {
          ret.push({
            type: token.type,
            src: token.src
          });
        }
      });
    }

    return ret;
  };

  let getBlockContent = function (blockToken, index) {
    if (blockToken.type === 'htmlblock') {
      return getInlineContent(blockToken);
    } else if (blockToken.type === 'heading_open') {
      return {
        type: 'h' + blockToken.hLevel,
        content: getInlineContent(tokens[index + 1])
      };
    } else if (blockToken.type === 'paragraph_open') {
      let type = 'p';
      let prefix = '';
      if (env.length) {
        prefix = env.join('_') + '_';
      }

      let content = getInlineContent(tokens[index + 1]);

      // 处理ol前的数字
      if (env[env.length - 1] === 'li' && env[env.length - 2] === 'ol') {
        content.unshift({
          type: 'text',
          content: orderNum[listLevel - 1] + '. '
        });
      }

      return {
        type: prefix + 'p',
        content: content
      };
    } else if (blockToken.type === 'fence') {
      return {
        type: 'code',
        content: blockToken.content
      };
    } else if (blockToken.type === 'bullet_list_open') {
      env.push('ul');
      listLevel++;
    } else if (blockToken.type === 'ordered_list_open') {
      env.push('ol');
      listLevel++;
    } else if (blockToken.type === 'list_item_open') {
      env.push('li');
      if (env[env.length - 2] === 'ol') {
        orderNum[listLevel - 1]++;
      }
    } else if (blockToken.type === 'list_item_close') {
      env.pop();
    } else if (blockToken.type === 'bullet_list_close') {
      env.pop();
      listLevel--;
    } else if (blockToken.type === 'ordered_list_close') {
      env.pop();
      listLevel--;
      orderNum[listLevel] = 0;
    } else if (blockToken.type === 'blockquote_open') {
      env.push('blockquote');
    } else if (blockToken.type === 'blockquote_close') {
      env.pop();
    } else if (blockToken.type === 'tr_open') {
      tmp = {
        type: 'tr',
        content: []
      };
      return tmp;
    } else if (blockToken.type === 'th_open') {
      tmp.content.push({
        type: 'th',
        content: getInlineContent(tokens[index + 1]).map(function (inline) {
          return inline.content;
        }).join('')
      });
    } else if (blockToken.type === 'td_open') {
      tmp.content.push({
        type: 'td',
        content: getInlineContent(tokens[index + 1]).map(function (inline) {
          return inline.content;
        }).join('')
      });
    } else if (blockToken.type === 'hr') {
      return {
        type: 'hr'
      }
    }
  };

  tokens.forEach(function (token, index) {
    let blockContent = getBlockContent(token, index);
    if (Array.isArray(blockContent)) {
      blockContent.forEach(function (block) {
        renderList.push(block);
      });
    } else if (blockContent) {
      renderList.push(blockContent);
    }
  });

  // 为page实例添加fixHeight方法
  /*page.wemarkFixImageHeight = function (e){
    let natureHeight = e.detail.height;
    let natureWidth = e.detail.width;
    let asp = natureHeight/natureWidth;
    let obj = {};
    obj[options.name + '.imageHeight.' + e.target.dataset.id] = options.imageWidth*asp;
    this.setData(obj);
  };*/

  let obj = {};
  obj[options.name] = ret;
  page.setData(obj);

}

module.exports = {
  parse: parse
};
