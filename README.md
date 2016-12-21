# MCBotCrawler
A scalable Academic Management System  (AMS, Manipal University Jaipur) crawler &amp; parser.

### Introduction

MCBOtCrawler is an independent crawler & parser component of the chatbot being made for Facebook Messenger which automatically
will crawl AMS on behalf of students and parse the data (like attendance, marks, GPA, etc) into JSON format to be processed further.

The program runs fully on Amazon Web Service cloud. It uses Lambda for execution, Simple Queue Service (SQS) for taking the credentials
of the students from the queue which is sent by the chatbot, and saves the resulted JSON data in DynamoDB.

This project is not approved or affilated by the university as of now.

### Requirements

Amazon Web Service account

Node Package Manager (NPM)

Node.js - v4.3.2 (if you want to test locally)

### Before you start

This program can easily be run without any hassle. All you need is below things in order for it to run.

1. Make sure you have a DynamoDB table in place for saving JSON response.

2. A SQS queue in place (if you only you are using it).

3. One managed policy to so that the Lambda function can access DynamoDB table and SQS queue ([see here](https://github.com/MohitDhanjani/MCBotCrawler/blob/master/sample_policy.json)).

### Steps to deploy

1. Clone the repo.
2. Do a `npm install` (this will install all project dependencies).
3. Put relevant settings in `.env_sample` file and rename file as `.env`.
4. Zip all the files. DO NOT zip the folder itself. Zip the files contained in the folder.
5. Upload it on AWS Lambda! And you are done! 

When running the Lambda function. Do a test with the following event data...

`{"userID": "randomID", "username" : "YourRegistrationID", "password" : "YourBirthdateYYYY-MM-DD", "type": "regbirth"}`

### Note

Make sure Lambda timeout settings are in minutes. Not seconds.
