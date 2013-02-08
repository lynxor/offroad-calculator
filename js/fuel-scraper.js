var _ = require("underscore"),
    jsdom = require("jsdom"),
    moment = require("moment"),
    url = "http://www.aa.co.za/on-the-road/calculator-tools/fuel-pricing.html",
    fs = require("fs"),
    jqueryString = fs.readFileSync(__dirname +"/../public/vendor/jquery-1.9.1.js");

function scrape(callback) {
    jsdom.env({
        html:url,
        src: [jqueryString],
        done:function (err, w) {

            try {
                var $ = w.$,
                    petrolTable = $("table")[1],
                    dieselTable = $("table")[2],
                    date = moment( $(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(1)").text() ),
                    petrol = [
                        {description:"Reef Unleaded 93", value:$(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(2)").text()},
                        {description:"Reef Unleaded 95", value:$(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(3)").text()},
                        {description:"Reef LRP", value:$(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(4)").text()},

                        {description:"Coast Unleaded 93", value:$(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(5)").text()},
                        {description:"Coast Unleaded 95", value:$(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(6)").text()},
                        {description:"Coast LRP", value:$(petrolTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(7)").text()}
                    ],
                    diesel = [
                        {description:"Reef 0.05%", value:$(dieselTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(2)").text() },
                        {description:"Reef 0.01%", value:$(dieselTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(3)").text() },
                        {description:"Coast 0.05%", value:$(dieselTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(4)").text() },
                        {description:"Coast 0.01%", value:$(dieselTable).find("tr:nth-child(4) > tr:first-child > td:nth-child(5)").text() }
                    ];
                callback(null, petrol, diesel, date);
            }
            catch (e) {
                callback(e);
            }
        }});
}

exports.scrape = scrape;
