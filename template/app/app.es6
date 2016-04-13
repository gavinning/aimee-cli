/*!
 * <%= name %> For Aimeejs
 * https://github.com/gavinning/aimee
 *
 * Aimee-app
 * Date: <%= time %>
 */

var app, App;

App = require('app');
app = App.create({
    name: '<%= name %>',
    template: require('./<%= name %>.jade'),

    prerender: function(app){

    }
});

module.exports = app;
