"use strict";
// weatherAPI = `https://api.weatherstack.com/current?access_key=YOUR_ACCESS_KEY&query=New York`;
// weatherAPI_key = "b51ed73230cd6ab71fb0d6128a60695c";
// countries_API = "https://restcountries.com/v3.1/all";
// citiesName_API = "https://countriesnow.space/api/v0.1/countries/cities";
// reverseGeoCodeKey = plwPIIjrvMVbWGLM9rwRqK7YHoS5WvAt
const body = document.querySelector("body");
const countryTextbox = document.querySelector(".searchCountries");
const countryDropDown = document.querySelector("#countryDropDown");
const countriesName = document.querySelectorAll(".countryLI");
const cityTextbox = document.querySelector(".searchCity");
const cityDropDown = document.querySelector("#cityDropDown");
const citiesName = document.querySelectorAll(".cityLI");
const temperature = document.querySelector("#temperature");
const weatherName = document.querySelector("#weatherName");
const placeName = document.querySelector("#placeName");
const weatherImage = document.querySelector(".weatherImgDiv");
const weatherPropertiesImgs = document.querySelectorAll(".weatherPropertyImgs");
const feelsLike = document.querySelector(".feelsLike");
const humidity = document.querySelector(".humidity");
const windSpeed = document.querySelector(".windSpeed");
let countriesList, cityList, countryName, cityName;

(function getUserLcocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const resp = await fetch(
        `https://api.tomtom.com/search/2/reverseGeocode/${coords.latitude},${coords.longitude}.json?key=plwPIIjrvMVbWGLM9rwRqK7YHoS5WvAt&radius=100`
      );
      const { addresses } = await resp.json();
      const { municipalitySubdivision, municipality, country } =
        addresses[0].address;

      getWeather(country, municipalitySubdivision || municipality);
    });
  }
})();

const fetchCountries = async () => {
  const resp = await fetch("https://restcountries.com/v3.1/all");
  const data = await resp.json();
  countriesList = data.map((el) => el.name.common);

  countriesList.forEach((country) => {
    const paragraph = `<p class='countryLI'>${country}</p>`;
    countryDropDown.insertAdjacentHTML("afterbegin", paragraph);
  });
};

fetchCountries();

body.addEventListener("click", () => {
  countryDropDown.className = "hideCountryList";
  countriesName.forEach((el) => (el.className = "hideLI"));
  cityDropDown.className = "hideCityList";
  citiesName.forEach((el) => (el.classname = "hideLI"));
});

countryTextbox.addEventListener("click", (event) => {
  event.stopPropagation();
  countryDropDown.className = "showCountryDropDown";
  countriesName.forEach((el) => {
    el.classList.remove("hideLI");
  });
});

cityTextbox.addEventListener("click", (event) => {
  event.stopPropagation();
  cityDropDown.className = "showCountryDropDown";
  citiesName.forEach((el) => {
    el.classList.remove("hideLI");
  });
});

countryDropDown.addEventListener("click", async (event) => {
  event.stopPropagation();
  countryName = event.target.innerHTML;
  countryTextbox.value = countryName;

  while (cityDropDown.firstChild) {
    cityDropDown.removeChild(cityDropDown.firstChild);
  }

  cityTextbox.value = "";

  cityDropDown.insertAdjacentHTML(
    "afterbegin",
    `<p class='cityLI'>Loading...</p>`
  );

  const resp = await fetch(
    `https://countriesnow.space/api/v0.1/countries/cities`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName })
    }
  );

  if (resp.status >= 400 && resp.status <= 599) {
    while (cityDropDown.firstChild) {
      cityDropDown.removeChild(cityDropDown.firstChild);
    }

    cityDropDown.insertAdjacentHTML(
      "afterbegin",
      `<p class='cityLI'>No city is available!</p>`
    );
    return;
  }

  const { data } = await resp.json();
  cityList = data;

  data?.forEach((city) => {
    cityDropDown.insertAdjacentHTML(
      "afterbegin",
      `<p class='cityLI'>${city}</p>`
    );
  });
});

cityDropDown.addEventListener("click", async (event) => {
  event.stopPropagation();
  cityName = event.target.innerHTML;
  cityTextbox.value = cityName;

  if (
    !countryTextbox.value ||
    !cityTextbox.value ||
    cityTextbox.value === "Please select country" ||
    cityTextbox.value === "Loading..."
  ) {
    return;
  }

  getWeather(countryName, cityName);
});

