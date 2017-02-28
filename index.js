const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.94e306df-bb3e-4a49-96db-ce40d0d5b07b';

const urlPrefix = 'http://www.sunhillinfants.co.uk/';
const urlCal = urlPrefix + 'diary/list/';

var d = new Date();
var todaysDate = d.getDate();
var todaysDay = d.getDay();
var fridaysDate = todaysDate;
var size = 0;

if (todaysDay === 7) {
    size = 6;    
    fridaysDate = todaysDate + 5;
} else if (todaysDay === 6) {
    size = 7;
    fridaysDate = todaysDate + 6;
} else if (todaysDay === 5) {
    size = 6 - todaysDay;
} else if (todaysDay === 4) {
    size = 6 - todaysDay;
    fridaysDate = todaysDate + 1;
} else if (todaysDay === 3) {
    size = 6 - todaysDay;
    fridaysDate = todaysDate + 2;
} else if (todaysDay === 2) {
    size = 6 - todaysDay;
    fridaysDate = todaysDate + 3;
} else if (todaysDay === 1) {
    size = 6 - todaysDay;
    fridaysDate = todaysDate + 4;
}

const urlCalSize = urlCal + '?size=' + size;
const request = require('sync-request');
const cheerio = require('cheerio');
var eventCount = 0;

const languageStrings = {
   'en-GB': {
       'translation': {
           SKILL_NAME : 'SunHill Infant School Calendar',
           HELP_MESSAGE : 'With the Sun Hill Infant skill, you can get events from the school calendar. For example, you could say, what\'s in the diary, or you can say exit?',
           HELP_REPROMPT : 'Ask what\'s in the diary?',
           STOP_MESSAGE : 'Goodbye!'
       }
   },
   'en-US': {
       'translation': {
           SKILL_NAME : 'SunHill Infant School Diary',
           HELP_MESSAGE : 'With the Sun Hill Infant skill, you can get events from the school calendar. For example, you could say, what\'s in the diary, or you can say exit?',
           HELP_REPROMPT : 'Ask what\'s in the diary?',
           STOP_MESSAGE : 'Goodbye!'
       }
   },
};

const handlers = {
   'LaunchRequest': function () {
       this.emit('GetEvents');
   },
   'GetEventsIntent': function () {
       this.emit('GetEvents');
   },
   'GetEvents': function () {
       var speechText = 'Here are the calendar entries';
       console.log('About to grab html ' + urlCalSize); 
       var result = request('GET', urlCalSize);
       console.log('just grabbed html');
       $ = cheerio.load(result.getBody());
       links = $('a');
       days = $('span.ps_calendar-day');
       dates = $('span.ps_calendar-date');
       months = $('span.ps_calendar-month');
       years = $('span.ps_calendar-year');
       console.log('About to enter loop'); 
       $(links).each(function(i, link){
           if ($(link).attr('href').indexOf('/diary/detail/') > -1) {
               if ($(dates[eventCount]).text() <= fridaysDate) {              
                   if ($(days[eventCount]).text() === 'Mon')
                       day='Monday';
                   if ($(days[eventCount]).text() === 'Tue')
                       day='Tuesday';
                   if ($(days[eventCount]).text() === 'Wed')
                       day='Wednesday';
                   if ($(days[eventCount]).text() === 'Thu')
                       day='Thursday';
                   if ($(days[eventCount]).text() === 'Fri')
                       day='Friday';
                   if ($(days[eventCount]).text() === 'Sat')
                       day='Saturday';
                   if ($(days[eventCount]).text() === 'Sun')
                       day='Sunday';

                   if ($(dates[eventCount]).text() === '1' || $(dates[eventCount]).text() === '21' || $(dates[eventCount]).text() === '31')
                       appendage='st';
                   else if ($(dates[eventCount]).text() === '2' || $(dates[eventCount]).text() === '22')
                       appendage='nd';
                   else if ($(dates[eventCount]).text() === '3' || $(dates[eventCount]).text() === '23')
                       appendage='rd';
                   else
                       appendage='th';

                   result=day + ', ' + $(dates[eventCount]).text() + appendage + ', ' + $(months[eventCount]).text() + ', ' + $(years[eventCount]).text() + ', ' + $(link).text().trim();
                   console.log(result);
                   speechText = speechText + ', ' + result;
               }
               eventCount++;
           }
       });
       console.log('events is length ' + speechText.length);
       if (eventCount === 0 && speechText < 30) {
           speechText = 'There is a problem connecting to Sun Hill Infants at this time. Please try again later.';
           this.emit(':tell', speechText);
       } else if (eventCount > 0 && spechText > 30) {
           console.log('speechText is ' + speechText);
           this.emit(':tellWithCard', speechText, this.t("SKILL_NAME"), speechText);
       } else
           speechText = "There are no entries for this week";
   },
   'AMAZON.HelpIntent': function () {
       var speechOutput = this.t("HELP_MESSAGE");
       var reprompt = this.t("HELP_MESSAGE");
       this.emit(':ask', speechOutput, reprompt);
   },
   'AMAZON.CancelIntent': function () {
       this.emit(':tell', this.t("STOP_MESSAGE"));
   },
   'AMAZON.StopIntent': function () {
       this.emit(':tell', this.t("STOP_MESSAGE"));
   },
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    if (event.session.application.applicationId !== "amzn1.ask.skill.94e306df-bb3e-4a49-96db-ce40d0d5b07b") 
        context.fail("Invalid Application ID"); 

    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
