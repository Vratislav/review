export interface Project{
    name : string,
    workingDir : string,
    trelloApiKey : string,
    trelloToken : string,
    trelloBoardId : string,
    gitHubToken : string,
    repoOwner : string,
    repoName : string,
    forceCheckout : boolean,
    commands : { string: ProjectCommand }
}

export interface ProjectCommand{
    script : string,
    pathSuffix? : string,
    triggers? : ProjectTriggers
}

export interface ProjectTriggers{
    gitGubTags? : [string],
    trelloTags? : [string]
}