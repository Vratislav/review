var shell = require('shelljs');
var _ = require('lodash');
var Commands = (function () {
    function Commands(project) {
        this.project = project;
    }
    Commands.prototype.executeCommandWithName = function (commandName) {
        var command = this.project.commands[commandName];
        if (command) {
            return this.executeCommand(command);
        }
        else {
            console.log("[Command]", "Command", commandName, "not found");
            Promise.reject("Comman not found");
        }
    };
    Commands.prototype.findCommandByTrigger = function (triggerName, values) {
        var commands = _.values(this.project.commands);
        //console.log(commands);
        var intersection = null;
        var command = _.find(commands, function (command) {
            var triggers = command.triggers[triggerName];
            if (triggers) {
                intersection = _.intersection(triggers, values);
                console.log(intersection);
                return intersection.length > 0;
            }
            return false;
        });
        if (command) {
            console.log("[Command] Found command with", triggerName, "and value", intersection);
        }
        return command;
    };
    Commands.prototype.executeCommand = function (command) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log("[Command]", "Executing:", command.script);
            var path = _this.project.workingDir;
            if (command.pathSuffix) {
                path = path + command.pathSuffix;
            }
            process.chdir(path);
            var result = shell.exec(command.script);
            //console.log(result.output);
            console.log("[Command]", "Exited with code", result.code);
            resolve();
        });
    };
    return Commands;
})();
exports.Commands = Commands;
//# sourceMappingURL=commands.js.map