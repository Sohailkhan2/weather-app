
const userTab = document.querySelector("[data-UserWheather]");
const searchTab = document.querySelector("[data-SearchWheather]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const searchInput = document.querySelector("[data-searchInput]");
const grantAccessButton = document.querySelector("[data-grantAccess]");

// 🔹 Weather Info Elements
const cityName = document.querySelector("[data-city]");
const countryIcon = document.querySelector("[data-countryIcon]");
const weatherDesc = document.querySelector("[data-weatherDesc]");
const weatherIcon = document.querySelector("[data-weatherIcon]");
const temperature = document.querySelector("[data-temp]");
const windspeed = document.querySelector("[data-windspeed]");
const humidity = document.querySelector("[data-humidity]");
const cloudiness = document.querySelector("[data-cloudiness]");

//  API Key
const apiKey = "9b3c87d77991a8dac7d435424d40ed42";
let oldTab = userTab;
oldTab.classList.add("current-tab");

//  Function to Switch Tabs
function switchTab(clickedTab) {
    if (clickedTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = clickedTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

//  Event Listeners for Tabs
userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

//  Function to Check Local Storage for Coordinates
function getFromSessionStorage() {
    const storedCoordinates = sessionStorage.getItem("user-coordinates");
    if (!storedCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(storedCoordinates);
        fetchWeatherData(coordinates.lat, coordinates.lon);
    }
}

//  Function to Get User's Location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coordinates = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                sessionStorage.setItem("user-coordinates", JSON.stringify(coordinates));
                fetchWeatherData(coordinates.lat, coordinates.lon);
            },
            () => {
                alert("Location access denied. Please allow location access.");
            }
        );
    } else {
        alert("Geolocation not supported in this browser.");
    }
}

//  Event Listener for Grant Access Button
grantAccessButton.addEventListener("click", getLocation);

//  Function to Fetch Weather Data
async function fetchWeatherData(lat, lon) {
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        showWeatherData(data);
    } catch (error) {
        alert("Error fetching weather data. Please try again.");
    } finally {
        loadingScreen.classList.remove("active");
    }
}

//  Function to Display Weather Data
function showWeatherData(data) {
    userInfoContainer.classList.add("active");

    cityName.textContent = data.name;
    countryIcon.src = `https://flagcdn.com/w40/${data.sys.country.toLowerCase()}.png`;
    weatherDesc.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    temperature.textContent = `${data.main.temp.toFixed(1)} °C`;
    windspeed.textContent = `${data.wind.speed} m/s`;
    humidity.textContent = `${data.main.humidity} %`;
    cloudiness.textContent = `${data.clouds.all} %`;
}

//  Event Listener for Search Form Submission
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let city = searchInput.value.trim();
    if (city) {
        fetchSearchWeather(city);
    }
});

//  Function to Fetch Weather by City Name
async function fetchSearchWeather(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) {
            throw new Error("City not found");
        }
        const data = await response.json();
        showWeatherData(data);
    } catch (error) {
        alert(error.message);
    } finally {
        loadingScreen.classList.remove("active");
    }
}

//  Check Session Storage When Page Loads
getFromSessionStorage();
