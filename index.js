const userLocation = document.getElementById("userLocation"),
converter=document.getElementById("converter"),
weatherIcon=document.querySelector(".weatherIcon"),
temperature=document.querySelector(".temperature"),
feelsLike=document.querySelector(".feelsLike"),
description=document.querySelector(".description"),
date=document.querySelector(".date"),
city=document.querySelector(".city"),
HValue=document.getElementById("HValue"),
WValue=document.getElementById("WValue"),
SRValue=document.getElementById("SRValue"),
SSValue=document.getElementById("SSValue"),
CValue=document.getElementById("CValue"),
MTValue=document.getElementById("MTValue"),
PValue=document.getElementById("PValue"),
Forecast=document.querySelector(".Forecast");
/*Drop down functionality */
const recentCitiesDropdown = document.getElementById("recentCities");

function updateRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.includes(city)) {
    cities.push(city);
    // Limit to 5
    if (cities.length > 5) cities.shift(); 
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }

  renderRecentCitiesDropdown();
}

function renderRecentCitiesDropdown() {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (cities.length === 0) {
    recentCitiesDropdown.style.display = "none";
    return;
  }

  recentCitiesDropdown.style.display = "block";
  recentCitiesDropdown.innerHTML = `<option disabled selected>Recent Searches</option>`;
  cities.forEach(city => {
    let option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// Load dropdown when page loads
document.addEventListener("DOMContentLoaded", renderRecentCitiesDropdown);

// On dropdown change
recentCitiesDropdown.addEventListener("change", function () {
  userLocation.value = this.value;
  findUserLocation();
});


/*Linking the Weather Api and Date */
WEATHER_API_ENDPOINT="https://api.openweathermap.org/data/2.5/weather?appid=21c8502aa9542f2d5be33153b1ec3f80&q=";
WEATHER_DATE_ENDPOINT=`https://api.openweathermap.org/data/2.5/forecast?appid=21c8502aa9542f2d5be33153b1ec3f80&units=metric&`;
 /*Use my current location functionality*/
document.getElementById("currentLocationBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      Forecast.innerHTML = "";
      fetch(`https://api.openweathermap.org/data/2.5/weather?appid=21c8502aa9542f2d5be33153b1ec3f80&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
          userLocation.value = data.name;
          findUserLocation(); // fetch forecast as well
        });
        }, () => {
          alert("Geolocation permission denied.");
        });
      } else {
        alert("Geolocation not supported.");
      }
});

/*Connecting the Weather Api endpoint */
function findUserLocation(){
  /*Handling empty input */
  const cityInput = userLocation.value.trim();

  if (cityInput === "") {
    alert("Please enter a city name.");
    return;
  }

 

  recentCitiesDropdown.style.display = "none";
  Forecast.innerHTML="";
  fetch(WEATHER_API_ENDPOINT+ userLocation.value)
  .then((response)=>response.json())
  .then((data) => {
    if(data.cod!='' && data.cod!=200){
      alert("City not found. Please enter a valid city name.");
      return;
    }
    console.log(data);
     

    city.innerHTML=data.name+", "+data.sys.country;
    
    updateRecentCities(data.name);

    //  Hides dropdown after selection
    recentCitiesDropdown.addEventListener("change", function () {
    userLocation.value = this.value;
    findUserLocation();
    recentCitiesDropdown.style.display = "none"; 
});
/*Linking the weather icons */
    weatherIcon.style.background=`url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`
/*Connecting the Weather date endpoint */
// Display date/time from weather data's dt + timezone
 const timezoneOffset = data.timezone; 
      const options1 = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
      
          date.innerHTML = getLongFormateDateTime(data.dt, timezoneOffset, {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
      });
// Display sunrise/sunset from weather.
          SRValue.innerHTML = getLongFormateDateTime(
            data.sys.sunrise,
            timezoneOffset,
            options1
      );
          SSValue.innerHTML = getLongFormateDateTime(
            data.sys.sunset,
            timezoneOffset,
            options1
      );  
   fetch(
    WEATHER_DATE_ENDPOINT + `lon=${data.coord.lon}&lat=${data.coord.lat}`
  )
        .then(response => response.json())
        .then((data) => {
          console.log(data);
/*Adding js to the weather input */
          HValue.innerHTML = data.list[0].main.humidity + "<span>%</span>";
          WValue.innerHTML = data.list[0].wind.speed + "<span> m/s</span>";
          temperature.innerHTML=TempConverter(data.list[0].main.temp);
          feelsLike.innerHTML="Feels like " + data.list[0].main.feels_like;
          description.innerHTML=`<i class="fa-brands fa-cloudversify"></i>&nbsp;`+data.list[0].weather[0].description;
/*Adding js to the weather output */ 
         CValue.innerHTML = data.list[0].clouds.all + "<span>%</span>";
          MTValue.innerHTML = data.list[0].main.temp_min + "<span></span>";
          PValue.innerHTML = data.list[0].main.pressure + "<span>hpa</span>";
          
/*Extended Forecast*/ 
         
      const options = {
        weekday: 'short',
        month: 'long',
        day: 'numeric'
      };

      // Group data.list items by date string
      const dailyData = {};

      data.list.forEach(weather => {
        // Get date string without time part
        let dateStr = getLongFormateDateTime(weather.dt, 0, options).replace(/ at .*/, "");

        // Only keep one entry per day (first occurrence)
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = weather;
        }
      });

      // Now create divs for each day
      Object.keys(dailyData).forEach(dateStr => {
        const weather = dailyData[dateStr];
        let div = document.createElement("div");

        div.innerHTML = `<p class="dateStr">${dateStr}</p>`;
        div.innerHTML += `<img class="week-img"src="https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png"/>`;
        div.innerHTML += `<p class="forecast-desc">${weather.weather[0].description}</p>`;
        div.innerHTML += `<span class="temp-min">${TempConverter(weather.main.temp_max)}</span>`;
        Forecast.append(div);
        div.innerHTML+=`<p class="forecast-wind">${weather.wind.speed}m/s</p>`
        div.innerHTML+=`<p class="forecast-humidity">${weather.main.humidity}%</p>`
        });

        }); 
    });
  }

function formatUnixTime(dtValue, offSet, options={}){
const date=new Date((dtValue + offSet)*1000);
return date.toLocaleTimeString([],{timeZone:"UTC",...options});

}
function getLongFormateDateTime(dtValue, offSet, options){
  return formatUnixTime(dtValue, offSet, options)
}

/*Adding celsius and fahrenheit vlaue */
 function TempConverter(temp){
  let tempValue=Math.round(temp);
  let message="";
  if(converter.value=="C"){
    message=tempValue+"<span>"+"\xB0C</span>"
  }else{
    let ctof=(tempValue*9)/5+32;
    message=ctof+"<span>"+"\xB0F</span>"
  }
  return message;
 };



