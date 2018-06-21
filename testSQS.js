'use strict';

const env = require('./config');
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const date = require('date-and-time');
const ddb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const uuid = require("uuid");
const createMessage = ({MessageGroupId, MessageBody, QueueUrl}) => {
    return new Promise(async (resolve, reject) => {
        try {
            let messId = uuid();
            let params = {
                MessageGroupId,
                MessageDeduplicationId: messId,
                MessageBody,
                QueueUrl
            };
            sqs.sendMessage(params, function (err, data) {
                if (err) {
                    console.log("Error", err);
                    reject(err)
                } else {
                    console.log("Success", data.MessageId);
                    resolve(data)
                }
            });
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};


module.exports.testSQS = (event, context, callback) => {
    const createSqsMessage = (dat, url) => {
        return new Promise(async (resolve, reject) => {
            try {
                let sqsMessage = JSON.stringify(dat);
                let sqs = await createMessage({ MessageGroupId: 'MatchingAlgorithm', MessageBody: 'This is a test', QueueUrl: env.queue });
                resolve(sqs);
            } catch (error) {
                console.log('ERROR:', error);
                reject(error);
            }
        })
    };



    // export const receiveMessage = (url) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let messId = uuid();
    //             let params = {
    //                 QueueUrl: url,
    //                 AttributeNames: [
    //                     "ALL"
    //                 ],
    //                 MaxNumberOfMessages: 1,
    //                 ReceiveRequestAttemptId: messId,
    //                 WaitTimeSeconds: 15,
    //             };
    //             sqs.receiveMessage(params, function (err, data) {
    //                 if (err) {
    //                     console.log(err, err.stack);
    //                 }
    //                 else {
    //                     console.log(data);
    //                     resolve(data)
    //                 }
    //             });
    //         } catch (err) {
    //             console.log(err);
    //             reject(err);
    //         }
    //     });
    // };



    // export const deleteMessageFromQueue = (receiptHandle, url) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let messId = uuid();
    //             let params = {
    //                 ReceiptHandle: receiptHandle,
    //                 QueueUrl: url
    //             };
    //             sqs.deleteMessage(params, function (err, data) {
    //                 if (err) {
    //                     console.log("Error", err);
    //                     reject(err)
    //                 } else {
    //                     console.log("Success");
    //                     resolve(data)
    //                 }
    //             });
    //         } catch (err) {
    //             console.log(err);
    //             reject(err);
    //         }
    //     });
    // };

};