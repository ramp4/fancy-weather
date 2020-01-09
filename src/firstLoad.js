/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */


import translate from 'translate';

const refreshButtonInsider = document.querySelector('.refreshButtonInsider');

refreshButtonInsider.classList.toggle('paused');
const infoLocation = document.querySelector('.info__location');
const infoDate = document.querySelector('.info__date');
const mainWeatherTemperature = document.querySelector('.main-weather__temperature');
const mainWeatherIcon = document.querySelector('.main-weather__icon');
const detailsItems = document.getElementsByClassName('details__item');
const body = document.querySelector('body');
const forecastItemDayArray = document.getElementsByClassName('forecast-item__day');
const forecastItemTemperatureArray = document.getElementsByClassName('forecast-item__temperature');
const forecastItemIconArray = document.getElementsByClassName('forecast-item__icon');

const langSwitcherItemArray = document.getElementsByClassName('lang-switcher__item');
const langSwitcherItemCurrent = document.querySelector('.lang-switcher__item_current');
const langSwitcherEN = langSwitcherItemArray[0];
const langSwitcherRU = langSwitcherItemArray[1];
const langSwitcherBE = langSwitcherItemArray[2];

const searchRowField = document.querySelector('.search-row__field');
const searchRowButton = document.querySelector('.search-row__button');

function getUserLang() {
  const language = window.navigator ? (window.navigator.language
    || window.navigator.systemLanguage
    || window.navigator.userLanguage) : 'ru';
  const result = language.substr(0, 2).toLowerCase();
  return result;
}

function setAppLang() {
  const receivedLang = getUserLang();
  if (receivedLang === 'ru') {
    langSwitcherItemCurrent.classList.toggle('lang-switcher__item_current');
    langSwitcherRU.classList.toggle('lang-switcher__item_current');
    sessionStorage.lang = receivedLang;
    searchRowField.value = 'Поиск города или ZIP';
    searchRowButton.innerHTML = 'Найти';
    return;
  }
  if (receivedLang === 'be') {
    langSwitcherBE.style.order = '0';
    sessionStorage.lang = receivedLang;
    langSwitcherItemCurrent.classList.toggle('lang-switcher__item_current');
    langSwitcherBE.classList.toggle('lang-switcher__item_current');
    searchRowButton.innerHTML = 'Знайсці';
    return;
  }
  langSwitcherEN.style.order = '0';
  sessionStorage.lang = 'en';
}

setAppLang();

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

async function success(pos) {
  const crd = pos.coords;
  sessionStorage.latitude = Math.round(crd.latitude * 100) / 100;
  sessionStorage.longitude = Math.round(crd.longitude * 100) / 100;
  // eslint-disable-next-line no-use-before-define
  drawMap();

  async function getInfoLocationData(lat, lng) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=ac02709a988248a1a2d8eb20e203fa89`;
    let result = await fetch(url).then((data) => data.json());
    result = result.results[0].components;
    return result;
  }
  const locationData = await getInfoLocationData(sessionStorage.latitude, sessionStorage.longitude);

  infoLocation.innerHTML = `${locationData.city}, ${locationData.country}`;

  translate(infoLocation.innerHTML, sessionStorage.lang).then((data) => {
    infoLocation.innerHTML = data;
  });
  sessionStorage.setItem('city', locationData.city);
  sessionStorage.setItem('tType', 'Celsius');
}

function error(err) {
  // eslint-disable-next-line no-use-before-define
  getLocationDataAsyncFunction();
  console.warn(`ERROR(${err.code}): ${err.message}`);
  // eslint-disable-next-line no-use-before-define
  drawMap();
}

// ... include translate

translate.engine = 'yandex';
translate.key = 'trnsl.1.1.20191215T140755Z.ff0079c14082a29c.1bd8c2aa7294ef463c34f210d29ee889a108ecdd';


// ... use translate()


// _________________________api_________________________

function getLocationData() {
  const url = 'https://ipinfo.io/json?token=08f12254167956';
  return fetch(url).then((result) => result.json());
}


const { getName } = require('country-list');


async function getWeatherData(city, lang) {
  let cityEn = city;
  let units = 'metric';
  if (sessionStorage.tType === 'Fahrenheit') { units = 'imperial'; }
  if (sessionStorage.lang === 'be') {
    cityEn = await translate(city, { from: sessionStorage.lang, to: 'en' });
  }
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityEn}&lang=${lang}&cnt=32&units=${units}&APPID=df773d568696e244bf0864cd6367d9c5`;

  return fetch(url)
    .then((response) => response.json());
}


