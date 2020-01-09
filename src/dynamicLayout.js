/* eslint-disable indent */
/* eslint-disable max-len */
import translate from 'translate';

// ... include translate

translate.engine = 'yandex';
translate.key = 'trnsl.1.1.20191215T140755Z.ff0079c14082a29c.1bd8c2aa7294ef463c34f210d29ee889a108ecdd';


// ... use translate()

const refreshButtonInsider = document.querySelector('.refreshButtonInsider');
const body = document.querySelector('body');
const infoLocation = document.querySelector('.info__location');
const infoDate = document.querySelector('.info__date');
const mainWeatherTemperature = document.querySelector('.main-weather__temperature');
const mainWeatherIcon = document.querySelector('.main-weather__icon');
const detailsItems = document.getElementsByClassName('details__item');
const forecastItemDayArray = document.getElementsByClassName('forecast-item__day');
const forecastItemTemperatureArray = document.getElementsByClassName('forecast-item__temperature');
const forecastItemIconArray = document.getElementsByClassName('forecast-item__icon');
const searchRowField = document.querySelector('.search-row__field');
const geoInfoLatitude = document.querySelector('.geo-info__latitude');
const geoInfoLongitude = document.querySelector('.geo-info__longitude');

// _________________________background image_________________________
function idForRequestPlusPlus() {
  if (+sessionStorage.idForRequest === 4) { sessionStorage.idForRequest = 0; } else {
    sessionStorage.idForRequest = +sessionStorage.idForRequest + 1;
  }
}
sessionStorage.BGerrors = 0;
sessionStorage.idForRequest = 0;
function getBG(weather) {
  const idArray = ['09ade6d49c5651607a93d8183e34f5f6ba29411e9e3ef2388640614d25a3a986',
    'e640dda3eb995eea48ca8d0e694bd96feddde9640664a03f21223c1cf959f3cc',
    '4ce17948ff77e352f8355a4d83c11aabde4aad9bf13718b32c8c2a567da5e238',
    'c1ad25239dce8fa36c705cffe6d9cbde9d1077fe84c7ba987af5c2fe9ae1315f',
    '5a33b689d25b5f14f108586677c9a23dd0b087079be6e95b4004504ad547c125'];

  const url = `https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=${weather}order_by=popular&quantity=30&client_id=${idArray[sessionStorage.idForRequest]}`;
  return fetch(url)
    .then((result) => result.json())
    .then((data) => data.urls.regular)
    // eslint-disable-next-line consistent-return
    .catch(() => {
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


// _________________________refreshBG button_________________________


const refreshBG = document.querySelector('.button-row__refresh-button');

refreshBG.addEventListener('click', async () => {
  refreshButtonInsider.classList.toggle('paused');
  let timeOfDay = 'day';
  // eslint-disable-next-line no-use-before-define
  if ((getCurrentDate().getHours()) > 20 || (getCurrentDate().getHours() < 8)) {
    timeOfDay = 'night';
  }

  await getBG(`${sessionStorage.weather} ${timeOfDay}`).then((background) => {
    body.style.backgroundImage = `linear-gradient(180deg, rgba(8, 15, 26, 0.59) 0%, rgba(17, 17, 46, 0.46) 100%),
        url('${background}')`;
  });
  refreshButtonInsider.classList.toggle('paused');
});


// _________________________temperature switcher________________________
function convertTemperature(value) {
  let result;
  if (sessionStorage.tType === 'Celsius') {
    result = Math.round((value * 9) / 5 + 32);
  } else
    if (sessionStorage.tType === 'Fahrenheit') {
      return Math.round(((value - 32) * 5) / 9);
    }
  return result;
}

const temperatureSwitcherArray = document.getElementsByClassName('temperature-switcher__item');
const detailsWeather = document.getElementsByClassName('details__item')[1];

for (let i = 0; i < 2; i += 1) {
  temperatureSwitcherArray[i].addEventListener('click', () => {
    temperatureSwitcherArray[0].classList.toggle('temperature-switcher__item_current');
    temperatureSwitcherArray[1].classList.toggle('temperature-switcher__item_current');
    let value = mainWeatherTemperature.innerHTML;
    mainWeatherTemperature.innerHTML = `${convertTemperature(value)}`;

    const feelsLike = { en: 'feels like:', ru: 'чувствуется как:', be: 'адчуваецца як:' };


    value = detailsWeather.innerHTML.slice(feelsLike[sessionStorage.lang].length + 1, detailsWeather.innerHTML.length - 1);

    detailsWeather.innerHTML = `${feelsLike[sessionStorage.lang]} ${convertTemperature(value)}°`;

    for (let j = 0; j < 3; j += 1) {
      value = forecastItemTemperatureArray[j].innerHTML;
      forecastItemTemperatureArray[j].innerHTML = `${convertTemperature(value)}`;
    }
    if (sessionStorage.tType === 'Fahrenheit') { sessionStorage.tType = 'Celsius'; } else if (sessionStorage.tType === 'Celsius') { sessionStorage.tType = 'Fahrenheit'; }
  });
}


// _________________________search row field _______________________


searchRowField.addEventListener('focus', () => {
  if (searchRowField.value !== 'Search city or ZIP' || searchRowField.value !== 'Поиск города или ZIP' || searchRowField.value !== 'Пошук горада ці ZIP') {
    searchRowField.value = '';
  }
});

searchRowField.addEventListener('blur', () => {
  if (searchRowField.value === '') {
    const searchRowFieldLangs = { en: 'Search city or ZIP', ru: 'Поиск города или ZIP', be: 'Пошук горада ці ZIP' };
    searchRowField.value = searchRowFieldLangs[sessionStorage.lang];
  }
});


// _________________________search button________________________

const zipcodes = require('zipcodes');

const searchRowButton = document.querySelector('.search-row__button');
// date refresher

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

function getCurrentDate() {
  const d = new Date();
  d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000 + sessionStorage.timezone * 1000);
  sessionStorage.curDay = d.getDay();
  return d;
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
  const result = `${setDay(date.getDay())} ${setZero(date.getDate())} ${setMonth(date.getMonth())} ${setZero(date.getHours())}:${setZero(date.getMinutes())}`;

  return result;
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


// update weather
const { getName } = require('country-list');

async function updateData() {
  if (sessionStorage.lang === 'ru') {
    searchRowField.value = 'Поиск города или ZIP';
    searchRowButton.innerHTML = 'Найти';
  }

  if (sessionStorage.lang === 'be') {
    searchRowField.value = 'Пошук горада ці ZIP';
    searchRowButton.innerHTML = 'Знайсці';
  }

  if (sessionStorage.lang === 'en') {
    searchRowField.value = 'Search city or ZIP';
    searchRowButton.innerHTML = 'search';
  }

  await getWeatherData(sessionStorage.city, sessionStorage.lang).then((result) => {
    if (result.message) {
      const alertsArray = {
        en: 'City not found, enter the correct city name (try enter the international English name)',
        ru: 'Город не найден, введите корректное название (попробуйте ввести английское международное название города)',
        be: 'Горад не знойдзен, увядзіце каррэктную назву (паспрабуйце ўкласці ангельскае міжнароднае назву горада)',
      };
      alert(alertsArray[sessionStorage.lang]);
      return;
    }

    sessionStorage.setItem('timezone', result.city.timezone);

    infoLocation.innerHTML = `${result.city.name}, ${getName(result.city.country)}`;

    translate(infoLocation.innerHTML, sessionStorage.lang).then((data) => {
      infoLocation.innerHTML = data;
    });

    sessionStorage.setItem('latitude', result.city.coord.lat);
    sessionStorage.setItem('longitude', result.city.coord.lon);

    const weatherDataArray = result.list;
    const weatherData = weatherDataArray[0];
    sessionStorage.weatherIcon = weatherData.weather[0].icon;
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
      console.log(sessionStorage.iconCode);
      console.log(beWeatherDescription[sessionStorage.iconCode]);

      detailsItems[0].innerHTML = `${beWeatherDescription[sessionStorage.iconCode]}`;
    }


    const feelsLike = { en: 'feels like:', ru: 'чувствуется как:', be: 'адчуваецца як:' };
    const wind = { en: 'wind: ', ru: 'ветер:', be: 'вецер:' };
    const windMS = { en: 'm/s', ru: 'м/c', be: 'м/c' };
    const humidity = { en: 'HUMIDITY: ', ru: 'влажность:', be: 'вільготнасць:' };

    detailsItems[1].innerHTML = `${feelsLike[sessionStorage.lang]} ${Math.round(weatherData.main.feels_like)}°`;
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
    });


    // _________________________map_________________________;


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
      center: [sessionStorage.longitude, sessionStorage.latitude],
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
        id: '(po)ints',
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
  });
  currentDateConstructor();
}

