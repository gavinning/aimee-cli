/*!
 * <%= name %> For Aimeejs
 * https://github.com/gavinning/aimee
 *
 * Aimee-app
 * Date: <%= time %>
 */

import App from 'app';
import template from '<%= name %>.jade';

class <%= name %> extends App {

    constructor() {
        super();
        this.name = '<%= name %>';
        this.template = template;
    }

    // app渲染到页面之前执行，用于预处理渲染内容
    prerender(app) {
        // app为模块的实例
        // your code
    }

    // app渲染到页面之后执行，此时app还在内存中，不能获取宽度高度等与尺寸相关的属性
    postrender(app) {
        // app为模块的实例
    }

    // 页面渲染到浏览器后执行，此时可以获取宽高等与尺寸相关的属性
    pagerender(app) {
        // some code
    }
}

export default <%= name %>;