// _________________________map_________________________;


const geoInfoLatitude = document.querySelector('.geo-info__latitude');
const geoInfoLongitude = document.querySelector('.geo-info__longitude');


function drawMap() {
  /* eslint-disable no-unused-vars */
  /* eslint-disable no-undef */

  const latitude = { en: 'Latitude:', ru: 'Широта:', be: 'Шырата:' };
  const longitude = { en: 'Longitude:', ru: 'Долгота:', be: 'даўгата:' };
  geoInfoLatitude.innerHTML = `${latitude[sessionStorage.lang]} ${sessionStorage.latitude.slice(0, 2)}°${sessionStorage.latitude.slice(3, 5)}'`;
  geoInfoLongitude.innerHTML = `${longitude[sessionStorage.lang]} ${sessionStorage.longitude.slice(0, 2)}°${sessionStorage.longitude.slice(3, 5)}'`;


  mapboxgl.accessToken = 'pk.eyJ1IjoicmFtcDQiLCJhIjoiY2s0NGJvMGt1MDlpZzNqcDlkNjhkZGd4bSJ9._tcW4OCvJTpC003r3NwMqQ';
  const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [sessionStorage.longitude, sessionStorage.latitude], // starting position [lng, lat]
    zoom: 9, // starting zoom
  });

  const size = 500;

  // implementation of CustomLayerInterface to draw a pulsing dot icon on the map
  // see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd() {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
    },

    // called once before every frame where the icon will be used
    render() {
      const duration = 1000;
      const t = (performance.now() % duration) / duration;

      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const { context } = this;

      // draw outer circle
      context.clearRect(0, 0, this.width, this.height);
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        outerRadius,
        0,
        Math.PI * 2,
      );
      context.fillStyle = `rgba(255, 200, 200,${1 - t})`;
      context.fill();

      // draw inner circle
      context.beginPath();
      context.arc(
        this.width / 2,
        this.height / 2,
        radius,
        0,
        Math.PI * 2,
      );
      context.fillStyle = 'red';
      context.strokeStyle = 'white';
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // update this image's data with data from the canvas
      this.data = context.getImageData(
        0,
        0,
        this.width,
        this.height,
      ).data;

      // continuously repaint the map, resulting in the smooth animation of the dot
      map.triggerRepaint();

      // return `true` to let the map know that the image was updated
      return true;
    },
  };

  map.on('load', () => {
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 10 });

    map.addLayer({
      id: 'points',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [sessionStorage.longitude, sessionStorage.latitude],
              },
            },
          ],
        },
      },
      layout: {
        'icon-image': 'pulsing-dot',
      },
    });
  });


  /* eslint-enable no-unused-vars */
  /* eslint-enable no-undef */
}


// _________________________location_________________________
async function getLocationDataAsyncFunction() {
  await getLocationData().then((locationData) => {
    infoLocation.innerHTML = `${locationData.city}, ${getName(locationData.country)}`;

    translate(infoLocation.innerHTML, sessionStorage.lang).then((data) => {
      infoLocation.innerHTML = data;
    });
    sessionStorage.setItem('city', locationData.city);
    sessionStorage.setItem('tType', 'Celsius');
    const latitude = locationData.loc.slice(0, 7);
    sessionStorage.setItem('latitude', Math.round(latitude * 100) / 100);
    const longitude = locationData.loc.slice(8, 15);
    sessionStorage.setItem('longitude', Math.round(longitude * 100) / 100);
  });
}
navigator.geolocation.getCurrentPosition(success, error, options);

// _________________________date_________________________


