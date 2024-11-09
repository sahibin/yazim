// yazim_kurallari.json dosyası aynı kalacak, değişiklik yok

// index.html dosyası aynı kalacak, değişiklik yok

// script.js - Güncellenmiş versiyon
let sentences = []; // Boş array ile başlat
let currentSentenceIndex = 0;

// DOM elementlerini seçme
const sentenceElement = document.getElementById('sentence');
const feedbackElement = document.getElementById('feedback');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const currentIndexElement = document.getElementById('currentIndex');
const totalSentencesElement = document.getElementById('totalSentences');
const addButton = document.getElementById('addButton');
const editButton = document.getElementById('editButton');
const deleteButton = document.getElementById('deleteButton');
const exportButton = document.getElementById('exportButton');
const importButton = document.getElementById('importButton');
const modal = document.getElementById('sentenceModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const sentenceForm = document.getElementById('sentenceForm');
const sentenceText = document.getElementById('sentenceText');
const errorList = document.getElementById('errorList');
const addErrorButton = document.getElementById('addErrorButton');
const modalCloseButton = document.getElementById('modalCloseButton');
const modalCancelButton = document.getElementById('modalCancelButton');
const fileInput = document.getElementById('fileInput');

// JSON dosyasından verileri yükle
async function loadSentences() {
    try {
        const response = await fetch('yazim_kurallari.json');
        if (!response.ok) {
            throw new Error('JSON dosyası yüklenemedi');
        }
        const data = await response.json();
        sentences = data;
        currentSentenceIndex = 0;
        displaySentence();
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        sentences = [{
            text: 'Veri yüklenirken hata oluştu.',
            errors: []
        }];
        displaySentence();
    }
}

// Cümleyi ekrana yazdırma
function displaySentence() {
    const currentSentence = sentences[currentSentenceIndex];
    if (!currentSentence) return;

    const words = currentSentence.text.split(' ');
    
    sentenceElement.innerHTML = words.map(word => 
        `<span class="word">${word}</span>`
    ).join(' ');

    document.querySelectorAll('.word').forEach(wordElement => {
        wordElement.addEventListener('click', () => checkWord(wordElement.textContent));
    });

    currentIndexElement.textContent = currentSentenceIndex + 1;
    totalSentencesElement.textContent = sentences.length;

    feedbackElement.style.display = 'none';
    feedbackElement.textContent = '';
}

// Kelime kontrolü
function checkWord(clickedWord) {
    const currentSentence = sentences[currentSentenceIndex];
    const errors = currentSentence.errors.filter(error => 
        error.word.toLowerCase() === clickedWord.toLowerCase() ||
        error.word.toLowerCase().includes(clickedWord.toLowerCase())
    );

    feedbackElement.style.display = 'block';

    if (errors.length > 0) {
        feedbackElement.innerHTML = errors.map(error => `
            <div>
                <span class="error">Yazım hatası!</span><br>
                Doğru yazımı: <span class="correct">${error.correct}</span><br>
                ${error.explanation}
            </div>
        `).join('<hr>');
    } else {
        feedbackElement.innerHTML = `
            <span class="correct">Bu sözcükte yazım hatası yok.</span>
        `;
    }
}

// Modal işlemleri
function showModal() {
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
    clearModalForm();
}

// Hata girişi oluşturma
function createErrorEntry(error = { word: '', correct: '', explanation: '' }) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-item';
    errorDiv.innerHTML = `
        <div class="form-group">
            <label>Hatalı Kelime:</label>
            <input type="text" class="error-word" value="${error.word}" required>
        </div>
        <div class="form-group">
            <label>Doğru Yazımı:</label>
            <input type="text" class="error-correct" value="${error.correct}" required>
        </div>
        <div class="form-group">
            <label>Açıklama:</label>
            <textarea class="error-explanation" required>${error.explanation}</textarea>
        </div>
        <button type="button" class="admin-button remove-error">
            <i class="fas fa-trash"></i> Hatayı Sil
        </button>
    `;

    errorDiv.querySelector('.remove-error').addEventListener('click', () => {
        errorDiv.remove();
    });

    return errorDiv;
}

// Form verilerini toplama
function collectFormData() {
    const errors = [];
    document.querySelectorAll('.error-item').forEach(item => {
        errors.push({
            word: item.querySelector('.error-word').value,
            correct: item.querySelector('.error-correct').value,
            explanation: item.querySelector('.error-explanation').value
        });
    });

    return {
        text: sentenceText.value,
        errors: errors
    };
}

// Modal açma
function openModal(title, editIndex = -1) {
    modalTitle.textContent = title;
    errorList.innerHTML = '';
    
    if (editIndex >= 0) {
        const sentence = sentences[editIndex];
        sentenceText.value = sentence.text;
        sentence.errors.forEach(error => {
            errorList.appendChild(createErrorEntry(error));
        });
    } else {
        sentenceText.value = '';
        errorList.appendChild(createErrorEntry());
    }

    showModal();
}

// Form temizleme
function clearModalForm() {
    sentenceText.value = '';
    errorList.innerHTML = '';
    errorList.appendChild(createErrorEntry());
}

// Event Listeners
prevButton.addEventListener('click', () => {
    if (currentSentenceIndex > 0) {
        currentSentenceIndex--;
        displaySentence();
    }
});

nextButton.addEventListener('click', () => {
    if (currentSentenceIndex < sentences.length - 1) {
        currentSentenceIndex++;
        displaySentence();
    }
});

addButton.addEventListener('click', () => {
    openModal('Cümle Ekle');
});

editButton.addEventListener('click', () => {
    openModal('Cümle Düzenle', currentSentenceIndex);
});

deleteButton.addEventListener('click', () => {
    if (confirm('Bu cümleyi silmek istediğinizden emin misiniz?')) {
        sentences.splice(currentSentenceIndex, 1);
        if (currentSentenceIndex >= sentences.length) {
            currentSentenceIndex = sentences.length - 1;
        }
        if (sentences.length === 0) {
            sentences = [{ text: 'Lütfen yeni cümle ekleyin.', errors: [] }];
            currentSentenceIndex = 0;
        }
        displaySentence();
    }
});

addErrorButton.addEventListener('click', () => {
    const errorEntry = createErrorEntry();
    errorList.appendChild(errorEntry);
    errorEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

modalCloseButton.addEventListener('click', hideModal);
modalCancelButton.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) hideModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideModal();
    }
});

sentenceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const inputs = sentenceForm.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            input.addEventListener('input', () => {
                input.classList.remove('error');
            }, { once: true });
        }
    });

    if (!isValid) {
        const firstError = sentenceForm.querySelector('.error');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    const formData = collectFormData();
    
    if (modalTitle.textContent === 'Cümle Düzenle') {
        sentences[currentSentenceIndex] = formData;
    } else {
        sentences.push(formData);
        currentSentenceIndex = sentences.length - 1;
    }

    displaySentence();
    hideModal();
});

exportButton.addEventListener('click', () => {
    const data = JSON.stringify(sentences, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yazim_kurallari.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

importButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedSentences = JSON.parse(event.target.result);
                if (Array.isArray(importedSentences)) {
                    sentences = importedSentences;
                    currentSentenceIndex = 0;
                    displaySentence();
                    alert('Cümleler başarıyla içe aktarıldı!');
                }
            } catch (error) {
                alert('Geçersiz dosya formatı!');
            }
        };
        reader.readAsText(file);
    }
});

// Mobil için dokunma olayları
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('blur', () => {
        window.scrollTo(0, 0);
    });
});

// Sayfa yüklendiğinde verileri yükle
document.addEventListener('DOMContentLoaded', loadSentences);
