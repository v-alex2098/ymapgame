/*import React from "react";
import ReactDOM from "react-dom";
import { YMaps, Map } from "react-yandex-maps";*/

let map;
let regionsData = {}; // Здесь храним регионы, полученные из backendа
let targetRegion; // Текущий регион, по которому должен кликнуть пользователь
let totalRegions = 0; // Всего регионов участует в игре
let correctRegions = []; // Правильно выбранные регионы
let incorrectRegions = []; // Неправильно выбранные регионы 

function fetchRegions() {
	regionsData = {};
    fetch('/regions')
        .then(response => response.json())
        .then(data => {
            // Сконвертировать регионы в dictionary для простого доступа по ISO коду
            data.forEach(region => {
                regionsData[region.iso_code] = region;
            });
            totalRegions = Object.keys(regionsData).length;
            initializeGame();
        });
}

function startGame() {
	//alert('startgame');
	const maxRegionsInput = document.getElementById('maxRegionsValue');
    const maxRegions = parseInt(maxRegionsInput.value);
	const maxRegionsHidden = document.getElementById('maxRegions');
	const progressBar = document.getElementById('progress-bar');
    console.log(`Start game called.`);
    if (isNaN(maxRegions) || maxRegions <= 4) {
        alert('Введите хотя бы 5 регинов, иначе не интересно будет!');
            return;
        }
	
	
    fetch('/start', {
        method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ max_regions: maxRegions })
  	    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Игра началась!');
                maxRegionsInput.value = data.max_regions;
				progressBar.value = 0;
				progressBar.max=data.max_regions;
                maxRegionsInput.disabled = true; // поле мах регионов более не редактируемое
				maxRegionsHidden.value = data.max_regions;
                //document.getElementById('regionsRemaining').textContent = data.max_regions;
			    console.log(`Игра начата для пользователя: ${data.user_name}`);
                fetchRegions(); // получить и закрасить регионы
             }
        })
        .catch(error => {
            console.error('Error starting the game:', error);
        });
/* })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Что-то не так с HTTP! Статус: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Игра начата для пользователя: ${data.user_name}`);
            fetchRegions(); // Proceed to fetch the regions
        })
        .catch(error => {
            console.error('Игра не запустилась по причине:', error);
        }); */
}

function stopGame() {
  console.log(`Stop game called.`);	
  //Object.values(regionsData).filter(region => region.status === 'unselected') =; 
  // если игра принудительно остановлена, то розовые и бежевые регионы станут красными 
  Object.values(regionsData).forEach(region => {
	if (region.status === 'unselected' || region.status === 'failed1') {
		region.status = 'failed2';
    }		
  });
  initializeGame();
}
	
