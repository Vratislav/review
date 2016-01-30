var github_1 = require('./github');
var TrelloLib = require("node-trello");
var Trello = (function () {
    function Trello(project) {
        this.project = project;
        this.client = new TrelloLib(project.trelloApiKey, project.trelloToken);
    }
    Trello.prototype.findCardForPr = function (prNumber) {
        var _this = this;
        var prUrl = new github_1.GitHub(this.project).urlForPR(prNumber);
        console.log("Looking for trello card with PR:", prUrl);
        return this.getCards().then(function (cards) {
            var foundCard = null;
            cards.forEach(function (card) {
                if (_this.cardContains(card, prUrl)) {
                    foundCard = card;
                    console.log("[Trello] Found card: " + foundCard.name);
                    return;
                }
            });
            if (!foundCard) {
                console.log("[Trello] Card not found.");
            }
            return foundCard;
        });
    };
    Trello.prototype.openTrelloForPr = function (prNumber) {
        var _this = this;
        return this.findCardForPr(prNumber).then(function (card) {
            if (card) {
                _this.openTrelloCard(card);
            }
            else {
            }
        });
    };
    Trello.prototype.openTrelloCard = function (card) {
        var open = require("open");
        console.log("[Trello] Opening", card.url);
        open(card.url);
    };
    Trello.prototype.obtainTrelloKey = function (project) {
        console.log("[Trello] Obtaining Trello token");
        var trelloUrl = "https://trello.com/1/connect?key=" + project.trelloApiKey + "&name=review&response_type=token&expiration=never";
        var open = require("open");
        open(trelloUrl);
    };
    Trello.prototype.getCards = function () {
        var that = this;
        var promise = new Promise(function (resolve, reject) {
            that.client.get("/1/boards/" + that.project.trelloBoardId + "/cards", {
                "modelTypes": "cards",
                "actions": "commentCard",
                "attachments": true
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
        return promise;
    };
    Trello.prototype.getComments = function () {
        var that = this;
        var promise = new Promise(function (resolve, reject) {
            that.client.get("/1/boards/" + that.project.trelloBoardId + "/actions", {
                filter: "commentCard"
            }, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
        return promise;
    };
    Trello.prototype.isCommentAction = function (action) {
        if (action.type == 'commentCard') {
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Searches through a card for given text in case insensitive manner
     */
    Trello.prototype.cardContains = function (card, query) {
        var _this = this;
        if (this.fieldContains(card.name, query)) {
            return true;
        }
        if (this.fieldContains(card.desc, query)) {
            return true;
        }
        var foundInAttachments = false;
        card.attachments.forEach(function (attachment) {
            if (_this.fieldContains(attachment.name, query)) {
                foundInAttachments = true;
                return;
            }
            if (_this.fieldContains(attachment.url, query)) {
                foundInAttachments = true;
                return;
            }
        });
        if (foundInAttachments) {
            return true;
        }
        var foundInComments = false;
        card.actions.forEach(function (action) {
            if (_this.isCommentAction(action)) {
                if (_this.fieldContains(action.data.text, query)) {
                    foundInComments = true;
                    return;
                }
            }
        });
        if (foundInComments) {
            return true;
        }
        return false;
    };
    Trello.prototype.fieldContains = function (field, query) {
        if (field) {
            if (field.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                return true;
            }
        }
        return false;
    };
    return Trello;
})();
exports.Trello = Trello;
//# sourceMappingURL=trello.js.map