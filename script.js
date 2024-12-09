/* Global variables */

window.json_response = {};
window.allSettings = ["firstPage"];
window.defaultSettings = {
  firstPage: "index"
};

/* Functions */

async function getJSONFromURL(URL) {
  /* Puts JSON from URL into window.json_response */
  await fetch(URL).then((response) => {
    return (response.ok ? response.json() : alert(`Error: Could not get ${URL}`));
  }).then((data) => {
    window.json_response = data;
  });
}

function setCookie(name, value) {
  /* Sets cookie with name=value that expires in 1 year. */
  document.cookie = `${name}=${value};samesite=strict;max-age=31536000`;
}

function updateSettings() {
  /* Updates user settings from settings page */
  let i, h, settingOptions, setting;
  allSettings = window.allSettings;
  for (h=0; h<allSettings.length; h++) {
    settingOptions = document.getElementsByName(allSettings[h]);
    for (i=0; i<settingOptions.length; i++) {
      if (settingOptions[i].checked) {
        setting = settingOptions[i].value;
      }
    }
    setCookie(allSettings[h], setting);
  }
}

function getSettings() {
  /* Get user settings */
  let i, j, settingArray, settingMap, eachSetting;
  settingArray = document.cookie.split(";");
  settingMap = new Map();
  for (i=0; i<settingArray.length; i++) {
    eachSetting = settingArray[i].trim().split("=");
    settingMap.set(eachSetting[0], eachSetting[1]);
  }
  if ((i < window.allSettings.length) || (document.cookie === "")) {
    /* User hasn't updated settings yet or has deleted a cookie
       In this case, use the default settings */
    let keys, key;
    keys = Array.from(settingMap.keys());
    for (j=0; j<window.allSettings.length; j++) {
      key = window.allSettings[j]
      if (!(keys.includes(key))) {
        settingMap.set(key, window.defaultSettings[key]);
      }
    }
  }
  return settingMap;
}

function forecastPage(name, lat, lon) {
  window.location = `forecast.html?name=${name}&lat=${lat}&lon=${lon}`;
}

function setToPreferred(location) {
  // Sets location to the preferred one
  let i, len, key, value;
  len = localStorage.length;
  for (i=0; i<len; i++) {
    key = localStorage.key(i);
    value = localStorage.getItem(key);
    value = value.split(",");
    if (key === location) {
      // The 1 indicates if this was the last location looked at
      localStorage.setItem(key, `${value[0]},${value[1]},1`);
    } else {
      localStorage.setItem(key, `${value[0]},${value[1]}`);
    }
  }
}

function forecastFromArray(arr) {
  setToPreferred(arr[0]); // Last location viewed
  forecastPage(arr[0], arr[1], arr[2]);
}

function saveLocation(location, lat, lon) {
  localStorage.setItem(location, `${lat},${lon}`);
  setToPreferred(location); // Last location viewed
}

