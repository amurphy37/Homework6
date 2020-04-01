$(document).ready(function() {
  var apiKey = "&appid=cf7168c08936eb9f9173f6d58fd1943e&units=imperial";
  var history;
  function updateHistory () {
    history = JSON.parse(localStorage.getItem("searchHistory"));
  }
  updateHistory();

  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    $(".forecast-hide").removeClass("forecast-hide");

    // clear input box
    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + apiKey,
      dataType: "json",
      success: function (data) {
        // console.log(data);

        // Getting UV Index
        var latitude = data.city.coord.lat;
        var longitude = data.city.coord.lon;
        var URL = "http://api.openweathermap.org/data/2.5/uvi?appid=cf7168c08936eb9f9173f6d58fd1943e&lat=" + latitude + "&lon=" + longitude;
        console.log(URL);

        $.ajax({
          type: "GET",
          url: "http://api.openweathermap.org/data/2.5/uvi?appid=cf7168c08936eb9f9173f6d58fd1943e&lat=" + latitude + "&lon=" + longitude,
          dataType: "json",
          success: function (data) {
            // $(".forecast-hide").removeClass("forecast-hide");
            var card = $("<div>").addClass("card")
            var cardBody = $("<div>").addClass("card-body")
            var uvHeader = $("<h4>").addClass("card-header")
            uvHeader.text("UV Index")
            var uvIndex = $("<p>").text("UV Index: " + data.value);

            if (data.value <=2) {
              card.addClass("bg-success");
            }
            else if (2 < data.value <= 5) {
              card.addClass("bg-warning");  
            }
            else if (5 < data.value <= 7) {
              card.addClass("orange-bkgd")
            }
            else if(7 < data.value <= 10) {
              card.addClass("bg-danger");
            }
            else {
              card.addClass("violent-bdkgd");
            }
           
           $("#uv").append(card); 
           card.append(cardBody);
           cardBody.append(uvHeader, uvIndex); 
        }


        });


        // console.log(data);

        // Set empty arrays to which we will assign index values to pull data for forecast sections

        var earlyMorn = []
        var morning = []
        var afternoon = []
        var evening = []

          // Looping through all list items to find the index values for early morning forecast of city searched
          for (i = 0; i < 40; i++) {
            // Grabbing time of forecast and getting the UTC hour of that forecast
            var utcHour = new Date(data.list[i]["dt"] * 1000).getUTCHours();
            var timeDif = data.city.timezone / 3600
            //  Adjusting to find hour of forecast in city's timezone
            var correctTimeZoneHour = utcHour + timeDif
            //  adjusting if calculation went over 24 to go back to 0
            if (correctTimeZoneHour > 24) {
            correctTimeZoneHour = correctTimeZoneHour - 24
            }
          //  console.log(cityCurrentHour);

          //  checking if this iteration's hour is between midnight and 2, indicating that it is our first forecast of the next day.
          // If yes, then pushing that to the earlyMorn array as our values for early morning

            if (correctTimeZoneHour >= 0 && correctTimeZoneHour <= 3) {
            earlyMorn.push(i)
            }
          }

        //  Since all iterations are 3 hour forecasts away, using simple addition to create the index values for other time slots

          for (i = 0; i < earlyMorn.length; i++) {
          var morn = earlyMorn[i] + 2
          morning.push(morn);
          var aft = earlyMorn[i] + 4
          afternoon.push(aft);
          var eve = earlyMorn[i] + 6
          evening.push(eve);
          }
         // Find day of the week for today and set headers for each forecast days relative to this. 
         var day;
         var today = new Date().getDay();
         var day1 = today+1;
         var day2 = today+2;
         var day3 = today+3;
         var day4 = today+4;
         var day5 = today+5;
         var days = [day1, day2, day3, day4, day5];
         var writtenDay = []
         
        for (i=0; i<days.length; i++) {

         switch (days[i]) {
           case 0: 
            day = "Sunday";
            break;
           case 1: 
            day = "Monday";
            break;  
           case 2:
             day = "Tuesday";
             break;
           case 3:
             day = "Wednesday";
             break;
           case 4: 
             day = "Thursday";
             break;
           case 5:
             day = "Friday";
             break;

           case 6:
             day = "Saturday";
             break;
         }
         writtenDay.push(day);
        }
        // console.log(writtenDay);
         
        // Clearing old content
        for (i=0; i<5; i++) {
          var contentElID = $("#day-" + i)
          contentElID.empty();
        }
          
        // For loop to loop through arrays to map correct forecast to earlyMorn, Morn, Aft and Eve
        for (i=0; i<5; i++) {
      
        //  Looping through index value arrays to check which values are greater than 39, as 39 is the last index value of our lit of forecasts. If greater than, we will omit from the forecast.
              
        // Normal case where all four values are good throughout
          if (earlyMorn[i] <= 39 && morning[i] <= 39 && afternoon[i] <= 39 && evening[i] <= 39) {   
              var dayTitleEl = $("<h4>").addClass("card-title day-title").text(writtenDay[i]);
              var earlyMornEl = $("<div>");
              var earlyMornHeader = $("<h5>").text("Early Morning: ")
              var earlyMornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[earlyMorn[i]]["wind"]["speed"] + " MPH");
              var earlyMornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[earlyMorn[i]]["main"]["humidity"] + "%");
              var earlyMornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[earlyMorn[i]]["main"]["temp"] + " °F");
              var earlyMornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[earlyMorn[i]]["weather"][0]["icon"] + ".png");
              earlyMornEl.append(earlyMornHeader, earlyMornTemp, earlyMornWind, earlyMornHumid, earlyMornImg);
              var morningEl = $("<div>");
              var mornHeader = $("<h5>").text("Morning: ")
              var mornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[morning[i]]["wind"]["speed"] + " MPH");
              var mornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[morning[i]]["main"]["humidity"] + "%");
              var mornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[morning[i]]["main"]["temp"] + " °F");
              var mornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[morning[i]]["weather"][0]["icon"] + ".png");
              morningEl.append(mornHeader, mornTemp, mornWind, mornHumid, mornImg);
              var afternoonEl = $("<div>");
              var aftHeader = $("<h5>").text("Afternoon: ")
              var aftWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[afternoon[i]]["wind"]["speed"] + " MPH");
              var aftHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[afternoon[i]]["main"]["humidity"] + "%");
              var aftTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[afternoon[i]]["main"]["temp"] + " °F");
              var aftImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[afternoon[i]]["weather"][0]["icon"] + ".png");
              afternoonEl.append(aftHeader, aftTemp, aftWind, aftHumid, aftImg);
              var eveningEl = $("<div>");
              var eveHeader = $("<h5>").text("Evening: ")
              var eveWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[evening[i]]["wind"]["speed"] + " MPH");
              var eveHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[evening[i]]["main"]["humidity"] + "%");
              var eveTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[evening[i]]["main"]["temp"] + " °F");
              var eveImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[evening[i]]["weather"][0]["icon"] + ".png");
              eveningEl.append(eveHeader, eveTemp, eveWind, eveHumid, eveImg);
              // Creating string for id based on iteration value
              var idString = "#day-" + i
              // Grabbing html element dynamically for correct parent el by ID 
              $(idString).append(dayTitleEl, earlyMornEl, morningEl, afternoonEl, eveningEl);
          }
              //  Case where all but evening are available for last day
        else if (earlyMorn[i] <=39 && morning[i] <=39 && afternoon[i] <=39 && evening[i] > 39) {
              var dayTitleEl = $("<h4>").addClass("card-title day-title").text(writtenDay[i]);
              var earlyMornEl = $("<div>");
              var earlyMornHeader = $("<h5>").text("Early Morning: ")
              var earlyMornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[earlyMorn[i]]["wind"]["speed"] + " MPH");
              var earlyMornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[earlyMorn[i]]["main"]["humidity"] + "%");
              var earlyMornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[earlyMorn[i]]["main"]["temp"] + " °F");
              var earlyMornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[earlyMorn[i]]["weather"][0]["icon"] + ".png");
              earlyMornEl.append(earlyMornHeader, earlyMornTemp, earlyMornWind, earlyMornHumid, earlyMornImg);
              var morningEl = $("<div>");
              var mornHeader = $("<h5>").text("Morning: ")
              var mornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[morning[i]]["wind"]["speed"] + " MPH");
              var mornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[morning[i]]["main"]["humidity"] + "%");
              var mornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[morning[i]]["main"]["temp"] + " °F");
              var mornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[morning[i]]["weather"][0]["icon"] + ".png");
              morningEl.append(mornHeader, mornTemp, mornWind, mornHumid, mornImg);
              var afternoonEl = $("<div>");
              var aftHeader = $("<h5>").text("Afternoon: ")
              var aftWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[afternoon[i]]["wind"]["speed"] + " MPH");
              var aftHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[afternoon[i]]["main"]["humidity"] + "%");
              var aftTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[afternoon[i]]["main"]["temp"] + " °F");
              var aftImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[afternoon[i]]["weather"][0]["icon"] + ".png");
              afternoonEl.append(aftHeader, aftTemp, aftWind, aftHumid, aftImg);
              // Creating string for id based on iteration value
              var idString = "#day-" + i
              // Grabbing html element dynamically for correct parent el by ID 
              $(idString).append(dayTitleEl, earlyMornEl, morningEl, afternoonEl);
          }
              // // Case where just earlyMorn and morning are available for last day
          else if (earlyMorn[i] <=39 && morning[i] <=39 && afternoon[i] > 39 && evening [i] > 39) {
              var dayTitleEl = $("<h4>").addClass("card-title day-title").text(writtenDay[i]);
              var earlyMornEl = $("<div>");
              var earlyMornHeader = $("<h5>").text("Early Morning: ")
              var earlyMornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[earlyMorn[i]]["wind"]["speed"] + " MPH");
              var earlyMornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[earlyMorn[i]]["main"]["humidity"] + "%");
              var earlyMornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[earlyMorn[i]]["main"]["temp"] + " °F");
              var earlyMornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[earlyMorn[i]]["weather"][0]["icon"] + ".png");
              earlyMornEl.append(earlyMornHeader, earlyMornTemp, earlyMornWind, earlyMornHumid, earlyMornImg);
              var morningEl = $("<div>");
              var mornHeader = $("<h5>").text("Morning: ")
              var mornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[morning[i]]["wind"]["speed"] + " MPH");
              var mornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[morning[i]]["main"]["humidity"] + "%");
              var mornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[morning[i]]["main"]["temp"] + " °F");
              var mornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[morning[i]]["weather"][0]["icon"] + ".png");
              morningEl.append(mornHeader, mornTemp, mornWind, mornHumid, mornImg);
              // Creating string for id based on iteration value
              var idString = "#day-" + i
              // Grabbing html element dynamically for correct parent el by ID 
              $(idString).append(dayTitleEl, earlyMornEl, morningEl);
          }
           // Case where just earlyMorn available for just last day
          else {
              var dayTitleEl = $("<h4>").addClass("card-title").text(writtenDay[i]);
              var earlyMornEl = $("<div>");
              var earlyMornHeader = $("<h5>").text("Early Morning: ")
              var earlyMornWind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[earlyMorn[i]]["wind"]["speed"] + " MPH");
              var earlyMornHumid = $("<p>").addClass("card-text").text("Humidity: " + data.list[earlyMorn[i]]["main"]["humidity"] + "%");
              var earlyMornTemp = $("<p>").addClass("card-text").text("Temperature: " + data.list[earlyMorn[i]]["main"]["temp"] + " °F");
              var earlyMornImg = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[earlyMorn[i]]["weather"][0]["icon"] + ".png");
              earlyMornEl.append(earlyMornHeader, earlyMornTemp, earlyMornWind, earlyMornHumid, earlyMornImg);
              // Creating string for id based on iteration value
              var idString = "#day-" + i
              // Grabbing html element dynamically for correct parent el by ID 
              $(idString).append(dayTitleEl, earlyMornEl);
             
        }
      }
      }  
  });
}

function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + apiKey,
      dataType: "json",
      success: function(data) {
        // console.log(data);
        updateHistory();
        if (history === null) {
          var searchHistory = []
          searchHistory.push(searchValue);
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
          makeRow(searchValue);
        }
        else {
          var searchHistory = JSON.parse(localStorage.getItem("searchHistory"))
          searchHistory.push(searchValue);
          localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
          makeRow(searchValue);
        }

        // clear any old content
        $("#today").empty();
        $("#uv").empty();

        // create html content for current weather
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // clear old forecast
        // $("parent-forecast-div").clear();

        // // call follow-up api endpoints
        getForecast(searchValue);


      }
    });


  }

  


  
  

  
//Get Started 

});

