/* Global variables */

window.json_response = {};

/* Functions */

async function getJSONFromURL(URL) {
  /* Puts JSON from URL into window.json_response */
  await fetch(URL).then((response) => {
    return (response.ok ? response.json() : alert(`Error: Could not get ${URL}`));
  }).then((data) => {
    window.json_response = data;
  });
}

function forecastPage(name, lat, lon) {
  window.location = `forecast.html?name=${name}&lat=${lat}&lon=${lon}`;
}

function forecastFromArray(arr) {
  forecastPage(arr[0], arr[1], arr[2]);
}

function saveLocation(location, lat, lon) {
  localStorage.setItem(location, `${lat},${lon}`);
}

async function geocode() {
  /* Gets location and takes you to that location */
  let location, URL, request, resp;
  location = document.getElementById("location").value;
  URL = `https://nominatim.openstreetmap.org/search?q=${location}, United States&format=json`;
  await getJSONFromURL(URL);
  resp = window.json_response;
  resp = resp[0];
  saveLocation(location, resp.lat, resp.lon);
  forecastPage(resp.display_name, resp.lat, resp.lon);
}

function toggle(i) {
  let alertItem;
  alertItem = document.getElementById("alert"+i);
  if (alertItem.style.display === "none") {
    alertItem.style.display = "block";
  } else {
    alertItem.style.display = "none";
  }
}

function getIcon(textDescription) {
  let found, text;
  text = textDescription;

  const storm = new RegExp("storm", "i");

  const rain = new RegExp("rain", "i");
  const shower = new RegExp("shower", "i");

  const cloudy = new RegExp("cloud", "i");

  const clear = new RegExp("clear", "i");
  const sunny = new RegExp("sunny", "i");

  const fog = new RegExp("fog", "i");
  const mist = new RegExp("mist", "i");

  const snow = new RegExp("snow", "i");
  const blizzard = new RegExp("blizzard", "i");

  found = false;
  if (storm.test(text)) {
    found = true;
    return "tsra";
  } else if (snow.test(text) || blizzard.test(text)) {
    found = true;
    return "sn";
  } else if (fog.test(text) || mist.test(text)) {
    found = true;
    return "fg";
  } else if (rain.test(text) || shower.test(text)) {
    found = true;
    return "shra";
  } else if (cloudy.test(text)) {
    return "bkn";
  } else if (sunny.test(text) || clear.test(text)) {
    return "few";
  }
  if (!found) {
    return "NA";
  } else {
    alert("getIcon: error");
  }
}

function getIconHTML(textDescription, isDaytime) {
  let iconHTML, iconName;
  iconName = getIcon(textDescription);
  if (iconName === "NA") {
    iconHTML = `<img alt="See Text Forecast" />`;
  } else if (isDaytime) {
    iconHTML = `<img alt="See Text Forecast" src="media/day/${iconName}.png" />`;
  } else {
    iconHTML = `<img alt="See Text Forecast" src="media/night/n${iconName}.png" /> `;
  }
  return iconHTML;
}

async function detailedFunction() {
  /* Main function for detailed.html */
  // Number of days + nights forecast will go to
  const FORENUM = 6;
  // Getting params
  let params, display_name, lat, lon;
  params = window.location.href.split("?")[1];
  params = params.split("&");
  display_name = decodeURIComponent(params[0].substring(5));
  lat = parseFloat(decodeURIComponent(params[1].substring(4)));
  lon = parseFloat(decodeURIComponent(params[2].substring(4)));
  // Displaying location
  document.getElementById("title").innerHTML = display_name;
  // Getting NWS data
  let points, pointsURL, forecastURL, hourlyForecastURL, forecast, hourlyForecast;
  pointsURL = `https://api.weather.gov/points/${lat},${lon}`;
  await getJSONFromURL(pointsURL);
  points = window.json_response;
  forecastURL = points.properties.forecast;
  hourlyForecastURL = points.properties.forecastHourly;
  await getJSONFromURL(forecastURL);
  forecast = window.json_response.properties.periods;
  await getJSONFromURL(hourlyForecastURL);
  hourlyForecast = window.json_response.properties.periods;
  // Displaying Detailed Forecasts
  let i, j, detailedL, iconHTML, outputP;
  detailedL = document.getElementById("detailed");
  for (i=0; i<FORENUM; i++) {
    outputP = "";
    outputP += `${forecast[i].name}<br />`;
    iconHTML = getIconHTML(forecast[i].shortForecast, forecast[i].isDaytime);
    iconHTML += `<br />`;
    outputP += iconHTML;
    outputP += forecast[i].detailedForecast;
    outputP += `<br />`;
    detailedL.innerHTML += `<p>${outputP}</p>`;
  }
  // Displaying Hourly Forecasts for next 24 hours
  let hourlyL, eachForecast, fTime, readableTime, hourlyLi;
  hourlyL = document.getElementById("hourly");
  for (j=0; j<24; j++) {
    eachForecast = hourlyForecast[j];
    fTime = Date.parse(eachForecast.startTime);
    readableTime = new Date();
    readableTime.setTime(fTime);
    iconHTML = getIconHTML(eachForecast.shortForecast, eachForecast.isDaytime);
    hourlyLi = `<li>${readableTime.getHours()}:00<br />${iconHTML}<br />${eachForecast.temperature}&deg;${eachForecast.temperatureUnit}<br />${eachForecast.shortForecast}</li>`;
    hourlyL.innerHTML += hourlyLi;
  }
  // End
  document.getElementById("loading").style = "display: none;";
}

