'use babel';

var currentRow = 0;
var newRow = 0;
var applyChange = true;

var firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");
var config = {
    apiKey: "AIzaSyCh_DO86KwghVrvE5WyeZ0h0qK3bLIQxi8",
    authDomain: "covalence-6384b.firebaseapp.com",
    databaseURL: "https://covalence-6384b.firebaseio.com",
    storageBucket: "covalence-6384b.appspot.com",
};
firebase.initializeApp(config);

// var provider = new firebase.auth.GoogleAuthProvider();

import CovalenceView from './covalence-view';
import {
    CompositeDisposable
} from 'atom';

var newPage = true;
// var enemiesCursor;
var changedData = firebase.database().ref('projects');
changedData.on('value', function(pulledData) {
    applyChange = false;
    atom.workspace.observeTextEditors(function(editor) {
      if (newPage) {
        editor.setText(pulledData.val().pageData)
        newPage = false;
      }
      // editor.addCursorAtBufferPosition([pulledData.val().rowToEdit, pulledData.val().lineData.length]);
      console.log(pulledData.val().rowToEdit);
        editor.setTextInBufferRange([
            [pulledData.val().rowToEdit, 0],
            [pulledData.val().rowToEdit, 1000]
        ], pulledData.val().lineData);
    });
});

export default {

    covalenceView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.covalenceView = new CovalenceView(state.covalenceViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.covalenceView.getElement(),
            visible: false
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'covalence:toggle': () => this.toggle()
        }));
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.covalenceView.destroy();
    },

    serialize() {
        return {
            covalenceViewState: this.covalenceView.serialize()
        };
    },

    toggle() {
        var pageData;
        var lineData;
        var lineToEdit = 0;
        firebase.database.INTERNAL.forceWebSockets();


        atom.workspace.observeTextEditors(function(editor) {
            currentRow = editor.getCursorBufferPosition().row;
            newRow = editor.getCursorBufferPosition().row;
            editor.onDidChangeCursorPosition(function() {
              if (newRow !== (currentRow + 1)) {
                currentRow = editor.getCursorBufferPosition().row;
                newRow = editor.getCursorBufferPosition().row;
              }
              // currentRow = editor.getCursorBufferPosition().row;
              newRow = editor.getCursorBufferPosition().row;
              // console.log("Did Change");
                if (applyChange) {
                    newRow = editor.getCursorBufferPosition().row;
                    if (newRow !== currentRow) {
                      lineToEdit = currentRow
                      console.log("Line Change. Current Row: " + currentRow + "New Row: " + newRow);
                        lineData = editor.lineTextForBufferRow(currentRow);
                        pageData = editor.getText();
                        currentRow = editor.getCursorBufferPosition().row;

                        // console.log(lineData);
                        if (lineData) {
                          sendData(lineData, lineToEdit, pageData);

                          // console.log("data sent:" + lineData);
                        }
                        else {
                          // console.log("write code here");
                        }
                    }
                } else {
                    applyChange = true;
                }

              // console.log(currentRow);
              // console.log(newRow);
              // console.log(lineData);

            });
        });

        function sendData(lineData, rowToEdit, pageData) {
          applyChange = false;
          firebase.database.INTERNAL.forceWebSockets();
          firebase.database().ref("projects").set({
              "lineData": lineData,
              "rowToEdit": rowToEdit,
              "pageData": pageData
          });
        }
    }

    // function onSignIn(googleUser) {
    //     console.log('Google Auth Response', googleUser);
    //     // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    //     var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
    //         unsubscribe();
    //         // Check if we are already signed-in Firebase with the correct user.
    //         if (!isUserEqual(googleUser, firebaseUser)) {
    //             // Build Firebase credential with the Google ID token.
    //             var credential = firebase.auth.GoogleAuthProvider.credential(
    //                 googleUser.getAuthResponse().id_token);
    //             // Sign in with credential from the Google user.
    //             firebase.auth().signInWithCredential(credential).catch(function(error) {
    //                 // Handle Errors here.
    //                 var errorCode = error.code;
    //                 var errorMessage = error.message;
    //                 // The email of the user's account used.
    //                 var email = error.email;
    //                 // The firebase.auth.AuthCredential type that was used.
    //                 var credential = error.credential;
    //                 // ...
    //             });
    //         } else {
    //             console.log('User already signed-in Firebase.');
    //         }
    //     });
    // }
    //
    // function isUserEqual(googleUser, firebaseUser) {
    //     if (firebaseUser) {
    //         var providerData = firebaseUser.providerData;
    //         for (var i = 0; i < providerData.length; i++) {
    //             if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
    //                 providerData[i].uid === googleUser.getBasicProfile().getId()) {
    //                 // We don't need to reauth the Firebase connection.
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }
    // }
};
