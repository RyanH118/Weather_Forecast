const form = document.querySelector('form');
const cityInput = document.getElementById('city');
const weatherFig = document.getElementById('weather');
const forecastArt = document.getElementById('forecast');
const historyDiv = document.getElementById('history');


// City is coming from the weather api array
async function getWeather(city) {
    try {
        // If the city is found from the geocoding api it converts it into the lat and lon for the weather and forecast apis.
        // the geocoding parameters are q for the city name, appid for our api key, and limit where we only want one city.
        const geocodingResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=a940d80377acb0b2e23b22339c9ce1ba`);
        const geocodingData = await geocodingResponse.json();
        // if we didnt find a city or we spelt it wrong that means the array is 0 and the throw call starts where it tells us theres an error and it stops the function. 
        if (geocodingData.length === 0) {
            throw new Error('City not found');
        }
        // the lat and lon const is put into the weather and forecast apis parameters that we got from the geocoding fetch.
        const { lat, lon } = geocodingData[0];
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=a940d80377acb0b2e23b22339c9ce1ba&units=imperial`);
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData);
        addToHistory(city);
        // the parameters for both apis are lat and lon for the city, appid for our api key, and units so the data is miles and farenheit.
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=a940d80377acb0b2e23b22339c9ce1ba&units=imperial`);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
        // error is coming from the weather api array
    } catch (error) {
        // if there is an error in the try block we can see in the console.
        console.error(error);
    }
}

// Data is coming from the weather api array
function displayWeather(data) {
    const weatherFig = document.getElementById('weather');
    // what the html will look like when we display the weather.
    weatherFig.innerHTML = `
    <h2>${data.name} - ${new Date(data.dt * 1000).toLocaleDateString()}</h2>
    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    <p>Temperature: ${data.main.temp}°F</p>
    <p>Wind Speed: ${data.wind.speed} mph</p>
    <p>Humidity: ${data.main.humidity}%</p>
    `;
    // ${data.name} is city name and ${new Date(data.dt * 1000).toLocaleDateString() is the current date.
    // ${data.weather[0].icon} is a img of the weather conditions and if the image isn't working the alt is a desc.
    // ${data.main.temp} gets temp from the api, ${data.wind.speed} gets the wind speeds, ${data.main.humidity} gets the humidity.
    document.body.appendChild(weatherFig);
}

function displayForecast(data) {
    const forecastArt = document.getElementById('forecast');
    forecastArt.innerHTML = '<h2>5-Day Forecast:</h2>';
    let forecastDate = new Date();
    // this slice only gets the first 5 items from the forecast api array.
    data.list.slice(0, 5).forEach((forecast) => {
        // this gets the day and then adds 1 for a different day.
        forecastDate.setDate(forecastDate.getDate() + 1);
        const forecastItem = document.createElement('div');
        forecastItem.innerHTML = `
        <h3>${forecastDate.toLocaleDateString()}</h3>
        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
        <p>Temperature: ${forecast.main.temp}°F</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
        <p>Wind Speed: ${forecast.wind.speed} mph</p>
      `;
        forecastArt.appendChild(forecastItem);
    });
    document.body.appendChild(forecastArt);
}

function addToHistory(city) {
    // this const is reading to see if theres an array and if there isnt it makes an empty one under the history variable.
    const history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
    // we are creating a history array that includes the city we searched for and its pushing it to the end of the array.
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('history', JSON.stringify(history));
        displayHistory();
    }
}

function displayHistory() {
    const history = localStorage.getItem('history') ? JSON.parse(localStorage.getItem('history')) : [];
    // this foreach is getting the names of the cities from the localStorage and making it into a button. 
    history.forEach((city) => {
        const cityButton = document.createElement('button');
        cityButton.textContent = city;
        // The event listener is so we can go back to see the previous cities weather forecast.
        cityButton.addEventListener('click', () => {
            getWeather(city);
        });
        historyDiv.appendChild(cityButton);
    });
    document.body.appendChild(historyDiv);
}

// we are calling the form const and when we submit from there we are looking for the input and if it has a city it runs the getWeather function and then clears the search bar.
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
        cityInput.value = '';
    }
});

displayHistory();