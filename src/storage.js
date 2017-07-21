'use strict'
var AWS = require("aws-sdk");

AWS.config.update({
	region: "us-east-1",
	endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var storage = (function() {
	var dynamodb = new AWS.DynamoDB();
	return {
		setEggCount: function(eggCount, session, callback) {
			var params = {
				TableName: "eggCountTable",
				Item: {
                    "UserId": {
                        S: session.user.userId
                    },
                    "EggCount": {
                        N: eggCount
                    }
				}
			};
			dynamodb.putItem(params, function(err, data) {
				callback(eggCount);
			})
		},
		updateEggCount: function(eggDelta, session, callback) {
			var params = {
                ExpressionAttributeNames: {
                    "#E": "EggCount"
                },
				TableName: "eggCountTable",
                ExpressionAttributeValues: {
                    ":d": {
                        N: eggDelta
                    },
                    ":0": {
                        N: '0'
                    },
                    ":minus_d": {
                        N: String(parseInt(eggDelta)*-1)
                    }
                },
				Key: {
                    "UserId": {
                        S: session.user.userId
                    }
                },
				ReturnValues: "UPDATED_NEW",
                UpdateExpression: "SET #E = if_not_exists(#E,:0) + :d",
                ConditionExpression: "#E >= :minus_d"
			};
			dynamodb.updateItem(params, function(err, data) {
			    if (err) {
                    console.log(err);
                    callback(null);
                } else {
                    callback(data.Attributes.EggCount.N);
                }
			})
		},
		getEggCount: function(session, callback) {
			var params = {
				TableName: 'eggCountTable',
				Key: {
                    "UserId": {
                        S: session.user.userId
                    }
				}
			};
			dynamodb.getItem(params, function(err, data) {
                try {
                    if (err) {
                        console.log(err);
                        callback(null);
                    } else {
                        callback(data.Item.EggCount.N);
                    }
                } catch(e) {
                    callback(null);
                }
			});
		},
		setFavoriteEggDish: function(eggDish, session, callback) {
		    var params = {
		        TableName: 'favoriteEggDish',
		        Item: {
					UserId: session.user.userId,
					EggDish: eggDish
				}
			};
			dynamodb.put(params, function(err, data) {
				callback(eggDish);
			});
		},
		getFavoriteEggDish: function(session, callback) {
		    var params = {
		        TableName: 'favoriteEggDish',
		        Key: {
					UserId: session.user.userId,
				}
			};
			dynamodb.get(params, function(err, data) {
				callback(data.Item.EggDish);
			});
		}
	}
})();

module.exports = storage;