async function geocode() {
  /* Gets location and takes you to that location */
  let location, URL, request, resp
  const notblank = /\S/;
  location = document.getElementById("location").value;
  if (notblank.test(location)) {
    URL = `https://nominatim.openstreetmap.org/search?q=${location}, United States&format=json`;
    await getJSONFromURL(URL);
    resp = window.json_response;
    resp = resp[0];
    saveLocation(location, resp.lat, resp.lon);
    forecastPage(resp.display_name, resp.lat, resp.lon);
  } else {
    ; // Do nothing
  }
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

  const haze = new RegExp("haze", "i");

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
  } else if (haze.test(text)) {
    return "hz";
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
  let i, j, detailedT, iconHTML, outputP;
  detailedT = document.getElementById("detailed");
  for (i=0; i<FORENUM; i++) {
    outputP = "";
    outputP += `<td>${forecast[i].name}<br />`;
    iconHTML = getIconHTML(forecast[i].shortForecast, forecast[i].isDaytime);
    outputP += iconHTML;
    outputP += `</td><td>`
    outputP += forecast[i].detailedForecast;
    outputP += `<br />`;
    outputP += `Temperature: ${forecast[i].temperature}&deg;${forecast[i].temperatureUnit}`;
    detailedT.innerHTML += `<tr>${outputP}</tr>`;
  }
  // Displaying Hourly Forecasts for next 24 hours
  let hourlyT, eachForecast, fTime, readableTime, hourlyTr;
  hourlyT = document.getElementById("hourly");
  for (j=0; j<24; j++) {
    eachForecast = hourlyForecast[j];
    fTime = Date.parse(eachForecast.startTime);
    readableTime = new Date();
    readableTime.setTime(fTime);
    iconHTML = getIconHTML(eachForecast.shortForecast, eachForecast.isDaytime);
    hourlyTr = `<tr><td>${readableTime.getHours()}:00<br />${iconHTML}</td><td>${eachForecast.temperature}&deg;${eachForecast.temperatureUnit}<br />${eachForecast.shortForecast}</td></tr>`;
    hourlyT.innerHTML += hourlyTr;
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
  if (tempC === null) {
    tempF = "Unavailable";
    tempC = "Unavailable";
  } else {
    tempF = tempC*(9/5) + 32;
    tempF = Math.round(tempF);
  }
  dewPointC = observation.dewpoint.value;
  if (dewPointC === null) {
    dewPointF = "Unavailable";
    dewPointC = "Unavailable";
  } else {
    dewPointF = dewPointC*(9/5) + 32;
    dewPointF = Math.round(dewPointF);
  }
  // Dealing with wind is annoying
  let windSpeedKm, windSpeedMi, windAngle, windKey, windDir, angleToDir;
  let relativeHumidity, barometricPressure;
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
  if (windAngle === null) {
    windDir = "Unavailable";
  } else {
    windKey = Math.floor((windAngle%360)/22.5); // 0 for N, 1 for NNW, etc.
    windDir = angleToDir[windKey];
  }
  windSpeedKm = observation.windSpeed.value;
  if (windSpeedKm === null) {
    windSpeedMi = "Unavailable";
    windSpeedKm = "Unavailable";
  } else {
    windSpeedMi = windSpeedKm*100000*(1/2.54)*(1/12)*(1/5280);
    windSpeedMi = Math.round(windSpeedMi);
    windSpeedKm = Math.round(windSpeedKm);
  }
  if (observation.relativeHumidity.value === null) {
    relativeHumidity = "Unavailable";
  } else {
    relativeHumidity = Math.round(observation.relativeHumidity.value);
  }
  if (observation.barometricPressure.value === null) {
    barometricPressure = "Unavailable";
  } else {
    barometricPressure = observation.barometricPressure.value/100;
  }
  // Display weather from weather station
  let current;
  current = document.getElementById("current");
  current.innerHTML = `<strong style="text-decoration: underline"><a href="https://tgftp.nws.noaa.gov/data/observations/metar/decoded/${station}.TXT">Current Observation</a></strong><br />`;
  current.innerHTML += `Sky Conditions: ${observation.textDescription}<br />`;
  current.innerHTML += `Temperature: ${tempF}&deg;F (${tempC}&deg;C)<br />`;
  current.innerHTML += `Wind: From the ${windDir} at ${windSpeedMi} MPH (${windSpeedKm} KPH)<br />`;
  current.innerHTML += `Dew Point: ${dewPointF}&deg;F (${dewPointC}&deg;C)<br />`;
  current.innerHTML += `Relative Humidity: ${relativeHumidity}%<br />`;
  current.innerHTML += `Pressure: ${barometricPressure} mbar<br />`;
  current.innerHTML += `<br />`;
  current.innerHTML += `Station: ${stationName}<br />`;
  // Use Intl.DateTimeFormat if we call toLocaleString() many times
  current.innerHTML += `Updated at: ${readableObsTime.toLocaleString()}<br />`;
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
  scientist.innerHTML += '<a href="https://www.swpc.noaa.gov/">Space Weather and Auroras</a><br />';
  // Astronomical Data Link
  // U.S. Navy, "Rise, Set, and Twilight Definitions", https://aa.usno.navy.mil/faq/RST_defs
  // https://aa.usno.navy.mil/calculated/rstt/oneday?date=2024-06-30&lat=71&lon=-156&label=Yahoo&tz=5&tz_sign=1&tz_label=true&dst=false
  let astroLink, now, dateString, timeZone, tzSign, tzString;
  now = new Date();
  dateString = now.toISOString().substring(0, 10);
   // sign of Date's timezone is timezone-UTC
  tzSign = -Math.sign(now.getTimezoneOffset());
  timeZone = Math.abs(now.getTimezoneOffset())/60;
  tzString = `tz=${timeZone}&tz_sign=${tzSign}&tz_label=false&dst=false`;
  astroLink = `https://aa.usno.navy.mil/calculated/rstt/oneday?date=${dateString}&lat=${lat}&lon=${lon}&label=${display_name}&${tzString}`;
  scientist.innerHTML += `<a href="${astroLink}">Sun and Moon</a><br />`;
  // End
  document.getElementById("loading").style = "display: none;";
}

/* Setting variables in both index.html and forecast.html */

let pathname, startpath;
startpath = "/weather";
pathname = window.location.pathname;

/* Main code for index.html */

if ((pathname === startpath+"/") || (pathname === startpath+"/index.html")) {
  let len, i, key, value, locList, locListItem, foreArray, settingsMap;
  len = localStorage.length;
  /* Check settings if we're opening the weather app */
  if (!(window.location.href.endsWith("#"))) {
    settingsMap = getSettings();
    if (settingsMap.get("firstPage") === "last") {
      for (i=0; i<len; i++) {
        key = localStorage.key(i);
        value = localStorage.getItem(key);
        value = value.split(",");
        if (value.length === 3) {
          // Location is preffered, go there
          forecastPage(key, value[0], value[1]);
        }
      }
    }
  }
  /* Show locations */
  locList = document.getElementById("savedLocations");
  for (i=0; i<len; i++) {
    key = localStorage.key(i);
    value = localStorage.getItem(key);
    value = value.split(",");
    foreArray = ["'"+key+"'", value[0], value[1]];
    locListItem = document.createElement("li");
    locListItem.innerHTML = `<input type="button" value="${key}" onclick="forecastFromArray([${foreArray}])" />`;
    locListItem.innerHTML += ` <input type="button" value="X" onclick="window.localStorage.removeItem('${key}'); location.reload();">`;
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

/* Main code for settings.html */

if (pathname === startpath + "/settings.html") {
  let settingsMap;
  settingsMap = getSettings();
  /* Set buttons according to settings */
  let i, j, key, radios;
  for (i=0; i<window.allSettings.length; i++) {
    key = window.allSettings[i];
    radios = document.getElementsByName(key);
    for (j=0; j<radios.length; j++) {
      if (radios[j].value === settingsMap.get(key)) {
        radios[j].checked = true;
      }
    }
  }
  updateSettings();
}
