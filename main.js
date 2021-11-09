
let weather = {
    // apiKey: "bab864acdd8c088fbaf6ecee58e9594d",
    apiKey: weatherAPI,
    fetchWeather: function (city) {
        fetch(
            //  Enable API back  once finished:
            "https://api.openweathermap.org/data/2.5/weather?q="
            + city 
            + "&units=metric&appid=" 
            + this.apiKey
        )
            .then((response) => response.json())
            .then((data) => this.displayWeather(data));
    },
    displayWeather: function(data) {
        const {name} = data;
        const {icon, description} = data.weather[0];
        const {temp, humidity} = data.main;
        const {speed} = data.wind;
        console.log(name, icon, description, temp, humidity, speed);
        document.querySelector(".city").innerText = `Weather now in:
        ${name}`;
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
        document.querySelector(".wind").innerText = "Wind Speed: " + speed + "km/h";
        document.querySelector(".weather").classList.remove("loading");
        document.querySelector(".cityPhoto").innerHTML = `
        <img src="https://source.unsplash.com/1920x1080? + ${name}" alt="">
        `
    },
    search: function (){
        this.fetchWeather(document.querySelector(".search-bar").value);
    }  
};

let geocode = {
    reverseGeocode: function (latitude, longitude) {
        var api_key = geocodeAPI;  // Saved Externally
        var api_url = 'https://api.opencagedata.com/geocode/v1/json'
      
        var request_url = api_url
          + '?'
          + 'key=' + api_key
          + '&q=' + encodeURIComponent(latitude + ',' + longitude)
          + '&pretty=1'
          + '&no_annotations=1';
        // Full list of required and optional parameters:
        // https://opencagedata.com/api#forward
      
        var request = new XMLHttpRequest();
        request.open('GET', request_url, true);
      
        request.onload = function() {
          if (request.status === 200){ 
            // Success!
            var data = JSON.parse(request.responseText);
            weather.fetchWeather(data.results[0].components.city);
            console.log(data.results[0].components.city); // print the location

          } else if (request.status <= 500){ 
            // We reached our target server, but it returned an error
                                 
            console.log("unable to geocode! Response code: " + request.status);
            var data = JSON.parse(request.responseText);
            console.log('error msg: ' + data.status.message);
          } else {
            console.log("server error");
          }
        };
      
        request.onerror = function() {
          // If there's any connection errors:
          console.log("unable to connect to server");        
        };
        request.send();  // make the request
    },
    getLocation: function() {
        function success (data) {
            geocode.reverseGeocode(data.coords.latitude, data.coords.longitude);
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, console.error);
        } 
        else {
            weather.fetchWeather("Manchester");
        }
    }
};
document.querySelector(".search button").addEventListener("click", function ()  {
    weather.search();
    execute();
    getData();
    registerEventHandlers();
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        weather.search();
        execute();
        getData();
        registerEventHandlers();
    }
});

geocode.getLocation();

// YouTube API:
gapi.load("client", loadClient);
  
function loadClient() {
    gapi.client.setApiKey(youtubeAPI);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("GAPI client loaded for API"); },
                function(err) { console.error("Error loading GAPI client for API", err); });
}
// 
const ytSearch = document.getElementById('search-bar');
const videoList = document.getElementById('videoListContainer');
var pageToken = '';
  
// Make sure the client is loaded before calling this method.
function execute() {
    const searchString = ytSearch.value; //
    const maxresult = 6;
    const orderby = "relevance";
  
    var arr_search = {
        "part": 'snippet',
        "type": 'video',
        "order": orderby,
        "maxResults": maxresult,
        "q": searchString + "travel guide"
    };
  
    if (pageToken != '') {
        arr_search.pageToken = pageToken;
    }
  
    return gapi.client.youtube.search.list(arr_search)
    .then(function(response) {
        // Handle the results here (response.result has the parsed body).
        const listItems = response.result.items;
        if (listItems) {
            let output = '<h1 class="yt-container-title">Video Travel guides you may want to check:</h1><ul>';
  
            listItems.forEach(item => {
                const videoId = item.id.videoId;
                const videoTitle = item.snippet.title;

                    output += `
                        <div class="videoThumb">
                        <a data-fancybox href="https://www.youtube.com/watch?v=${videoId}">
                        <img src="https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg" />
                        </a>
                        <p class="video-title">${videoTitle}</p>
                        </div>
                    `;
                });
                output += '</ul>';
            // Output list
            videoList.innerHTML = output;
        }
    },
    function(err) { console.error("Execute error", err); });
}

// Wikipedia Selectors:
const submitButton = document.querySelector('#submit');
const input = document.querySelector('#search-bar');
const errorSpan = document.querySelector('#error');
const resultsContainer = document.querySelector('#results');
const articlesTitle = document.querySelector('.articles-title');

const endpoint = 'https://en.wikipedia.org/w/api.php?';
const params = {
    origin: '*',
    format: 'json',
    action: 'query',
    prop: 'extracts',
    exchars: 400,
    exintro: true,
    explaintext: true,
    generator: 'search',
    gsrlimit: 3
};

// WIKIPEDIA:
// Helper Functions:

const disableUi = () => {
    input.disabled = true;
    submitButton.disabled = true;
};

const enableUi = () => {
    input.disabled = false;
    submitButton.disabled = false;
};

const clearPreviousResults = () => {
    resultsContainer.innerHTML = '';
    errorSpan.innerHTML = '';
};

const isInputEmpty = (input) => {
    if (!input || input === '') return true;
    return false;
};

const showError = (error) => {
    errorSpan.innerHTML = `🔴 ${error} 🔴`;
};

const showResults = results => {
    results.forEach(result => {
        resultsContainer.innerHTML += `
        <h1>Article suggestion:</h1>
        <div class="results__item">
            <a href="https://en.wikipedia.org/?curid=${result.pageId}" target="_blank" class="card animated bounceInUp">
                <h2 class="results__item__title">${result.title}</h2>
                <p class="results__item__intro">${result.intro}</p>
            </a>
        </div>
    `;
    });
};

const gatherData = (pages) => {
    const results = Object.values(pages).map(page => ({
        pageId: page.pageid,
        title: page.title,
        intro: page.extract,
    }));

    showResults(results);
};

// Event Handler Functions:
const getData = async () => {
    const userInput = input.value;
    if (isInputEmpty(userInput)) return;

    params.gsrsearch = userInput;
    clearPreviousResults();
    disableUi();

    try {
        const {data} = await axios.get(endpoint, { params });  
        if (data.error) throw new Error(data.error.info);
        gatherData(data.query.pages);
    } catch (error) {
        showError(error);
    } finally {
        enableUi();
    }
};

const registerEventHandlers = () => {
    input.addEventListener('keydown', handleKeyEvent);
    submitButton.addEventListener('click', getData);
};

// registerEventHandlers();


