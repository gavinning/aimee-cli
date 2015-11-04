var aimee, router;

aimee = require('aimee');
router = require('router');
aimee.config.set('env', 'mock');

aimee
    .reg('zepto')
    .reg('autoscreen');

router
    .option('pages/home')
    .action();
