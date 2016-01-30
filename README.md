# review
Node.js tool for automating code review chores across Trello and GitHub

running `review <projectName> <gitHubPullRequestNumber> [<commandName>]` does the following:

- Opens GitHub PR in the browser 
- Searches a configured Trello board for the card where the PR is attached and opens it
- Force checkouts the PR branch in your working directory
- Runs custom command by detecting tags/labels on GitHub PR or Trello card. You can override it by passing `commandName` as the last argument.

**Disclaimer!** This software was written for my personal use and it does not (yet) have the ambition to be well-tested and well-structured project ready for everyday use by the community. 
Your mileage may vary.

##Instalation
In your favorite shell, run
```
npm install https://github.com/Vratislav/review -g
```

You can then run `review` command from your shell


##Setup
Create file `projects.json` in the directory from which you will run `review` command. Use the provided [example projects.json](./projects_example.json) to get you started.

Run `review yourProject trello` to generate trello access token and put it into your `projects.json`.

##Usage
```
review <projectName> <gitHubPullRequestNumber> [<commandName>]
```




