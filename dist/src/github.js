var GitHubApi = require("github");
var GitHub = (function () {
    function GitHub(project) {
        this.project = project;
        this.gitHubClient = new GitHubApi({
            // required
            version: "3.0.0",
            // optional
            debug: false,
            protocol: "https",
            host: "api.github.com",
            timeout: 5000,
            headers: {
                "user-agent": "CodeReview-Helper" // GitHub is happy with a unique user agent
            }
        });
        this.gitHubClient.authenticate({
            type: "oauth",
            token: project.gitHubToken
        });
    }
    GitHub.prototype.getPullRequest = function (prNumber) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.gitHubClient.pullRequests.get({
                user: _this.project.repoOwner,
                repo: _this.project.repoName,
                number: prNumber
            }, function (error, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(response);
                }
            });
        });
    };
    GitHub.prototype.getIssueLabels = function (issueNumber) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.gitHubClient.issues.getIssueLabels({
                user: _this.project.repoOwner,
                repo: _this.project.repoName,
                number: issueNumber
            }, function (error, response) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(response);
                }
            });
        });
    };
    GitHub.prototype.urlForPR = function (prNumber) {
        var url = "https://github.com/" + this.project.repoOwner + "/" + this.project.repoName + "/pull/" + prNumber;
        return url;
    };
    GitHub.prototype.openPr = function (prNumber) {
        var open = require("open");
        var url = this.urlForPR(prNumber);
        console.log("[GitHub] Opening PR on GitHub: " + url);
        open(url);
    };
    return GitHub;
})();
exports.GitHub = GitHub;
//# sourceMappingURL=github.js.map