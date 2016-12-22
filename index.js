var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var AMS = require('./AMS');
var fs = require('fs');

require('dotenv').config();

exports.handler = function() {

   /*
    You have two ways to login. One via the normal Username/Password method.
    Other via the Registration ID and Birthdate method.

   */

   //This is for the normal username and password method. Modify details accordingly.
   var loginDetails = {
        "username" : "YourUsername", //Your AMS username. If not this, see the below alternate login.
        "password" : "YourPassword", //Your AMS password.
        "type" : "password" //DO NOT modify this.
    }

    //This is for registration ID and birthdate method. Modify details accordingly.
    var loginDetailsAlternate = {
        "username" : "123456789", //Your registration ID (9 digit).
        "password" : "1993-12-30", //Your date of birth in YYYY-MM-DD format.
        "type" : "regbirth" //DO NOT modify this.
    }

   /*
    Replace the loginDetailsAlternate variable either with loginDetails (if you are using Username method
    or loginDetailsAlternate if you are using registration ID method.
   */
   var event = loginDetailsAlternate;

   if(event.type && event.username && event.password) {
       AMS.getAllData(event.type, event.username, event.password).then(function(data){
            console.log(JSON.stringify(data));
        }).catch(function(err){
            console.log('Error in AMS - ' + err);
        });
   }
    
}

require('make-runnable');