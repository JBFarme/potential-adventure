// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;

// App State
const state = {
    selectedModel: 'gemini-flash',
    balance: 0,
    username: 'Пользователь'
};

// DOM Elements
const elements = {
    username: document.getElementById('username'),
    balance: document.getElementById('balance'),
    saveButton: document.getElementById('saveButton'),
    buyButton: document.getElementById('buyPremium'),
    modelCards: document.querySelectorAll('.model-card'),
    modelInputs: document.querySelectorAll('input[name="model"]')
};

// Initialize the app
function init() {
    // Expand the WebApp to full height
    if (tg) {
        tg.expand();
        tg.ready();
        
        // Apply Telegram theme colors if available
        applyTelegramTheme();
        
        // Get user data from Telegram
        if (tg.initDataUnsafe?.user) {
            const user = tg.initDataUnsafe.user;
            state.username = user.first_name || user.username || 'Пользователь';
            elements.username.textContent = state.username;
        }
        
        // Enable haptic feedback
        enableHapticFeedback();
        
        // Setup main button (optional alternative to custom save button)
        setupMainButton();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load saved preferences
    loadPreferences();
    
    // Animation on load
    animateOnLoad();
}

// Apply Telegram theme colors
function applyTelegramTheme() {
    if (!tg?.themeParams) return;
    
    const theme = tg.themeParams;
    const root = document.documentElement;
    
    if (theme.bg_color) {
        root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
    }
    if (theme.secondary_bg_color) {
        root.style.setProperty('--tg-theme-secondary-bg', theme.secondary_bg_color);
    }
    if (theme.text_color) {
        root.style.setProperty('--tg-theme-text-color', theme.text_color);
    }
    if (theme.hint_color) {
        root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
    }
    if (theme.link_color) {
        root.style.setProperty('--tg-theme-link-color', theme.link_color);
    }
    if (theme.button_color) {
        root.style.setProperty('--tg-theme-button-color', theme.button_color);
        root.style.setProperty('--tg-theme-accent', theme.button_color);
    }
    if (theme.button_text_color) {
        root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Model selection
    elements.modelInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            state.selectedModel = e.target.value;
            hapticFeedback('selection');
            
            // Visual feedback
            elements.modelCards.forEach(card => {
                card.classList.remove('selected');
            });
            e.target.closest('.model-card').classList.add('selected');
        });
    });
    
    // Model card click animation
    elements.modelCards.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.querySelector('.model-content').style.transform = 'scale(0.98)';
        });
        card.addEventListener('touchend', () => {
            card.querySelector('.model-content').style.transform = '';
        });
    });
    
    // Save button
    elements.saveButton.addEventListener('click', handleSave);
    
    // Buy Premium button
    elements.buyButton.addEventListener('click', handleBuyPremium);
}

// Handle save action
function handleSave() {
    hapticFeedback('impact');
    
    // Prepare data to send
    const data = {
        action: 'save_settings',
        model: state.selectedModel,
        timestamp: Date.now()
    };
    
    // Show loading state
    elements.saveButton.classList.add('loading');
    elements.saveButton.innerHTML = '<span>Сохранение...</span>';
    
    // Send data to bot
    if (tg) {
        try {
            tg.sendData(JSON.stringify(data));
            showToast('Настройки сохранены!');
        } catch (error) {
            console.error('Error sending data:', error);
            showToast('Ошибка сохранения');
        }
    } else {
        // Fallback for testing outside Telegram
        console.log('Data to send:', data);
        showToast('Настройки сохранены! (тест)');
    }
    
    // Reset button state
    setTimeout(() => {
        elements.saveButton.classList.remove('loading');
        elements.saveButton.innerHTML = `
            <span>Сохранить</span>
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }, 1000);
}

// Handle buy premium action
function handleBuyPremium() {
    hapticFeedback('impact');
    
    // Prepare purchase data
    const purchaseData = {
        action: 'buy_premium',
        price: 150,
        currency: 'stars',
        timestamp: Date.now()
    };
    
    // Visual feedback
    elements.buyButton.classList.add('loading');
    
    if (tg) {
        try {
            // Send purchase request to bot
            tg.sendData(JSON.stringify(purchaseData));
            
            // Close the WebApp after sending the command
            setTimeout(() => {
                tg.close();
            }, 500);
        } catch (error) {
            console.error('Error initiating purchase:', error);
            showToast('Ошибка оплаты');
            elements.buyButton.classList.remove('loading');
        }
    } else {
        // Fallback for testing
        console.log('Purchase data:', purchaseData);
        showToast('Переход к оплате... (тест)');
        
        setTimeout(() => {
            elements.buyButton.classList.remove('loading');
        }, 1000);
    }
}

// Setup Telegram main button (alternative to custom save button)
function setupMainButton() {
    if (!tg?.MainButton) return;
    
    // You can use MainButton as an alternative
    // tg.MainButton.setText('Сохранить');
    // tg.MainButton.show();
    // tg.MainButton.onClick(handleSave);
}

// Enable haptic feedback
function enableHapticFeedback() {
    if (!tg?.HapticFeedback) return;
    
    window.hapticFeedback = (type) => {
        switch (type) {
            case 'impact':
                tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'selection':
                tg.HapticFeedback.selectionChanged();
                break;
            case 'success':
                tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'error':
                tg.HapticFeedback.notificationOccurred('error');
                break;
        }
    };
}

// Haptic feedback wrapper
function hapticFeedback(type) {
    if (window.hapticFeedback) {
        window.hapticFeedback(type);
    }
}

// Show toast notification
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Hide toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Load saved preferences from localStorage
function loadPreferences() {
    try {
        const savedModel = localStorage.getItem('selectedModel');
        if (savedModel) {
            state.selectedModel = savedModel;
            const input = document.querySelector(`input[value="${savedModel}"]`);
            if (input) {
                input.checked = true;
            }
        }
    } catch (error) {
        console.log('Could not load preferences:', error);
    }
}

// Save preferences to localStorage
function savePreferences() {
    try {
        localStorage.setItem('selectedModel', state.selectedModel);
    } catch (error) {
        console.log('Could not save preferences:', error);
    }
}

// Animate elements on load
function animateOnLoad() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.4s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
}

// Update balance display
function updateBalance(newBalance) {
    state.balance = newBalance;
    elements.balance.textContent = `${newBalance} Stars`;
    
    // Animate balance change
    elements.balance.style.transform = 'scale(1.2)';
    setTimeout(() => {
        elements.balance.style.transform = 'scale(1)';
    }, 200);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Handle back button (if needed)
if (tg) {
    tg.BackButton.onClick(() => {
        // Save preferences before closing
        savePreferences();
        tg.close();
    });
}