function initializeGame() {
    // Ищем следующий невыбранный регион
	const progressBar = document.getElementById('progress-bar');
	const maxRegionsInput = document.getElementById('maxRegions');
	const maxRegions = parseInt(maxRegionsInput.value);
	const progressBarText = document.getElementById('progress-bar-text');
    const unselectedRegions1st = Object.values(regionsData).filter(region => region.status === 'unselected'); // эти регионы ваще не выбирали
	const unselectedRegions2nd = Object.values(regionsData).filter(region => region.status === 'failed1');	  // первая попытка провалилась
    if (unselectedRegions1st.length == 0 && unselectedRegions2nd.length == 0) { 					// всё
		// отрисовать карту на прощание, иначе последний объект не закрасится
		initializeMap();
        // Больше нет регионов для выбора. Показ финальной статистики. 
		progressBar.value = progressBar.max;
		document.getElementById('target-region').textContent = `Найдены все регионы. Игра завершена.`;
		document.getElementById('reg_num').textContent = `Введите количество регионов для игры (мин. 5)`;
		progressBarText.textContent=` 100% `;
		document.getElementById('nextlinks').innerHTML = `<a href="javascript:void(0)" id="startGame" onclick="startGame()">Начать заново</a> <a href="/statistics">Перейти к просмотру статистики</a>   <a href="/logout">Выйти</a>`;
        showFinalStatistics();
        return;
    }

    // Выбрать новый регион для цели. 
	if (unselectedRegions1st.length >= unselectedRegions2nd.length) { // сначала выбираем пустые регионы undefined
	   targetRegion = unselectedRegions1st[Math.floor(Math.random() * unselectedRegions1st.length )];
	} else {
	   targetRegion = unselectedRegions2nd[Math.floor(Math.random() * unselectedRegions2nd.length )];	
	}
    // targetRegion.attempts = 0; // сбросить попытки для выбранного региона
	progressBar.value = progressBar.max-unselectedRegions1st.length-unselectedRegions2nd.length;
	pbPercents = Math.round((progressBar.max-unselectedRegions1st.length-unselectedRegions2nd.length)*100/maxRegions);
	progressBarText.textContent=` `+ pbPercents.toString() +`%`;
	// console.log(`Проценты: ${pbPercents}`);
    document.getElementById('target-region').textContent = `Найди регион: ${targetRegion.name}`;
	document.getElementById('reg_num').textContent = ` Осталось выбрать:`;
	document.getElementById('maxRegionsValue').value = unselectedRegions1st.length + unselectedRegions2nd.length;
    document.getElementById('nextlinks').innerHTML = `<a href="javascript:void(0)" id="stopGame" onclick="stopGame()">Остановить игру</a>`;
	
	
    initializeMap();
    //updateStatistics();
}

