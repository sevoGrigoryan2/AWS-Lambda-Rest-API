const AWS = require("aws-sdk");
const uuid = require('uuid');
const dynamodb = require('serverless-dynamodb-client');


const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
};

const responses = {
    success: (data = {}, code = 200) => {
        return {
            'statusCode': code,
            'headers': responseHeaders,
            'body': JSON.stringify(data)
        }
    },
    error: (error) => {
        return {
            'statusCode': error.code || 500,
            'headers': responseHeaders,
            'body': JSON.stringify(error)
        }
    }
};


module.exports =
    {

        saveData: (event, context, callback) => {
            let body = JSON.parse(event.body);
            let id = uuid.v4();
            let params = {
                TableName: 'TacoGallery',
                Item: {
                    "id": id,
                    "firstname": body.firstname,
                    "lastname": body.lastname
                }
            };

            return dynamodb.doc.put(params).promise().then(data => {
                data = Object.assign({id: id}, data);
                console.log(data);
                return callback(null, responses.success("User added"));

            });


        },

        getDataItemById: (event, context, callback) => {

            const index = event.pathParameters.id;
            console.log(index);
            console.log("ok");
            let params = {
                TableName: 'TacoGallery',
                AttributesToGet: [
                    "firstname"
                ],
                Key: {
                    id: index
                }
            };

            return dynamodb.doc.get(params, function (err, data) {
                if (err) {
                    return callback(null, responses.error(err))
                }
                else {
                    return callback(null, responses.success(data));

                }

            });

        },

        getAllData: (event, context, callback) => {

            const params = {
                TableName: "TacoGallery",
                ProjectionExpression: "id, firstname, lastname"
            };

            console.log("Scanning Items.");

            const onScan = (err, data) => {

                if (err) {
                    console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
                    callback(null, responses.error(err));
                } else {
                    console.log("Scan succeeded.");
                    return callback(null, responses.success(data.Items));
                }

            };

            dynamodb.doc.scan(params, onScan);

        },

        updateItemById: (event, context, callback) => {
            try {
                let body = JSON.parse(event.body);
                let params = {
                    TableName: 'TacoGallery',
                    Key: {
                        id: body.id,
                    },
                    UpdateExpression: 'SET #field = :v',
                    ExpressionAttributeNames: {
                        "#field": body.field
                    },
                    ExpressionAttributeValues: {
                        ":v": body.value
                    }

                };


                dynamodb.doc.update(params, function (err, data) {
                    return callback(null, responses.success(data));


                });
            }
            catch (error) {
                return callback(null, responses.error(error));
            }

        },


        deleteItemById: (event, context, callback) => {
            let body = JSON.parse(event.body);
            console.log(body.id);
            const params = {
                TableName: "TacoGallery",
                Key: {
                    id: body.id
                }
            };
            dynamodb.doc.delete(params, function (err, data) {
                if (err) {
                    return callback(null, responses.error(err))
                }
                else {
                    return callback(null, responses.success("User Removed"));

                }

            });


        },

        aggregator: (event, context) => {
            let eventText = JSON.stringify(event, null, 2);
            console.log("Received event:", eventText);
            let sns = new AWS.SNS();
            let params = {
                Message: eventText,
                Subject: "Test SNS From Lambda",
                TopicArn: "arn:aws:sns:us-east-1:578641730378:aggregate"
            };
            sns.publish(params, context.done);
        }


    };
