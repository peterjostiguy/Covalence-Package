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

// var enemiesCursor;
var changedData = firebase.database().ref('projects');
changedData.on('value', function(pulledData) {
    applyChange = false;
    atom.workspace.observeTextEditors(function(editor) {
        editor.setTextInBufferRange([
            [pulledData.val().rowToEdit, 0],
            [pulledData.val().rowToEdit, 0]
        ], pulledData.val().lineData);
        // editor.setText(pulledData.val().lineData)
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
        // var currentRow = 0;
        // var newRow = 0;

        atom.workspace.observeTextEditors(function(editor) {
            currentRow = editor.getCursorBufferPosition().row;
            newRow = editor.getCursorBufferPosition().row;
            editor.onDidChange(function() {
                if (applyChange) {
                    newRow = editor.getCursorBufferPosition().row;
                    if (newRow !== currentRow) {
                        lineData = editor.lineTextForBufferRow(currentRow);
                        if (lineData) {
                            sendData(lineData, currentRow);
                        }
                    }
                } else {
                    applyChange = true;
                }
            });
        });

        function sendData(lineData, rowToEdit) {
          applyChange = false;
          firebase.database.INTERNAL.forceWebSockets();
          firebase.database().ref("projects").set({
              "lineData": lineData,
              "rowToEdit": rowToEdit
          });
          atom.workspace.observeTextEditors(function(editor) {
            currentRow = newRow;
          })
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