async function initializeMap() {
	
	var add_clusterer=false;
	//const mapRef = React.createRef(null);
	//var placemarks = [];
    // Если карта существует, чистим её
    if (map) {
        map.geoObjects.removeAll();
		clusterer.removeAll();
	} else {
        map = new ymaps.Map("map", {
            center: [66.251244, 93.618423], // примерно центр России 
            zoom: 3,
            controls: ['zoomControl']
        },
		{
			maxZoom: 18,
            minZoom: 2,
			suppressMapOpenBlock: true // Открыть в Яндекс.Картах нафиг не нужно
		},
		); 
		map.copyrights.add('© Саша и Федя Воронцовы. Москва. Школа №2098. 2025г.');  // добавим прикольный копирайт
		
		 // Создаем собственный макет с информацией о выбранном геообъекте.
   	
		clusterer = new ymaps.Clusterer({
            /**
             * Через кластеризатор можно указать только стили кластеров,
             * стили для меток нужно назначать каждой метке отдельно.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
             */
			balloonLeftColumnWidth: 130,
			balloonContentLayoutHeight: 265,
            preset: 'islands#invertedVioletClusterIcons',
            /**
             * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
             */
            groupByCoordinates: false,
            /**
             * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
             */
            clusterDisableClickZoom: true,
            clusterHideIconOnBalloonOpen: false,
            geoObjectHideIconOnBalloonOpen: false,
		    gridSize: 64
        });
		
		//let clusterer = new ymaps.Clusterer();//({preset: 'islands#greenClusterIcons'});
				
		/*clusterer.options.set({
                gridSize: 64
            });
		map.geoObjects.add(clusterer);*/
		
	}
    
	
	
    // Динамически грузим границы регионов
    await ymaps.borders.load('RU', {
        lang: 'ru',
        quality: 2 // уровень качества прорисовки границ
    }).then(geojson => {
		//const objectManager = new ymaps.ObjectManager();
        geojson.features.forEach(feature => {
            const isoCode = feature.properties.iso3166;
            const regionData = regionsData[isoCode];
            
            if (regionData) {
				
                // создать полигон региона под закраску согласно статуса 
				//console.log(`regionData.name: ${regionData.name}  regionData.status: ${regionData.status}`);
				// герб региона - подсказка при наведении на регион. По умолчанию Яндекс карты в подсказке пишут название региона
				const hintHtml = `<div style="position:absolute;vertical-align:middle;text-align:center"><img src="/static/images/gerby/${isoCode}.png" alt="Герб региона (как подсказка)"/>`; //<br><B>Это теeeetttttttttст! Тест. </B></div>`;
                const regionPolygon = new ymaps.GeoObject({
                    geometry: feature.geometry,
                    properties: {
                        isoCode: isoCode, // добавим ISO-код региона для идентификации
						hintContent: getHint(hintHtml,regionData.name,regionData.status),
                        name: regionData.name
                    }
                }, {
					//labelDefaults: "dark",
					//labelLayout: "<div>11{{regionData.name}}</div>",
					//labelTextSize: { "3_6": 12, "7_18": 14 },
					// Допустимая погрешность в расчете вместимости подписи в полигон.
                    // labelPermissibleInaccuracyOfVisibility: 4,
                    fillColor: getColor(regionData.status),
                    strokeColor: '#000000',
					fillOpacity: getOpacity(regionData.status),
                    strokeWidth: 1,
					//cursor: 'grab',
					//openHintOnHover: false,
                    //labelDotCursor: 'pointer'
					
                });

                // обработчик клика левой кнопкой мыши
                //regionPolygon.events.add('click', () => handleRegionClick(isoCode, regionPolygon));

                // добавить полигон на карту 
                //map.geoObjects.add(regionPolygon);
				//let add_clusterer=false;
				var placemarks = [];
				if((regionData.status==='success1' || regionData.status==='success2') && regionData.attractions.length > 10) {
				/*if(regionData.status==='success1' || regionData.status==='success2') { */
					//console.log(`Попытка вывести примечательности для ${isoCode}...`);
					let Attractions = [];
					let AttrData = [];
					let Coords = [];
					
					//let placemarks = [];
					Attractions = regionData.attractions.split("#");
					for (let i = 0; i < Attractions.length; i++) {
						AttrData = Attractions[i].split("|");
						Coords = AttrData[0].split(","); 
//						var isoLow = isoCode.toLowerCase();
						//consolelog(`Широта ${Coords[0]}...Долгота ${Coords[1]}`);
						//let bodycontent = '<a href="' + AttrData[2] + '" target="_blank" rel="noopener noreferrer">' + AttrData[1] + '</a>' +
						//	'<p><img style="width: 200px;" src="/static/images/attrs/ru-yan-'+i+'.png"></p><p>' + AttrData[3] + '</p>';
						var placemark = new ymaps.Placemark([Coords[0], Coords[1]], {
						//	balloonContent: bodycontent, 
							balloonContentHeader: AttrData[1],
							balloonContentBody: '<a href = "'+ AttrData[2] + '" target="_blank" rel="noopener noreferrer"><img width="200" border="2" src="/static/images/attrs/'+isoCode+'-'+i+'.png" alt="Нажми, чтобы узнать интересное!"></a><div style="width: 225px;"><p>' + AttrData[3] + '</p></div>',
							balloonContentFooter: regionData.name,
							hintContent: AttrData[1]
						});
						// Добавим метку на карту.
						//clusterer.add(placemark);
						placemarks.push(placemark);
						//console.log(`placemarks.lengths in cycle after push: ${placemarks.length} `);
						map.geoObjects.add(placemark);
						add_clusterer=true;
					}
				    //clusterer.add(placemarks);
				}
				
				regionPolygon.events.add('click', () => handleRegionClick(isoCode, regionPolygon));
				
				
				
				//objectManager.add(regionPolygon,aa);
                //aa++;    
				// Запускаем модуль подписей.
                //ymaps.polylabel.create(map, regionPolygon);
				//objectManager.add(regionPolygon);
				//map.geoObjects.add(objectManager);
				//const polylabel = new ymaps.polylabel.create(map, objectManager);		
				
				map.geoObjects.add(regionPolygon);
				
				
				
				if(placemarks.length>0) {
					//console.log(`Попытка добавить кластеризатор`);
					clusterer.add(placemarks);
					map.geoObjects.add(clusterer);
				}
                // добавить полигон на карту 
                
				
				//map.geoObjects.add(clusterer);
				//clusterer.add(placemarks);
				//map.geoObjects.add(clusterer);
				
	
            }
			/*else {
				console.log(`Name: ${feature.properties.name}     $ISO-CODE: ${feature.properties.iso3166}`); // Yandex, огласи весь список регионов)
		    }*/
			
        });
		
		//
		
    });
	//const polylabel = new ymaps.polylabel.create(map, map.geoObjects);
	//new ymaps.polylabel.create(map.current, map.geoObjects);
	//clusterer.add(placemarks);
	//console.log(`placemarks.lengths: ${placemarks.length} `);
	/*if(placemarks.length>0) {
					console.log(`Попытка добавить кластеризатор`);
					clusterer.add(placemarks);
					map.geoObjects.add(clusterer);
				}*/
//	Отмотать вверх страницы
	
	window.scrollTo(0,0);
}