function setDay(index) {
  let i = index;
  if (i > 6) {
    i -= 7;
  }
  let days;
  if (sessionStorage.lang.toLowerCase() === 'en') {
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  if (sessionStorage.lang.toLowerCase() === 'ru') {
    days = ['Воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  }

  if (sessionStorage.lang.toLowerCase() === 'be') {
    days = ['Нядзеля', 'Панядзелак', 'аўторак', 'серада', 'чацвер', 'Пятніца', 'Субота'];
  }

  return days[i];
}

function dateToTxt(date) {
  let months;
  function setMonth(index) {
    if (sessionStorage.lang.toLowerCase() === 'en') {
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
    }

    if (sessionStorage.lang.toLowerCase() === 'ru') {
      months = [
        'Января',
        'Февраля',
        'Марта',
        'Апреля',
        'Мая',
        'Июня',
        'Июля',
        'Августа',
        'Сентября',
        'Октября',
        'Ноября',
        'Декабря',
      ];
    }

    if (sessionStorage.lang.toLowerCase() === 'be') {
      months = [
        'Студзеня',
        'Лютага',
        'Сакавіка',
        'Красавіка',
        'Мая',
        'Чэрвеня',
        'Ліпеня',
        'Жніўня',
        'Верасня',
        'Кастрычніка',
        'Лістапад',
        'Сьнежня',
      ];
    }

    return months[index];
  }

  function setZero(number) {
    if (number < 10) return `0${number}`;
    return number;
  }
  const result = `${setDay(date.getDay())} ${setZero(date.getDate())} ${setMonth(date.getMonth())} ${setZero(date.getHours())}:${setZero(date.getMinutes())} `;

  return result;
}

function getCurrentDate() {
  const d = new Date();
  d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000 + sessionStorage.timezone * 1000);
  sessionStorage.curDay = d.getDay();
  return d;
}


function currentDateConstructor() {
  infoDate.innerHTML = dateToTxt(getCurrentDate());

  let refreshDate = function refreshDateFunction() {
    let updatedDate = getCurrentDate();
    const seconds = updatedDate.getSeconds();
    if (seconds === 0) {
      infoDate.innerHTML = dateToTxt(updatedDate);
      setInterval(() => {
        updatedDate = getCurrentDate();
        infoDate.innerHTML = dateToTxt(updatedDate);
      }, 60000);
      refreshDate = null;
      return;
    }
    setTimeout(() => {
      refreshDate();
    }, 500);
  };

  refreshDate();
}

// _________________________background image_________________________
function idForRequestPlusPlus() {
  if (+sessionStorage.idForRequest === 4) { sessionStorage.idForRequest = 0; } else {
    sessionStorage.idForRequest = +sessionStorage.idForRequest + 1;
  }
}
sessionStorage.BGerrors = 0;
sessionStorage.idForRequest = 0;
function getBG(weather) {
  refreshButtonInsider.classList.toggle('paused');
  const idArray = ['09ade6d49c5651607a93d8183e34f5f6ba29411e9e3ef2388640614d25a3a986',
    'e640dda3eb995eea48ca8d0e694bd96feddde9640664a03f21223c1cf959f3cc',
    '4ce17948ff77e352f8355a4d83c11aabde4aad9bf13718b32c8c2a567da5e238',
    'c1ad25239dce8fa36c705cffe6d9cbde9d1077fe84c7ba987af5c2fe9ae1315f',
    '5a33b689d25b5f14f108586677c9a23dd0b087079be6e95b4004504ad547c125'];

  const url = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=${weather}order_by=popular&quantity=30&client_id=${idArray[sessionStorage.idForRequest]}`;
  return fetch(url)
    .then((result) => result.json())
    .then((data) => {
      refreshButtonInsider.classList.toggle('paused');
      return data.urls.regular;
    })
    // eslint-disable-next-line consistent-return
    .catch(() => {
      refreshButtonInsider.classList.toggle('paused');
      if (+sessionStorage.BGerrors <= 4) {
        console.log('Exceeded the number of background image requests(trying another access key)');
        sessionStorage.BGerrors = +sessionStorage.BGerrors + 1;
        idForRequestPlusPlus();
        return getBG(weather);
      }
      console.log('Exceeded the number of background image requests');
      body.style.backgroundColor = 'black';
      refreshButtonInsider.classList.toggle('paused');
    });
}


// _________________________weather/date_________________________;

async function updateWeatherData() {
  await getLocationDataAsyncFunction();
  if (sessionStorage.city !== undefined && sessionStorage.lang !== undefined) {
    await getWeatherData(sessionStorage.city, sessionStorage.lang).then((result) => {
      sessionStorage.setItem('timezone', result.city.timezone);


      const weatherDataArray = result.list;
      const weatherData = weatherDataArray[0];
      mainWeatherTemperature.innerHTML = `${Math.round(weatherData.main.temp)}`;
      mainWeatherIcon.style.backgroundImage = `url('http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png')`;

      const beWeatherDescription = {
        '01d': 'яснае неба',
        '02d': 'некалькі аблокаў',
        '03d': 'раскіданыя хмары',
        '04d': 'разбітыя хмары',
        '09d': 'ліўневы дождж',
        '010d': 'дождж',
        '011d': 'навальніца',
        '013d': 'снег',
        '50d': 'туман',
        '01n': 'яснае неба',
        '02n': 'некалькі аблокаў',
        '03n': 'раскіданыя хмары',
        '04n': 'разбітыя хмары',
        '09n': 'ліўневы дождж',
        '010n': 'дождж',
        '011n': 'навальніца',
        '013n': 'снег',
        '50n': 'туман',
      };

      sessionStorage.iconCode = weatherData.weather[0].icon.toString();

      if (sessionStorage.lang === 'en' || sessionStorage.lang === 'ru') {
        detailsItems[0].innerHTML = weatherData.weather[0].description;
      }

      if (sessionStorage.lang === 'be') {
        detailsItems[0].innerHTML = `${beWeatherDescription[sessionStorage.iconCode]}`;
      }

      const feelsLike = { en: 'feels like:', ru: 'чувствуется как:', be: 'адчуваецца як:' };
      const wind = { en: 'wind: ', ru: 'ветер:', be: 'вецер:' };
      const windMS = { en: 'm/s', ru: 'м/c', be: 'м/c' };
      const humidity = { en: 'HUMIDITY: ', ru: 'влажность:', be: 'вільготнасць:' };

      detailsItems[1].innerHTML = `${feelsLike[sessionStorage.lang]} ${Math.round(weatherData.main.feels_like)}°`;
      sessionStorage.feelsLike = weatherData.main.feels_like;
      detailsItems[2].innerHTML = `${wind[sessionStorage.lang]} ${Math.round(weatherData.wind.speed)} ${windMS[sessionStorage.lang]}`;
      detailsItems[3].innerHTML = `${humidity[sessionStorage.lang]}  ${Math.round(weatherData.main.humidity)}%`;

      // 3 days forecast
      const curHours = `${weatherDataArray[0].dt_txt[11]}${weatherDataArray[0].dt_txt[12]}`;
      let nextDayIndex = (24 - curHours + 12) / 3;

      for (let i = 0; i < 3; i += 1) {
        forecastItemDayArray[i].innerHTML = `${setDay(getCurrentDate().getDay() + i + 1)}`;
        forecastItemTemperatureArray[i].innerHTML = `${Math.round(weatherDataArray[nextDayIndex].main.temp)}`;
        forecastItemIconArray[i].style.backgroundImage = `url('http://openweathermap.org/img/wn/${weatherDataArray[nextDayIndex].weather[0].icon}@2x.png')`;
        nextDayIndex += 8;
      }

      sessionStorage.setItem('weather', weatherData.weather[0].main);

      let timeOfDay = 'day';
      if ((getCurrentDate().getHours()) > 20 || (getCurrentDate().getHours() < 8)) {
        timeOfDay = 'night';
      }

      getBG(`${sessionStorage.weather} ${timeOfDay}`).then((background) => {
        body.style.backgroundImage = `linear-gradient(180deg, rgba(8, 15, 26, 0.59) 0%, rgba(17, 17, 46, 0.46) 100%),
        url('${background}')`;
        refreshButtonInsider.classList.toggle('paused');
      });
    });
  }
  currentDateConstructor();
}
updateWeatherData();