searchRowButton.addEventListener('click', () => {
  let { value } = searchRowField;
  if (searchRowField.value !== 'Search city or ZIP' && searchRowField.value !== 'Поиск города или ZIP' && searchRowField.value !== 'Пошук горада ці ZIP') {
    if (zipcodes.lookup(value)) {
      value = zipcodes.lookup(value).city;
    }
    sessionStorage.city = value;
    updateData();
  }
});

function pressedEnter(event) {
  let { value } = searchRowField;
  if (event.code === 'Enter' && value !== 'Search city or ZIP' && searchRowField.value !== 'Поиск города или ZIP' && searchRowField.value !== 'Пошук горада ці ZIP' && value !== '') {
    if (zipcodes.lookup(value)) {
      value = zipcodes.lookup(value).city;
    }
    sessionStorage.city = value;
    updateData();
  }
}

searchRowField.addEventListener('focus', () => {
  document.addEventListener('keydown', pressedEnter);
});

searchRowField.addEventListener('blur', () => {
  document.removeEventListener('keydown', pressedEnter);
});


// _________________________lang switcher________________________

const langSwitcher = document.querySelector('.lang-switcher');
const langSwitcherItemArray = document.getElementsByClassName('lang-switcher__item');
const langSwitcherArrow = document.querySelector('.lang-switcher__arrow');


