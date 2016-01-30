/// <reference path="./typings/tsd.d.ts" />
import {Project,ProjectCommand} from './src/project'
import {Trello, TrelloCard} from './src/trello'
import {GitHub,GitHubPullRequest, GitHubLabel} from './src/github'
import {Commands} from './src/commands'
import {Git} from './src/git'
import yargs = require('yargs');
import _ = require('lodash')

require('es6-promise').polyfill();

var config = JSON.parse(require('fs').readFileSync('./projects.json', 'utf8'));

var argv  = yargs.argv;
var argArray : [any] = argv._;
var projectKey = argArray[0];
var project : Project = config[projectKey];
var prNumber = argArray[1];
var commandName = argArray[2];
var commands = new Commands(project);
var trello = new Trello(project);
var trelloCard : TrelloCard = null;
var gitHubLabels : [GitHubLabel] = null;
console.log("Reviewing", project.name, "PR:",prNumber)
if(prNumber == "trello"){
    trello.obtainTrelloKey(project);
}else{
    var promises : [Promise<any>] = <any>[];
    var github = new GitHub(project);
    var trelloPromise = trello.findCardForPr(prNumber).then((card)=>{
        trelloCard = card;
        trello.openTrelloCard(card);
    })
    promises.push(trelloPromise);
    github.openPr(prNumber);
    var gitPromise = github.getPullRequest(prNumber).then((pullRequest)=>{
        var git = new Git(project);
        git.checkout(pullRequest.head.ref);
    }).catch((err)=>{
        console.log(err);
    });
    promises.push(gitPromise);
    
    var issuePromise = github.getIssueLabels(prNumber).then((labels)=>{
        gitHubLabels = labels;
    });
    promises.push(issuePromise);
    
    
    //Wait for all promises and execute commands. Then quit.
    Promise.all(promises).then(()=>{
        if(commandName){
            return commands.executeCommandWithName(commandName);
        }else{
            var command : ProjectCommand = null;
            if(gitHubLabels){
                var labelNames = _.map(gitHubLabels,(label)=>{return label.name});
                command = commands.findCommandByTrigger("gitHubTags", <[string]>labelNames);
            }
            if(trelloCard && command == null){
                var labelNames = _.map(trelloCard.labels,(label)=>{return label.name});
                command = commands.findCommandByTrigger("trelloTags", <[string]>labelNames);
            }
            if(command){
                return commands.executeCommand(command);
            }
        }
    }).then(()=>{process.exit(0)},()=>{process.exit(1)})
}










