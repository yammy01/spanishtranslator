const translate = document.getElementById('translator');
const toTranslate = document.getElementById('spanishtext');
const translation = document.getElementById('translation');
const translationLink = document.getElementById('translationLink');
const wordTable = document.getElementById('list');
let port;

function addPort() {
    port = chrome.runtime.connect({name : 'extension'});
}

function translatePhrase (textToTranslate) {
    return new Promise((resolve, reject) => {
        if (!port) {
            addPort();
        }
        port.onMessage.addListener(function handleMsg(msg) {
            port.onMessage.removeListener(handleMsg);
            resolve(msg);
        });
        port.postMessage({
            task : 'translate',
            text : textToTranslate
        });
    })
}

translate.addEventListener('submit', (event) => {
    event.preventDefault();
    const newWord = document.createElement('li');

    if (toTranslate.value) {
        let translatedText;
        translatePhrase(toTranslate.value)
        .then(resolve => {
            translatedText = resolve;
            translation.innerHTML = toTranslate.value + ' means ' + translatedText;
            newWord.innerHTML = toTranslate.value + ';' + translatedText;
        }).catch(err => {
            console.log(err);
        })
        translationLink.innerHTML = "Here's a link to spanishdict.";
        translationLink.href = 'https://www.spanishdict.com/translate/' + toTranslate.value;
        wordTable.appendChild(newWord);
    } else {
        translation.innerHTML = "You didn't input anything.";
    }
});

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'vocabtransfer') {
        port.onMessage.addListener(msg => {
            const newWord = document.createElement('li');
            newWord.innerHTML = msg.word + ';' + msg.answer;
            wordTable.appendChild(newWord);
        });
    }
});
