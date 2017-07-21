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
					"UserId": {
					    S: session.user.userId
					},
					"EggDish": {
					    S: eggDish
					}
				}
			};
			dynamodb.putItem(params, function(err, data) {
				callback(eggDish);
			});
		},
		getFavoriteEggDish: function(session, callback) {
		    var params = {
		        TableName: 'favoriteEggDish',
		        Key: {
					"UserId": {
					    S: session.user.userId,
					}
				}
			};
			dynamodb.getItem(params, function(err, data) {
			    console.log(data);
				callback(data.Item.EggDish.S);
			});
		},
		saveEggEvent: function(eggsUsed, session) {
		    var params = {
		        TableName: 'eggEvents',
		        Item: {
		            "UserId": {
		                S: session.user.userId,
		            },
		            "Timestamp": {
		                N: String(Date.now())
		            },
					"EggsUsed": {
					    N: String(eggsUsed)
					}
		        }
		    }
		    dynamodb.putItem(params, function(err, data) {
		        if (err) console.log(err);
			});
		},

        getDishSuggestion: function(session, callback) {
            var choices = [
                'omelette',
                'egg in a hole',
                'soft boiled egg',
                'seasoned egg',
                'egg',
                'handful of eggs',
                'pair of eggs',
                'poached egg',
                'eggs benedict',
                'raw egg',
                'hard boiled egg',
                'soft boiled egg',
                'eggs over easy',
                'eggs over medium',
                'eggs over hard',
                'frittata',
                'quiche',
                'fried egg',
                'scrambled eggs'];
            var random_dish = choices[Math.floor(Math.random() * choices.length)];
            callback(random_dish);
        },

		getEggsUsed: function(timeRange, session, callback) {
		    var params = {
                TableName: 'eggEvents',
                KeyConditionExpression: '#uid = :user and #t > :time',
                ExpressionAttributeNames: {
                    "#uid": "UserId",
                    "#t": "Timestamp"
                },
                ExpressionAttributeValues: {
                    ':time': {
                        N: String(Date.now() - timeRange)
                    },
                    ':user': {
                        S: session.user.userId
                    },
                },
                ProjectionExpression: 'EggsUsed'
            };

            dynamodb.query(params, function(err, data) {
               if (err) console.log(err);

               var counter = 0;

               for (var i = 0; i < data.Items.length; i++) {
                    counter += parseInt(data.Items[i].EggsUsed.N);
               }

               console.log(counter);

               callback(counter);
            });
		}

        getOtherFoodResponse: function(other_food, session, callback) {
            var responses = [
                other_food + " ain't an egg",
                'Why have ' + other_food + ' when you could have an egg',
                'This skill deals eggs clusively with eggs',
                "Don't ever ask me about " + other_food + " again"];
            var random_response = responses[Math.floor(Math.random() * responses.length)];
            callback(random_response);
        }
	}
})();

module.exports = storage;
