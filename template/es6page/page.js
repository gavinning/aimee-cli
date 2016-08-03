/*!
 * <%= name %> For Aimeejs
 * https://github.com/gavinning/aimee
 *
 * Aimee-page
 * Date: <%= time %>
 */

import Page from 'page';
import template from '<%= name %>.jade';

class <%= name %> extends Page {

    constructor() {
        super();
        this.name = '<%= name %>';
        this.template = template;
    }

    get ajaxconfig() {
        return {
            url: '/tmp/test.json',
            dataType: 'json'
        }
    }

    onload() {
        
    }

    prerender(data) {
        this.exports('header')
    }

    postrender(data) {

    }

    enter() {

    }

    leave() {

    }
}

export default new <%= name %>;
