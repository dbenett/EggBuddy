'use strict'
var AWS = require("aws-sdk");

AWS.config.update({
	region: "us-east-1",
	endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var storage = (function() {
	var dynamodb = new AWS.DynamoDB.DocumentClient();
	return {
		setEggCount: function(eggCount, session, callback) {
			var params = {
				TableName: "eggCountTable",
				Item: {
					UserId: session.user.userId,
					EggCount: parseInt(eggCount)
				}
			};
			dynamodb.put(params, function(err, data) {
				callback(eggCount);
			})
		},
		updateEggCount: function(eggDelta, session, callback) {
			var params = {
				TableName: "eggCountTable",
				Key: {
                    UserId: session.user.userId
                },
                AttributeUpdates: {
                    "EggCount": {
                        Action: "ADD",
                        Value: parseInt(eggDelta)
                    }
                },
				ReturnValues: "ALL_NEW",
				Expected: {
				    "EggCount": {
				        AttributeValueList: [
                            0
                        ],
                        ComparisonOperator: "GE"
				    }
				}
			};
			dynamodb.update(params, function(err, data) {
			    if (err) console.log(err);
			    console.log(data);
				callback(data.Attributes.EggCount);
			})
		},
		getEggCount: function(session, callback) {
			var params = {
				TableName: 'eggCountTable',
				Key: {
					UserId: session.user.userId,
				}
			};
			dynamodb.get(params, function(err, data) {
				callback(data.Item.EggCount);
			});
		}
	}
})();

module.exports = storage;
