let lastBettingTime = 0; // Добавляем переменную для отслеживания последнего времени "betting"

// Функция генерации случайного числа (оставлена без изменений)
function getRan(min, max) {
    return Math.random() * (max - min) + min;
}

// Обновлённая функция проверки сигнала с использованием нового API
async function checkSignal() {
    const url = 'https://crash-gateway-cr.100hp.app/state';
    const params = new URLSearchParams({
        "id_n": "1play_luckyjet"
    });
    const headers = {
        "accept": "application/json, text/plain, */*",
        "authorization": "Bearer demo",  // Используем фиксированное значение для токена
        "origin": "https://100hp.app",
        "referer": "https://100hp.app/",
        "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
    };

    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const current_coefficients = data.current_coefficients[0]; // Предполагается, что это первое значение
        const stop_coefficients = data.stop_coefficients[0]; // Предполагается, что это первое значение

        const coefficientsDiv = document.getElementById('coefficients');
        const cupImg = document.getElementById('cup');
        const supImg = document.getElementById('sup');
        const oblokoImg = document.getElementById('ob1');
        const obloko2Img = document.getElementById('ob2');
        const loadImg = document.getElementById('ld');

        let responseText = document.getElementById('responseText');
        let responseText2 = document.getElementById('responseText2');

        if (current_coefficients === null) {
            // Ожидание следующего раунда
            if (Date.now() - lastBettingTime > 5000) {
                let randomNumber1 = getRan(1.1, 1.3).toFixed(2);
                let resultText = `${randomNumber1}x`;
                responseText2.textContent = "";
                responseText.textContent = resultText;
                localStorage.setItem('resultText', resultText);
                responseText.className = 'text betting';
                const bar = document.querySelector('.bar');
                bar.style.animation = 'loading 5s linear';
                const container = document.createElement('div');

                container.style.textAlign = 'center';

                const img = document.createElement('img');
                img.src = './images/loads.svg';
                img.style.maxWidth = '85px';
                img.style.maxHeight = '85px';
                container.appendChild(img);

                const text = document.createElement('div');
                text.innerText = 'WAIT\nNEXT ROUND';
                text.id = 'waitingText';
                container.appendChild(text);
                
                coefficientsDiv.innerHTML = ''; 
                coefficientsDiv.appendChild(container); 

                coefficientsDiv.classList.remove('kif');
                coefficientsDiv.classList.add('smallt');
                if (cupImg) cupImg.style.display = 'none';
                if (supImg) supImg.style.display = 'none';
                if (oblokoImg) oblokoImg.style.display = 'none';
                if (obloko2Img) obloko2Img.style.display = 'none';
                if (loadImg) loadImg.style.display = 'block';
                lastBettingTime = Date.now();
            }
        } else {
            // Есть текущий коэффициент
            updateCoefficients(current_coefficients);

            if (stop_coefficients !== null) {
                // Ставка улетела на stop_coefficients
                responseText.textContent = "Waiting..";
                responseText.className = 'text fly';
                responseText2.textContent = "FLIED AWAY";
                responseText2.className = 'text2 fly2';
                if (loadImg) loadImg.style.display = 'none';
            } else {
                // Состояние "flying"
                responseText2.textContent = "";
                if (cupImg) cupImg.style.display = 'block';
                if (supImg) supImg.style.display = 'block';
                if (oblokoImg) oblokoImg.style.display = 'block';
                if (obloko2Img) obloko2Img.style.display = 'block';
                if (loadImg) loadImg.style.display = 'none';
            }
        }
    } catch (error) {
        console.error(`Ошибка при запросе: ${error}`);
    }
}

// Обновлённая функция для получения данных и обновления коэффициентов
function fetchDataAndUpdate() {
    const url = 'https://crash-gateway-cr.100hp.app/state';
    const params = new URLSearchParams({
        "id_n": "1play_luckyjet"
    });
    const headers = {
        "accept": "application/json, text/plain, */*",
        "authorization": "Bearer demo",
        "origin": "https://100hp.app",
        "referer": "https://100hp.app/",
        "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36"
    };

    fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: headers
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const kef = data.current_coefficients[0]; // Предполагается, что это первое значение
            updateCoefficients(kef);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Функция обновления коэффициентов (оставлена без изменений, за исключением форматирования строки)
function updateCoefficients(coefficients) {
    const coefficientsDiv = document.getElementById('coefficients');

    if (coefficients !== null && coefficients !== 1) {
        coefficientsDiv.innerText = `x${coefficients}`; 
        coefficientsDiv.classList.remove('smallt');
        coefficientsDiv.classList.add('kif');
    } else if (coefficients === null) {
        coefficientsDiv.innerText = ''; 
    }
}

// Инициализация и запуск интервалов (оставлено без изменений)
fetchDataAndUpdate();
setInterval(fetchDataAndUpdate, 500); // Изменил интервал на 1 секунду для согласованности с Python-кодом
let intervalId = setInterval(checkSignal, 100); // Изменил интервал на 1 секунду
checkSignal();