async function forecastFunction() {
  /* Main function for forecast.html */
  // Number of days + nights forecast will go to
  const FORENUM = 6;
  // Getting params
  let params, display_name, lat, lon;
  params = window.location.href.split("?")[1];
  params = params.split("&");
  display_name = decodeURIComponent(params[0].substring(5));
  lat = parseFloat(decodeURIComponent(params[1].substring(4)));
  lon = parseFloat(decodeURIComponent(params[2].substring(4)));
  // Displaying location
  document.getElementById("title").innerHTML = display_name;
  // Getting NWS data
  let points, pointsURL;
  pointsURL = `https://api.weather.gov/points/${lat},${lon}`;
  await getJSONFromURL(pointsURL);
  points = window.json_response;
  let forecastURL, stationsURL, radarStation, county, wfo;
  wfo = points.properties.cwa;
  forecastURL = points.properties.forecast;
  radarStation = points.properties.radarStation;
  county = points.properties.county;
  stationsURL = points.properties.observationStations;
  county = county.split("/");
  county = county[county.length-1];
  // Getting NWS alerts for that county
  let i, alert, alerts, alertsURL, alertText, alertList, alertListItem;
  alertsURL = `https://api.weather.gov/alerts/active/zone/${county}`;
  await getJSONFromURL(alertsURL);
  alerts = window.json_response.features;
  alertList = document.getElementById("alerts");
  for (i=0; i<alerts.length; i++) {
    alert = alerts[i].properties;
    alertListItem = document.createElement("li");
    alertText = alert.description + "\n\nNECESSARY ACTIONS\n\n" + alert.instruction;
    alertListItem.innerHTML = `<button class="collapsible" onclick="toggle(${i})">${alert.headline}</button><pre id="alert${i}" style="display: none">${alertText}</pre>`;
    alertList.appendChild(alertListItem);
  }
  // Finding nearest weather station
  let station, stationURL, stationName;
  await getJSONFromURL(stationsURL);
  stationURL = window.json_response.observationStations[0];
  station = stationURL.substring(stationURL.length-4);
  // Get weather from weather station
  let observation, obsTime, readableObsTime;
  let tempC, tempF, dewPointC, dewPointF;
  await getJSONFromURL(stationURL);
  stationName = window.json_response.properties.name;
  await getJSONFromURL(`${stationURL}/observations/latest`);
  observation = window.json_response.properties;
  obsTime = Date.parse(observation.timestamp);
  readableObsTime = new Date();
  readableObsTime.setTime(obsTime);
  tempC = observation.temperature.value;
  tempF = tempC*(9/5) + 32;
  dewPointC = observation.dewpoint.value;
  dewPointF = dewPointC*(9/5) + 32;
  // Dealing with wind is annoying
  let windSpeedKm, windSpeedMi, windAngle, windKey, windDir, angleToDir;
  windAngle = observation.windDirection.value;
  angleToDir = {
    0: "North",
    1: "North-Northeast",
    2: "Northeast",
    3: "East-Northeast",
    4: "East",
    5: "East-Southeast",
    6: "Southeast",
    7: "South-Southeast",
    8: "South",
    9: "South-Southwest",
    10: "Southwest",
    11: "West-Southwest",
    12: "West",
    13: "West-Northwest",
    14: "Northwest",
    15: "North-Northwest"
  }
  windKey = Math.floor((windAngle%360)/22.5); // 0 for N, 1 for NNW, etc.
  windDir = angleToDir[windKey];
  windSpeedKm = observation.windSpeed.value;
  windSpeedMi = windSpeedKm*100000*(1/2.54)*(1/12)*(1/5280);
  // Display weather from weather station
  let current;
  current = document.getElementById("current");
  current.innerHTML = `<strong><a href="https://tgftp.nws.noaa.gov/data/observations/metar/decoded/${station}.TXT">Current Observation</a></strong><br />`;
  current.innerHTML += `Station: ${stationName}<br />`;
  current.innerHTML += `Updated at: ${readableObsTime.toString()}<br />`;
  current.innerHTML += `<strong>Temperature: ${tempF}&deg;F (${tempC}&deg;C)</strong><br />`;
  current.innerHTML += `Sky Conditions: ${observation.textDescription}<br />`;
  current.innerHTML += `Wind: From the ${windDir} at ${Math.round(windSpeedMi)} MPH (${Math.round(windSpeedKm)} KPH)<br />`;
  current.innerHTML += `Dew Point: ${dewPointF}&deg;F (${dewPointC}&deg;C)<br />`;
  current.innerHTML += `Relative Humidity: ${Math.round(observation.relativeHumidity.value)}%<br />`;
  current.innerHTML += `Pressure: ${observation.barometricPressure.value/100} mbar<br />`;
  current.innerHTML += "</p>";
  // Getting forecast
  let foreL, forecast;
  await getJSONFromURL(forecastURL);
  foreL = document.getElementById("basic");
  forecast = window.json_response.properties.periods;
  for(i=0; i<FORENUM; i++) {
    foreL.innerHTML += `<li>${forecast[i].name} `;
    foreL.innerHTML += getIconHTML(forecast[i].shortForecast, forecast[i].isDaytime);
    foreL.innerHTML += "<br />";
    foreL.innerHTML += forecast[i].shortForecast;
    foreL.innerHTML += "<br />";
    foreL.innerHTML += `Temperature: ${forecast[i].temperature}&deg;${forecast[i].temperatureUnit}`;
    foreL.innerHTML += "</li>";
  }
  // Detailed forecast
  let detailedURL, detailedP;
  detailedURL = `detailed.html?name=${display_name}&lat=${lat}&lon=${lon}`;
  detailedP = document.getElementById("detailed");
  detailedP.innerHTML = `<a href="${detailedURL}">Detailed and Hourly Forecast</a>`;
  // Scientist's Forecast
  let scientist;
  scientist = document.getElementById("scientist");
  scientist.innerHTML += `<a href="https://radar.weather.gov/standard/${radarStation}">Radar</a><br />`;
  scientist.innerHTML += '<a href="https://www.star.nesdis.noaa.gov/GOES/index.php">Satellite</a><br />';
  scientist.innerHTML += '<a href="https://digital.weather.gov/">Graphical Forecast</a><br />';
  scientist.innerHTML += '<br />';
  scientist.innerHTML += `<a href="https://weather.gov/${wfo}">Your Forecast Office</a><br />`;
  scientist.innerHTML += '<a href="https://www.nhc.noaa.gov/">Hurricanes</a><br />';
  scientist.innerHTML += '<a href="https://www.spc.noaa.gov/">Severe Storms</a><br />';
  scientist.innerHTML += '<a href="https://www.swpc.noaa.gov/">Space Weather</a><br />';
  // End
  document.getElementById("loading").style = "display: none;";
}

/* Setting variables in both index.html and forecast.html */

let pathname, startpath;
startpath = "/weather";
pathname = window.location.pathname;

/* Main code for index.html */

if ((pathname === startpath+"/") || (pathname === startpath+"/index.html")) {
  let len, i, key, value, locList, locListItem, foreArray;
  len = localStorage.length;
  locList = document.getElementById("savedLocations");
  for (i=0; i<len; i++) {
    key = localStorage.key(i);
    value = localStorage.getItem(key);
    value = value.split(",");
    foreArray = ["'"+key+"'", value[0], value[1]];
    locListItem = document.createElement("li");
    locListItem.innerHTML = `<input type="button" value="${key}" onclick="forecastFromArray([${foreArray}])" />`;
    locList.appendChild(locListItem);
  }
}

/* Main code for forecast.html */

if (pathname === startpath + "/forecast.html") {
  window.onload = forecastFunction;
}

/* Main code for detailed.html */

if (pathname === startpath + "/detailed.html") {
  window.onload = detailedFunction;
}
