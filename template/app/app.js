/*!
 * <%= name %> For Aimeejs
 * https://github.com/aimeejs/aimee
 *
 * Aimee-app
 * Date: <%= time %>
 */

var app, App;

App = require('app');
app = App.create({
    name: '<%= name %>',
    version: '1.0.0',
    template: require('./<%= name %>.jade'),

    prerender: function(){

    }
});

module.exports = app;
