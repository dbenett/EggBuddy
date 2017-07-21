// Lambda Node.JS
'use strict';
var Alexa = require("alexa-sdk");
var storage = require("./storage");

exports.handler = function (event, context, callback) {
	var alexa = Alexa.handler(event, context);
	alexa.registerHandlers(handlers);
	alexa.execute();

};

const handlers = {
	'LaunchRequest': function () {
		var welcomeMessage = 'Hello! How many eggs will you be enjoying this morning?';
		this.emit(':ask', welcomeMessage, 'Try again.');
	},

	'SetEggCount': function() {
	    var eggCount = this.event.request.intent.slots.EggCount.value;
	    var response = '';

		storage.setEggCount(eggCount, this.event.session, (eggCount) => {
			response = 'Ok you have ' + eggCount + ' eggs remaining.';
			this.emit(':ask', response);
		});
	},

	'IncreaseEggCount': function() {
		var eggDelta = this.event.request.intent.slots.EggCount.value;
		var response = '';

		storage.updateEggCount(eggDelta, this.event.session, (eggCount) => {
			response = 'Ok you now have eggs actly ' + eggCount + ' eggs remaining.';
			this.emit(':ask', response);
		});
	},

	'DecreaseEggCount': function() {
		var eggDelta = -1 * this.event.request.intent.slots.EggCount.value;
		var response = '';

		storage.updateEggCount(eggDelta, this.event.session, (eggCount) => {
			response = 'Ok you now have ' + eggCount + ' eggs remaining.';
			this.emit(':ask', response);
		});
	},

	'GetEggCount': function() {
		var response = '';

		storage.getEggCount(this.event.session, (eggCount) => {
			response = 'You have ' + eggCount + ' remaining.';
			this.emit(':ask', response);
		});
	},

	'SetFavoriteEggDish': function() {
	    var eggDish = this.event.request.intent.slots.EggDish.value;
	    var response = '';

	    storage.setFavoriteEggDish(this.event.session, (eggDish) => {
	        response = 'Great, I love ' + eggDish + ' remaining.';
	        this.emit(':ask', response);
	    })
	}

	'Unhandled': function() {
		this.emit(':ask', 'Sorry, I didn\'t get that. Try saying something about eggs.', 'Try saying egg.');
	},

	'AMAZON.HelpIntent': function () {
		this.emit(':ask', 'Tell me about eggs.', 'try again');
	},

	'AMAZON.StopIntent': function () {
		var say = 'Goodbye.';

		this.emit(':tell', say );
	}

};