function getHint(hintStr, rnStr, status) {
	str_p1='<p style="margin-top:1px; font-weight:bold; white-space:normal; font-size:11px; color:';
	str_p2=';">';
	str_p3='</p></div>'; 
	str_p4='</div>';
	switch (status) {
        case 'success1': return hintStr+str_p1+'#007400'+str_p2+rnStr+str_p3;  
		case 'success2': return hintStr+str_p1+'#30BD30'+str_p2+rnStr+str_p3;  
		case 'failed1': return hintStr+str_p4;	
        case 'failed2': return hintStr+str_p1+'#8A0000'+str_p2+rnStr+str_p3;  
        default: return hintStr+str_p4;        
    }
}
	

function getOpacity(status) {
    switch (status) {
        case 'success1': return 0.42;  
		case 'success2': return 0.42;  
		case 'failed1': return 1;	
        case 'failed2': return 1; // проигранные и свободные регионы не прозрачны  
        default: return 1;        
    }
}

function getColor(status) {
    switch (status) {
        case 'success1': return '#00CA00';  // зелёный - успех
		case 'success2': return '#90EE90';  // Светло-зелёный для регионов, угаданных со второй попытки
		case 'failed1': return '#FFC0CB';	// Розовый для неверных с первой попытки
        case 'failed2': return '#FF0000';  // Красный для полностью проиграннных
        default: return '#FFFFA7';        // для невыбранных
    }
}

async function handleRegionClick(isoCode, regionPolygon) {
    const clickedRegion = regionsData[isoCode];

    if (clickedRegion.status === 'success1' || clickedRegion.status === 'success2' || clickedRegion.status === 'failed2') {
        alert(`Этот регион уже был выбран ранее!`);
        return;
    }

    const correct = isoCode === targetRegion.iso_code; // присвоение true or false результата сравнения
	
	console.log(`Мышкой нажали на результат: ${correct}    ISO: ${isoCode} `);
	
    if(correct) {  									   // отправляем верно выбранный регион в базу данных
		fetch('/update', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ iso_code: isoCode, correct })
        })
		.then(response => response.json())
	    .then(data => {
           alert(`Поздравляю! Вы правильно выбрали ${data.name}.`);
		   regionsData[isoCode] = data;
		   //regionPolygon.options.set('fillColor', '#00FF00');
		   initializeGame(); 
		});
	} else {
		
		await fetch('/update', { 								// отправляем неверную попытку для целевого региона
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ iso_code: targetRegion.iso_code, correct })
        })
		.then(response => response.json())
	    .then(data => {
		  // alert(`Надо было выбратьть ${data.name}. Статус: ${data.status} Code: ${targetRegion.iso_code}`)
		   regionsData[targetRegion.iso_code] = data;
		  // initializeMap(); 
		});
		
		await fetch('/update', { 								// отправляем неверную попытку для региона по которому кликнули
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ iso_code: isoCode, correct })
        })
		.then(response => response.json())
	    .then(data => {
		   //alert(`Вы выбрали ${data.name}. Статус: ${data.status} вместо ${targetRegion.name}`)
		   alert(`Ошибка! Необходимо было выбрать: ${targetRegion.name}`)
		   regionsData[isoCode] = data;
		   initializeGame(); 
		});
		
	}
}

