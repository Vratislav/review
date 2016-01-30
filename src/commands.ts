import {Project,ProjectCommand} from './project'
import shell = require('shelljs');
import _ = require('lodash')
export class Commands{
    
    project : Project;
    
    constructor(project : Project){
        this.project = project;
    }
    
    executeCommandWithName(commandName : string):Promise<any>{
        var command = this.project.commands[commandName];
        if(command){
            return this.executeCommand(command)
        }else{
            console.log("[Command]","Command",commandName,"not found")
            Promise.reject("Comman not found");
        }
    }
    
    findCommandByTrigger(triggerName:string,values : [string]):ProjectCommand{
        var commands = _.values(this.project.commands);
        //console.log(commands);
        var intersection : any[] = null;
        
        var command =  _.find(commands,(command) => {
           var triggers = (<any>command).triggers[triggerName];
           if(triggers){
               intersection = _.intersection(triggers,values);
               console.log(intersection);
               return intersection.length > 0;
           }
           return false;
        });
        if(command){
            console.log("[Command] Found command with",triggerName, "and value",intersection);
        }
        return <ProjectCommand>command;
    }
    
    
    executeCommand(command : ProjectCommand):Promise<any>{
        return new Promise((resolve,reject)=>{
            console.log("[Command]","Executing:",command.script);
            var path = this.project.workingDir;
            if(command.pathSuffix){
                path = path + command.pathSuffix;
            }
            process.chdir(path);
            var result = shell.exec(command.script);
            //console.log(result.output);
            console.log("[Command]","Exited with code", result.code);     
            resolve();       
        });
    }
}