countryDropDown.addEventListener("mouseleave", () => {
  countryDropDown.className = "hideCountryList";
  countriesName.forEach((el) => (el.className = "hideLI"));
});

cityDropDown.addEventListener("mouseleave", () => {
  cityDropDown.className = "hideCityList";
  citiesName.forEach((el) => (el.classname = "hideLI"));
});

countryTextbox.addEventListener("keyup", (event) => {
  while (countryDropDown.firstChild) {
    countryDropDown.removeChild(countryDropDown.firstChild);
  }

  if (!countryTextbox.value) {
    while (cityDropDown.firstChild) {
      cityDropDown.removeChild(cityDropDown.firstChild);
    }

    cityDropDown.insertAdjacentHTML(
      "afterbegin",
      `<p class='cityLI'>Please select country</p>`
    );
  }

  countriesList.forEach((country) => {
    if (country.toLowerCase().includes(event.target.value.toLowerCase())) {
      countryDropDown.insertAdjacentHTML(
        "afterbegin",
        `<p class='countryLI'>${country}</p>`
      );
    }
  });
});

cityTextbox.addEventListener("keyup", (event) => {
  while (cityDropDown.firstChild) {
    cityDropDown.removeChild(cityDropDown.firstChild);
  }

  cityList?.forEach((city) => {
    if (city.toLowerCase().includes(event.target.value.toLowerCase())) {
      cityDropDown.insertAdjacentHTML(
        "afterbegin",
        `<p class='cityLI'>${city}</p>`
      );
    }
  });
});

const getWeather = async (country, city) => {
  const resp = await fetch(
    `http://api.weatherstack.com/current?access_key=b51ed73230cd6ab71fb0d6128a60695c&query=${city},${country}`
  );

  if (resp.status >= 400 && resp.status <= 599) {
    temperature.textContent = "No data available!";
    return;
  }

  const data = await resp.json();
  const { current } = data;

  if (weatherImage?.lastElementChild?.tagName)
    weatherImage.removeChild(weatherImage.lastElementChild);

  weatherPropertiesImgs.forEach((el) => {
    if (el.lastElementChild.tagName === "SPAN") {
      el.removeChild(el.lastElementChild);
    }
  });

  temperature.innerHTML = `Temperature: ${current.temperature} <sup>°C</sup>`;
  weatherName.textContent = current.weather_descriptions[0];

  const weather = current.weather_descriptions[0]
    .split(" ")
    .join("")
    .toLowerCase();

  if (["overcast", "cloudy"].includes(weather)) {
    weatherImage.insertAdjacentHTML(
      "afterbegin",
      `<img
            src="./images/Cloudy.gif"
            class="weatherMainImg"
            alt="weather image"
          />`
    );
  } else if (["smoge", "haze", "mist", "smoke"].includes(weather)) {
    weatherImage.insertAdjacentHTML(
      "afterbegin",
      `<img
            src="./images/smoge.gif"
            class="weatherMainImg"
            alt="weather image"
          />`
    );
  } else if (["partlycloudy", "partlysunny"].includes(weather)) {
    weatherImage.insertAdjacentHTML(
      "afterbegin",
      `<img
            src="./images/partlyCloudy.gif"
            class="weatherMainImg"
            alt="weather image"
          />`
    );
  } else if (["sunny", "clear"].includes(weather)) {
    weatherImage.insertAdjacentHTML(
      "afterbegin",
      `<img
            src="./images/sunny.gif"
            class="weatherMainImg"
            alt="weather image"
          />`
    );
  } else if (
    ["rain", "thunderstorm", "lightrain", "patchyrainpossible"].includes(
      weather
    )
  ) {
    weatherImage.insertAdjacentHTML(
      "afterbegin",
      `<img src="./images/rainy.gif" class="weatherMainImg" alt="weather image" />`
    );
  } else if (
    ["snow", "lightsnow", "heavysnow", "freezingfog"].includes(weather)
  ) {
    weatherImage.insertAdjacentHTML(
      "afterbegin",
      `<img src="./images/snow.gif" class="weatherMainImg" alt="weather image" />`
    );
  }

  placeName.textContent = `${country}, ${city}`;

  windSpeed.insertAdjacentHTML(
    "beforeend",
    `<span>Wind Speed: ${current.wind_speed} km/h</span>`
  );

  humidity.insertAdjacentHTML(
    "beforeend",
    `<span>Humidity: ${current.humidity}%</span>`
  );

  feelsLike.insertAdjacentHTML(
    "beforeend",
    `<span>Feels Like: ${current.feelslike} <sup>°C</sup></span>`
  );
};
