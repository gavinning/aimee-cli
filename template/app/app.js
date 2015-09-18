/*!
 * <%= name %>
 * https://github.com/gavinning/aimee
 *
 * Aimee-app
 * Date: <%= time %>
 */

var app, App;

App = require('app');
app = App.create({
    name: '<%= name %>',
    version: '1.0.0',
    template: require('./<%= name %>.jade')
});

module.exports = app;
