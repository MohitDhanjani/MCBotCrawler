var request = require('request');
var cheerio = require('cheerio');
const Consumer = require('sqs-consumer'); 
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var AMS = require('./AMS');
var Dynamite = require('dynamite');

require('dotenv').config();

const DDBTable = process.env.DYNAMODB_TABLE;
const DDBHashKey = process.env.DYNAMODB_HASH_KEY;
const QueueUrl = process.env.SQS_QUEUE_URL;

var dbclient = new Dynamite.Client({region: process.env.AWS_REGION});

var putDataInDB = function(userID, data) {

    return new Promise(function(resolve, reject){
        dbclient.newUpdateBuilder(DDBTable)
        .setHashKey(DDBHashKey, userID)
        .enableUpsert()
        .putAttribute('latest_sem', JSON.stringify(data))
        .putAttribute('gpa', JSON.stringify(data.gpa))
        .putAttribute('md5_hash', data.md5value)
        .execute().then(function(ds){
            resolve(true);
        }).fail(function(err){
            console.log(err);
        });
    });

    
}

exports.handler = function(event, context) {

   if(event.userID && event.type && event.username && event.password) {
       console.log("Inside the condition.");
       console.log(event);
       AMS.getAllData(event.userID, event.type, event.username, event.password).then(function(data){
            putDataInDB(event.userID, data).then(() => {
                context.succeed(data);
                });
        }).catch(function(err){
            console.log('Error in AMS - ' + err);
            context.fail(err);
        });
   } else {
       const app = Consumer.create({
            queueUrl: QueueUrl,
            handleMessage: (message, done) => {
                var userData = JSON.parse(message.Body);
                console.log(userData);
                AMS.getAllData(userData.userID, userData.type, userData.username, userData.password).then(function(data){
                    putDataInDB(userData.userID, data).then(() => {

                        done()});
                }).catch(function(err){
                    console.log('Error in AMS - ' + err);
                    context.fail(err);
                });
            },
            sqs : new AWS.SQS()
        });

        app.on('error', (err) => {
            console.log("Eroor in queue - " + err.message);
        });

        app.on('empty', () => {
        context.succeed("The queue is empty. Quiting process");
        });

        app.start();
   }
    
}

//Uncomment below line for testing fast.
//require('make-runnable');