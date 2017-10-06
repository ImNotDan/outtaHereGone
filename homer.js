var slackKeyLink = 'https://hooks.slack.com/services/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';
var test = "Kao Tests"
var ultimateTest = "Dan Tests"

function getDataToPost(test) {
	var thisURL = makeLink(test);

	console.log(thisURL);

	var hrObj = {};
	var hrArr = [];

	$.ajax({
	    url: thisURL,
	    type: 'GET',
	    dataType: 'json',
	    success: function(data) {
	        console.log(data);
	        processData(data);
	    }
    });
}

function processData(data){
	var receivedJSON = data.data.games.game;
	var hr = _.pluck(receivedJSON, 'home_runs');
	//var score = _.pluck(receivedJSON, 'alerts');
	var mkeObj = _.filter(receivedJSON, function (team) {
		return team.away_team_name == "Brewers" || team.home_team_name == "Brewers";
	});

	if (!_.isEmpty(mkeObj)) {
		var hrObj = {};
		var hrArr = [];
		var hrType;

		var testData = _.filter(hr, function (x) {
			if (x != undefined) {
				if (_.isArray(x.player)) {
					_.each(x.player, function (list) {
						if (list.team_code == "mil") {
							hrArr.push(list);
						}
					})
				} else if (_.isObject(x.player)) {
					if (x.player.team_code == "mil") {
						hrArr.push(x.player);
					}
				}
			}
		});
		var sortedArr = _.sortBy(hrArr, 'inning');
		//var hrType = "solo";
		testData = sortedArr.reverse()[0];
		var hrType;
		if (testData) {
			switch (parseInt(testData.runners)) {
				case 0:
					hrType = "solo home run";
					break;
				case 1:
					hrType = "2 run homer";
					break;
				case 2:
					hrType = "3 run homer";
					break;
				case 3:
					hrType = "f*#!ing grand slam";
					break;
				default:
					hrType = "home run";
					break;
			}
		}

		var message = {
			"attachments": [{
				"fallback": "Home Run!"
			}]
		}

		var text = `${mkeObj[0].away_team_name} ${mkeObj[0].linescore.r.away}, ${mkeObj[0].home_team_name} ${mkeObj[0].linescore.r.home} `;
		var title = `${testData.first} ${testData.last} hits a ${hrType} in the ${addSuffix(testData.inning)}! (No. ${testData.std_hr})`;
		var goToLink = "https://www.mlb.com/brewers/scores";
		var color = mkeObj[0].home_code == 'mil' ? "#2570a9" : "#FFD700"; //need to switch color based on location

		message.attachments[0]["color"] = color;
		message.attachments[0]["text"] = text;
		message.attachments[0]["title"] = title;
		message.attachments[0]["title_link"] = goToLink;
		message.attachments[0]["fields"] = [
			{
				"title": "Home Runs This Year",
				"value": testData.std_hr,
				"short": true
			}
		];
		postToSlack(message);

	} else {
		var reject = {
			"attachments": [{
				"text": "Nothing Yet!"
			}]
		}
		postToSlack(reject);
	}
}

function makeLink(testMode) {
	var month = new Date().getMonth() + 1;
	var day = new Date().getDate();
	var year = new Date().getFullYear();

	var today = {
		"month": month < 10 ? month = '0' + month : month,
		"day": day < 10 ? day = '0' + day : day,
		"year": year
	}
	var apiUrl = 'http://gd2.mlb.com/components/game/mlb/year_' + today.year + '/month_' + today.month + '/day_' + today.day + '/master_scoreboard.json';
	if (!!testMode) apiUrl = "http://gd2.mlb.com/components/game/mlb/year_2017/month_09/day_06/master_scoreboard.json";

	return apiUrl;
}

function postToSlack(msg) {
	$.ajax({
		type: "POST",
		url: slackKeyLink,
		data: JSON.stringify(msg),
	});
}

function addSuffix(i) {
	var j = i % 10,
		k = i % 100;
	if (j == 1 && k != 11) {
		return i + "st";
	}
	if (j == 2 && k != 12) {
		return i + "nd";
	}
	if (j == 3 && k != 13) {
		return i + "rd";
	}
	return i + "th";
}

