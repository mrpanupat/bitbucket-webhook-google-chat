# Bitbucket webhook Google Chat
This repository is an example how to integrate Bitbucket with Google Chat 
using [Firebase](https://firebase.google.com) functions.

1. Install Firebase CLI
    ```$bash
    npm install -g firebase-tools
    ```
2. Login to firebase
    ```$bash
    firebase login
    ```
3. Connect project to firebase
    ```$bash
    firebase init
    //select `Database` and `Functions`
    
    ```
4. Deploy!!
    ```$bash
    firebase deploy --only functions
    ```
    *For node version >= 10 need to enable `Pay as you go` plan.
## Example message when create pull request
```
@all
Title  :    Merge title message
Branch :    develop   >   master
Author :    Shimada Genji
Link   :    https://bitbucket.org/link/to/pull-requests/2
```