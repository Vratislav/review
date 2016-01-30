import {Project} from './project'

var NodeGit = require("nodegit");
var Checkout = NodeGit.Checkout;
export class Git{
    project : Project;
    openedRepo : Promise<any>
    constructor(project : Project){
        this.project = project;
        
    }
    
    checkout(ref : string){
        var checkoutOptions = new NodeGit.CheckoutOptions();
        console.log("[Git] Checking out " + ref);
        if (this.project.forceCheckout){
            checkoutOptions.checkoutStrategy = Checkout.STRATEGY.FORCE
            console.log("[Git] Using --force option!") 
        }   
        
        var promise =  NodeGit.Repository.open(this.project.workingDir).then((repo)=>{
            return repo.fetch("origin",{ callbacks:{
                credentials: function(url, userName) {
                        return NodeGit.Cred.sshKeyFromAgent(userName);
                }}               
            }).then(()=>{
                return  repo.getBranch("origin/"+ref).then((newRef)=>{
                    return repo.getBranchCommit("origin/"+ref).then((commit) => {
                        return repo.setHeadDetached(commit);
                    }).then(()=>{
                        return Checkout.tree(repo,"origin/"+ref,checkoutOptions).then(()=>{
                            console.log("[Git] Checked out",newRef.name());
                        });                       
                    });
                });                
            })

        }).catch((err) => {
            console.log(err)
        });
      
        
        (<any>promise).done(()=>{
        });
        
        return promise;
        
          
    }
    
    
    
    
    
    
}