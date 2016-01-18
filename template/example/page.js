/*!
 * <%= name %> For Aimeejs
 * https://github.com/gavinning/aimee
 *
 * Aimee-page
 * Date: <%= time %>
 */

var page, Page;

Page = require('page');
page = new Page;
page.extend({
    name: '<%=name%>',
    template: require('./<%=name%>.jade'),

    ajaxconfig: {
        url: '/tmp/test.json',
        dataType: 'json'
    },

    prerender: function(data, thisPage){
        this.exports('form')
    }
});

module.exports = page;