// eslint-disable-next-line no-unused-vars
function translatePage(translateTo) {
  const itemsForTranslte = [infoLocation, detailsItems[1], detailsItems[2], detailsItems[3], geoInfoLatitude, geoInfoLongitude];

  for (let i = 0; i < itemsForTranslte.length; i += 1) {
    translate(itemsForTranslte[i].innerHTML, { from: sessionStorage.lang, to: translateTo }).then((translatedItem) => {
      itemsForTranslte[i].innerHTML = translatedItem;
    });
  }

  if (translateTo === 'be') {
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

    detailsItems[0].innerHTML = `${beWeatherDescription[sessionStorage.iconCode]}`;
  } else {
    translate(detailsItems[0].innerHTML, { from: sessionStorage.lang, to: translateTo }).then((translatedItem) => {
      detailsItems[0].innerHTML = translatedItem;
    });
  }
}

function chooseLang(event) {
  event.stopPropagation();
  const newLang = event.target.innerHTML.toLowerCase();
  translatePage(newLang);
  sessionStorage.lang = newLang;


  const searchRowFieldLangs = { en: 'Search city or ZIP', ru: 'Поиск города или ZIP', be: 'Пошук горада ці ZIP' };
  searchRowField.value = searchRowFieldLangs[sessionStorage.lang];
  const searchRowButtonLangs = { en: 'Search', ru: 'Найти', be: 'Знайсці' };
  searchRowButton.innerHTML = searchRowButtonLangs[sessionStorage.lang];


  for (let i = 0; i < 3; i += 1) {
    forecastItemDayArray[i].innerHTML = setDay(+sessionStorage.curDay + i + 1);
  }


  currentDateConstructor();


  const langSwitcherItemCurrent = document.querySelector('.lang-switcher__item_current');
  langSwitcherItemCurrent.classList.remove('lang-switcher__item_current');
  event.target.classList.add('lang-switcher__item_current');


  for (let j = 0; j < 3; j += 1) {
    langSwitcherItemArray[j].classList.remove('lang-switcher__item_visible');
  }
  langSwitcherArrow.style.display = 'flex';

  for (let j = 0; j < 3; j += 1) {
    langSwitcherItemArray[j].removeEventListener('click', chooseLang);
  }
}

langSwitcher.addEventListener('click', () => {
  for (let i = 0; i < 3; i += 1) {
    langSwitcherItemArray[i].classList.add('lang-switcher__item_visible');
  }
  langSwitcherArrow.style.display = 'none';

  for (let i = 0; i < 3; i += 1) {
    langSwitcherItemArray[i].addEventListener('click', chooseLang);
  }
});
