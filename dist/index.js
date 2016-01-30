var trello_1 = require('./src/trello');
var github_1 = require('./src/github');
var commands_1 = require('./src/commands');
var git_1 = require('./src/git');
var yargs = require('yargs');
var _ = require('lodash');
require('es6-promise').polyfill();
var config = JSON.parse(require('fs').readFileSync('./projects.json', 'utf8'));
var argv = yargs.argv;
var argArray = argv._;
var projectKey = argArray[0];
var project = config[projectKey];
var prNumber = argArray[1];
var commandName = argArray[2];
var commands = new commands_1.Commands(project);
var trello = new trello_1.Trello(project);
var trelloCard = null;
var gitHubLabels = null;
console.log("Reviewing", project.name, "PR:", prNumber);
if (prNumber == "trello") {
    trello.obtainTrelloKey(project);
}
else {
    var promises = [];
    var github = new github_1.GitHub(project);
    var trelloPromise = trello.findCardForPr(prNumber).then(function (card) {
        trelloCard = card;
        trello.openTrelloCard(card);
    });
    promises.push(trelloPromise);
    github.openPr(prNumber);
    var gitPromise = github.getPullRequest(prNumber).then(function (pullRequest) {
        var git = new git_1.Git(project);
        git.checkout(pullRequest.head.ref);
    }).catch(function (err) {
        console.log(err);
    });
    promises.push(gitPromise);
    var issuePromise = github.getIssueLabels(prNumber).then(function (labels) {
        gitHubLabels = labels;
    });
    promises.push(issuePromise);
    //Wait for all promises and execute commands. Then quit.
    Promise.all(promises).then(function () {
        if (commandName) {
            return commands.executeCommandWithName(commandName);
        }
        else {
            var command = null;
            if (gitHubLabels) {
                var labelNames = _.map(gitHubLabels, function (label) { return label.name; });
                command = commands.findCommandByTrigger("gitHubTags", labelNames);
            }
            if (trelloCard && command == null) {
                var labelNames = _.map(trelloCard.labels, function (label) { return label.name; });
                command = commands.findCommandByTrigger("trelloTags", labelNames);
            }
            if (command) {
                return commands.executeCommand(command);
            }
        }
    }).then(function () { process.exit(0); }, function () { process.exit(1); });
}
//# sourceMappingURL=index.js.map