'use strict';

const AWS = require('aws-sdk');
const config = require('./config.js');


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

module.exports.addNote = (event, context, callback) => {
    const createSqsMessage = (dat, url) => {
        return new Promise(async (resolve, reject) => {
            try {
                const data = JSON.parse(event.body);
                let sqs = await createMessage({ MessageGroupId: 'MatchingAlgorithm', MessageBody: data.note, QueueUrl: env.queue });
                resolve(sqs);
            } catch (error) {
                console.log('ERROR:', error);
                reject(error);
            }
        })
    };

    const data = JSON.parse(event.body);
    if (typeof data.note !== 'string') {
        console.error('Validation Failed');
        callback(null, {
            statusCode: 400,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t add the note.',
        });
        return;
    }

    const params = {
        Message: data.note,
        TopicArn: `arn:aws:sns:us-east-1:${config.awsAccountId}:analyzeNote`,
    };

    sns.publish(params, (error) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: 501,
                headers: { 'Content-Type': 'text/plain' },
                body: 'Couldn\'t add the note due an internal error. Please try again later.',
            });
        }
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Successfully added the note.' }),
        };
        callback(null, response);
    });
};