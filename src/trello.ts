import {Project} from './project'
import {GitHub} from './github'
var TrelloLib : any = require("node-trello");
export class Trello{
    private client : any;
    private project : Project;
    constructor(project : Project){
        this.project = project;
        this.client = new TrelloLib(project.trelloApiKey,project.trelloToken);
    }
    
    
    findCardForPr(prNumber:string):Promise<TrelloCard>{
        var prUrl = new GitHub(this.project).urlForPR(prNumber);
        console.log("Looking for trello card with PR:",prUrl)
        return this.getCards().then((cards)=>{
           var foundCard = null;
           cards.forEach((card)=>{
               if(this.cardContains(card,prUrl)){
                   foundCard = card;
                   console.log("[Trello] Found card: " + foundCard.name);
                   return;
               }
           });
           if(!foundCard){
               console.log("[Trello] Card not found.");
           }
           return foundCard;
        });
    }
    
    openTrelloForPr(prNumber:string) : Promise<any>{
       return this.findCardForPr(prNumber).then((card) => {
          if(card){
              this.openTrelloCard(card)
          }else{
              
              //TODO open the board instead
          } 
       });
    }
    
    openTrelloCard(card:TrelloCard){
        var open = require("open");        
        console.log("[Trello] Opening",card.url);
        open(card.url);
    }
    
    obtainTrelloKey(project : Project){
        console.log("[Trello] Obtaining Trello token");
        var trelloUrl =  "https://trello.com/1/connect?key="+project.trelloApiKey+"&name=AppliftingReview&response_type=token&expiration=never";
        var open = require("open");
        open(trelloUrl);
    }    
    
    getCards():Promise<[TrelloCard]>{
        var that = this;
        var promise = new Promise(function(resolve,reject){
            that.client.get("/1/boards/"+that.project.trelloBoardId+"/cards",
            {
                "modelTypes":"cards",
                "actions" : "commentCard",
                "attachments":true
            },(err,data)=>{
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(data);
                }
            });            
        });
        return promise; 
    }

    getComments():Promise<[any]>{
        var that = this;
        var promise = new Promise(function(resolve,reject){
            that.client.get("/1/boards/"+that.project.trelloBoardId+"/actions",
            {
                filter:"commentCard"
            },(err,data)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(data);
                }
            }); 
        });
        
        return promise;
    }
    
    private isCommentAction(action:TrelloAction):boolean{
        if(action.type == 'commentCard'){
            return true;
        }else{
            return false;
        }
    }
    
    /**
     * Searches through a card for given text in case insensitive manner
     */
    private cardContains(card:TrelloCard,query:string):boolean{
        if(this.fieldContains(card.name,query)){
            return true;
        }
        if(this.fieldContains(card.desc,query)){
            return true;
        } 
        var foundInAttachments = false;    
        card.attachments.forEach((attachment)=>{
            if(this.fieldContains(attachment.name,query)){
                foundInAttachments = true;
                return;
            }   
            if(this.fieldContains(attachment.url,query)){
                foundInAttachments = true;
                return;
            }              
        });
        if(foundInAttachments){
            return true;
        }
        
        var foundInComments = false;
        card.actions.forEach((action)=>{
            if(this.isCommentAction(action)){
                if(this.fieldContains(action.data.text,query)){
                    foundInComments = true;
                    return;
                }               
            }         
        }); 
        if(foundInComments){
            return true;
        }                           
        return false;
    }
    
    private fieldContains(field:string,query:string):boolean{
        if(field){
            if (field.toLowerCase().indexOf(query.toLowerCase()) != -1){
                return true;
            }        
        }
        return false;
    }
    
    
}


export interface TrelloCard{
    id : string,
    name : string
    desc : string,
    url : string,
    labels : [TrelloLabel],
    actions : [TrelloAction],
    attachments : [TrelloAttachment]
}

export interface TrelloLabel{
    id : string,
    color : string,
    name : string
}


export interface TrelloAttachment{
    url : string,
    name : string
}

export interface TrelloAction{
    data : TrelloActionCommentData
    type : string
}
export interface TrelloActionCommentData{
    text : string
}