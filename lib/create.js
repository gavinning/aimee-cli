var fs = require('fs');
var path = require('path');
var lib = require('linco.lab').lib;
var config = require('vpm-config');

exports.name = 'create';
exports.description = 'create aimee app';

exports.project = function(name){
    if(!name)
        return;

    console.log('create porject', name)
}

exports.page = function(name){
    if(!name)
        return;

    console.log('create page', name)
}

exports.widget = function(name){
    if(!name)
        return;

    console.log('create widget', name)
}

exports.reg = function(commander){
    commander
        .command(this.name)
        .description(this.description)
        .option('-P, --project [name]', 'create project', this.project)
        .option('-p, --page    [name]', 'create page', this.page)
        .option('-w, --widget  [name]', 'create widget', this.widget)
        .action(function(){
            this.parent.rawArgs.length === 3 &&
            this.outputHelp()
        })
}
