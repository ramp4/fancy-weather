// header

const header = document.createElement('header');
header.className = 'header';
document.body.append(header);

const buttonRow = document.createElement('div');
buttonRow.className = 'button-row';
header.append(buttonRow);

const refreshButton = document.createElement('div');
refreshButton.className = 'button-row__refresh-button';
buttonRow.append(refreshButton);

const refreshButtonInsider = document.createElement('div');
refreshButtonInsider.className = 'refreshButtonInsider';
refreshButton.append(refreshButtonInsider);

const langSwitcher = document.createElement('ul');
langSwitcher.className = 'lang-switcher';
buttonRow.append(langSwitcher);

const langArrow = document.createElement('div');
langArrow.className = 'lang-switcher__arrow';
langSwitcher.append(langArrow);

const langArray = new Array(3);

for (let i = 0; i < 3; i += 1) {
  langArray[i] = document.createElement('li');
  langArray[i].className = 'lang-switcher__item';
  langSwitcher.append(langArray[i]);
}

langArray[0].innerHTML = 'EN';
langArray[1].innerHTML = 'RU';
langArray[2].innerHTML = 'BE';
langArray[0].className += ' lang-switcher__item_current';

const tSwitcher = document.createElement('div');
tSwitcher.className = 'temperature-switcher';
buttonRow.append(tSwitcher);

const fTemp = document.createElement('div');
fTemp.className = 'temperature-switcher__item temperature-switcher__item_fahrenheit';
tSwitcher.append(fTemp);
fTemp.innerHTML = '°F';

const cTemp = document.createElement('div');
cTemp.className = 'temperature-switcher__item temperature-switcher__item_celsius temperature-switcher__item_current';
tSwitcher.append(cTemp);
cTemp.innerHTML = '°С';

const searchRow = document.createElement('div');
searchRow.className = 'search-row';
header.append(searchRow);

const searchField = document.createElement('input');
searchField.className = 'search-row__field';
searchField.type = 'text';
searchField.name = 'search';
searchField.value = 'Search city or ZIP';
searchRow.append(searchField);

const voiceSearch = document.createElement('div');
voiceSearch.className = 'search-row__voice-search';
searchRow.append(voiceSearch);


const searchButton = document.createElement('div');
searchButton.className = 'search-row__button';
searchRow.append(searchButton);
searchButton.innerHTML = 'Search';

// main

const main = document.createElement('main');
main.className = 'main';
document.body.append(main);


// section-1

const section1 = document.createElement('section');
section1.className = 'section-1';
main.append(section1);

section1.insertAdjacentHTML('afterbegin', '<div class="info"><span class="info__location"></span><span class="info__date"></span></div><div class="main-weather"><span class="main-weather__temperature"></span><ul class="details"><li class="details__item"></li><li class="details__item"></li><li class="details__item"></li><li class="details__item"></li></ul><div class="main-weather__icon"></div></div>');

section1.insertAdjacentHTML('beforeend', '<ul class="forecast"><li class="forecast-item"></li><li class="forecast-item"></li><li class="forecast-item"></li></ul>');

const forecastItemArray = document.getElementsByClassName('forecast-item');

for (let i = 0; i < 3; i += 1) {
  forecastItemArray[i].insertAdjacentHTML('afterbegin', '<span class="forecast-item__day"></span><span class="forecast-item__temperature"></span><div class="forecast-item__icon"></div>');
}

// section-2

const section2 = document.createElement('section');
section2.className = 'section-2';
main.append(section2);

section2.insertAdjacentHTML('afterbegin', '<div class="map-container"><div id="map"></div></div><div class="geo-info"></div>');

const geoInfo = document.querySelector('.geo-info');
geoInfo.insertAdjacentHTML('afterbegin', '<span class="geo-info__latitude"></span><span class="geo-info__longitude"></span>');
