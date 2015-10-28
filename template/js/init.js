var aimee, router;

aimee = require('aimee');
router = require('router');
aimee.config.set('env', 'mock');

router
    .load('autoscreen')
    .option('pages/home')
    .action();
