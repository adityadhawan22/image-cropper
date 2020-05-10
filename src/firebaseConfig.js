import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

var config = {
    apiKey: "AIzaSyAmYMvHniIRV5I2yGRPBLCWtbiVpns3K_s",
    authDomain: "instacopy-618fe.firebaseapp.com",
    databaseURL: "https://instacopy-618fe.firebaseio.com",
    projectId: "instacopy-618fe",
    storageBucket: "instacopy-618fe.appspot.com",
    messagingSenderId: "217261745550"
};

firebase.initializeApp(config);
firebase.firestore().settings({ timestampsInSnapshots: true });

export default firebase;
export const storage = firebase.storage();
export const auth = firebase.auth();
