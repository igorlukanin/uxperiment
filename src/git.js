var Promise = require('bluebird'),
    exec = Promise.promisify(require('child_process').exec);


var clone = function(url, directory) {
    return exec('git clone "' + url + '" "' + directory + '"');
};

var add = function(directory, path) {
    return exec('cd "' + directory + '" && ' +
                'git add "' + path + '"');
};

var commit = function(directory, message) {
    return exec('cd "' + directory + '" && ' +
                'git commit -m "' + message + '"');
};

var push = function(directory, remote, branch) {
    return exec('cd "' + directory + '" && ' +
                'git push "' + remote + '" "' + branch + '"');
};


module.exports = {
    clone,
    add,
    commit,
    push
};