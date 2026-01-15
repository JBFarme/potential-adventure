// app.js
// Telegram WebApp для NeuroTelega

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Раскрываем на весь экран
tg.expand();

// Включаем кнопку закрытия
tg.enableClosingConfirmation();

// Модели и их данные
const MODELS = {
    'gem-2.5-fl': { name: 'Gemini 2.5 Flash-Lite', premium: false },
    'gem-2.5-f': { name: 'Gemini 2.5 Flash', premium: false },
    'gem-2.5-p': { name: 'Gemini 2.5 Pro', premium: true },
    'gem-3-f': { name: 'Gemini 3 Flash', premium: true },
    'gem-3-p': { name: 'Gemini 3 Pro', premium: true }
};

// Текущая выбранная модель
let selectedModel = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Настраиваем главную кнопку
    tg.MainButton.setText('Сохранить');
    tg.MainButton.color = tg.themeParams.button_color || '#5ba0d0';
    
    // Обработчик главной кнопки
    tg.MainButton.onClick(() => {
        saveSettings();
    });
    
    // Добавляем обработчики на карточки моделей
    const modelCards = document.querySelectorAll('.model-card');
    modelCards.forEach(card => {
        card.addEventListener('click', () => {
            selectModel(card.dataset.model);
        });
    });
    
    // Устанавливаем модель по умолчанию
    selectModel('gem-2.5-f');
    
    // Применяем тему Telegram
    applyTheme();
}

function selectModel(modelKey) {
    if (!MODELS[modelKey]) return;
    
    // Убираем выделение со всех карточек
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('selected', 'just-selected');
    });
    
    // Выделяем выбранную
    const selectedCard = document.querySelector(`[data-model="${modelKey}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected', 'just-selected');
        
        // Убираем анимацию через 300мс
        setTimeout(() => {
            selectedCard.classList.remove('just-selected');
        }, 300);
    }
    
    selectedModel = modelKey;
    
    // Показываем главную кнопку
    tg.MainButton.show();
    
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.selectionChanged();
    }
}

function saveSettings() {
    if (!selectedModel) {
        tg.showAlert('Выберите модель');
        return;
    }
    
    // Формируем данные для отправки в бота
    const data = {
        model: selectedModel,
        model_name: MODELS[selectedModel].name,
        is_premium: MODELS[selectedModel].premium
    };
    
    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    // Отправляем данные в бота
    tg.sendData(JSON.stringify(data));
}

function applyTheme() {
    // Telegram сам применяет тему через CSS переменные
    // Но можно добавить дополнительную логику при необходимости
    
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#1a1a2e';
    document.body.style.color = tg.themeParams.text_color || '#ffffff';
}

// Обработка события готовности WebApp
tg.ready();
