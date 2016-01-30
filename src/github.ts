import {Project} from './project'
var GitHubApi = require("github");
export class GitHub{
    private project : Project;
    private gitHubClient : any;
    constructor(project : Project){
        this.project = project;
        
        this.gitHubClient = new GitHubApi({
            // required
            version: "3.0.0",
            // optional
            debug: false,
            protocol: "https",
            host: "api.github.com", // should be api.github.com for GitHub
            timeout: 5000,
            headers: {
                "user-agent": "Applifting-CodeReview-Helper" // GitHub is happy with a unique user agent
            }
        });        
        this.gitHubClient.authenticate({
            type: "oauth",
            token: project.gitHubToken
        });
    }
    
    getPullRequest(prNumber:any):Promise<GitHubPullRequest>{
        return new Promise((resolve,reject)=>{
            this.gitHubClient.pullRequests.get({
                user : this.project.repoOwner,
                repo : this.project.repoName,
                number : prNumber
            },(error,response)=>{
                if(error){
                    reject(error);
                }else{
                    resolve(response);
                }
            });
        });
    }
    
    getIssueLabels(issueNumber:any):Promise<[GitHubLabel]>{
        return new Promise((resolve,reject)=>{
            this.gitHubClient.issues.getIssueLabels({
                user : this.project.repoOwner,
                repo : this.project.repoName,
                number : issueNumber
            },(error,response)=>{
                if(error){
                    reject(error);
                }else{
                    resolve(response);
                }
            });            
        });
    }
    
    
    urlForPR(prNumber : any):string{
       var url : string = "https://github.com/"+this.project.repoOwner+"/"+this.project.repoName+"/pull/"+prNumber;
       return url;
    }
    
    openPr(prNumber : any){
        var open = require("open");        
        var url = this.urlForPR(prNumber);
        console.log("[GitHub] Opening PR on GitHub: " + url);
        open(url);        
    }
    
    
    
    
    
}


export interface GitHubPullRequest{
    url : string,
    state : string,
    title : string,
    body : string,
    mergeable : boolean,
    base : GitHubCommit,
    head : GitHubCommit
}

export interface GitHubIssue{
    url : string,    
    title : string,
    body : string,    
    labels : [GitHubLabel]
}

export interface GitHubLabel{
    name : string,
    color : string,
    url : string
}

export interface GitHubCommit{
    ref : string,
    sha : string
}