/*
function updateStatistics() {
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = '';

    Object.values(regionsData).forEach(region => {
        const listItem = document.createElement('li');
        listItem.textContent = `${region.name}: ${region.status}`;
        statsList.appendChild(listItem);
    });
}
*/

function endGame() {
    fetch('/end', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        });
}

function showFinalStatistics() {
	
    fetch('/end', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
			const maxRegionsInput = document.getElementById('maxRegionsValue');
			const maxRegionsHidden = document.getElementById('maxRegions');
			maxRegionsHidden.value = 85;
            maxRegionsInput.value = 85; 
            maxRegionsInput.disabled = false; 
			let resultsContent = `<h2>Игра завершена!</h2><table border='1'><tr><td><font color="lightgrey">Игрок: </font></th><th><font color="lightgrey">${data.user_name}</font></th></tr>`;
            resultsContent += `<tr><td><font color="lightgreen">Всего регионов: </font></td><td><font color="tomato">${data.total_regions}</font></td></tr>`;
			resultsContent += `<tr><td><font color="lightgreen">Счёт: </font></td><td><font color="tomato">${data.score}</font></td></tr>`;
            resultsContent += `<tr><td><font color="lightgreen">Отгадано с первой попытки: </font></td><td><font color="tomato">${data.first_try_regions}</font></td></tr>`;
			resultsContent += `<tr><td><font color="lightgreen">Отгадано со второй попытки: </font></td><td><font color="tomato">${data.second_try_regions}</font></td></tr>`;
			resultsContent += `<tr><td><font color="lightgreen">Регионов не выбрано: </font></td><td><font color="tomato">${data.failed_regions}</font></td></tr>`;
			resultsContent += `<tr><td><font color="lightgreen">Время начала: </font></td><td><font color="tomato">${data.start_time}</font></td></tr>`;
			resultsContent += `<tr><td><font color="lightgreen">Время завершения: </font></td><td><font color="tomato">${data.end_time}</font></td></tr>`;
			resultsContent += `<tr><td><font color="lightgreen">Времени затрачено: </font></td><td><font color="tomato">${data.spd_time}</font></td></tr>`;
            resultsContent += "</table>";
			resultsContent += "<br>";
            // попробую поп ап так
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.padding = '20px';
            popup.style.backgroundColor = 'darkblue';
            popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            popup.innerHTML = resultsContent;

            const closeButton = document.createElement('button');
            closeButton.textContent = "Понятно...";
            closeButton.onclick = () => document.body.removeChild(popup);
            popup.appendChild(closeButton);

            document.body.appendChild(popup);
			
			
         /*   alert(`
                Игра завершена!
                Пользователь: ${data.user_name}
                Всего регионов: ${data.total_regions}
                Счёт: ${data.score}
                Отгадано с первой попытки: ${data.first_try_regions}
                Отгадано со второй попытки: ${data.second_try_regions}
                Регионов не выбрано: ${data.failed_regions}
                Время начала: ${data.start_time}
				Время конца: ${data.end_time}
				Времени затрачено: ${data.spd_time}
            `); */
        });
}



// Начать игру, когда Яндекс карты прогрузятся.
//ymaps.ready(startGame);
//ymaps.ready(initializeMap);
//ymaps.ready(['polylabel.create']).then(initializeMap);
// ymaps.modules.require('polylabel');
//ymaps.ready(initializeMap);
ymaps.ready(initializeMap);
    // Load the custom module and add it to the map

