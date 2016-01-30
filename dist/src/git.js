var NodeGit = require("nodegit");
var Checkout = NodeGit.Checkout;
var Git = (function () {
    function Git(project) {
        this.project = project;
    }
    Git.prototype.checkout = function (ref) {
        var checkoutOptions = new NodeGit.CheckoutOptions();
        console.log("[Git] Checking out " + ref);
        if (this.project.forceCheckout) {
            checkoutOptions.checkoutStrategy = Checkout.STRATEGY.FORCE;
            console.log("[Git] Using --force option!");
        }
        var promise = NodeGit.Repository.open(this.project.workingDir).then(function (repo) {
            return repo.fetch("origin", { callbacks: {
                    credentials: function (url, userName) {
                        return NodeGit.Cred.sshKeyFromAgent(userName);
                    } }
            }).then(function () {
                return repo.getBranch("origin/" + ref).then(function (newRef) {
                    return repo.getBranchCommit("origin/" + ref).then(function (commit) {
                        return repo.setHeadDetached(commit);
                    }).then(function () {
                        return Checkout.tree(repo, "origin/" + ref, checkoutOptions).then(function () {
                            console.log("[Git] Checked out", newRef.name());
                        });
                    });
                });
            });
        }).catch(function (err) {
            console.log(err);
        });
        promise.done(function () {
        });
        return promise;
    };
    return Git;
})();
exports.Git = Git;
//# sourceMappingURL=git.js.map