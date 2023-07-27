let injectElement;
let tooltip;
let linkToElement;
let nextLine;
let nextLine2;
let submitForm;
let submitButton;
let textToTranslate;
let translationOfPhrase;
let firstSpan;
let secondSpan;
let thirdSpan;
let translation;
let port;

function addPort() {
    port = chrome.runtime.connect({name : 'webpage'});
}

function translatePhrase () {
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

function deleteAddedElement() {
    tooltip.removeChild(nextLine2);
    submitForm.removeChild(submitButton);
    tooltip.removeChild(submitForm);
    tooltip.removeChild(nextLine);
    tooltip.removeChild(linkToElement);
    translationOfPhrase.removeChild(thirdSpan);
    translationOfPhrase.removeChild(secondSpan);
    translationOfPhrase.removeChild(firstSpan);
    tooltip.removeChild(translationOfPhrase);
    injectElement.removeChild(tooltip);
    let parentNode = injectElement.parentNode;
    while (injectElement.firstChild) {
        parentNode.insertBefore(injectElement.firstChild, injectElement);
    }
    parentNode.removeChild(injectElement);
};

function replaceText () {

};

//if text was highlighted
document.addEventListener('mouseup', () => {
    if (window.getSelection() != "") {
            textToTranslate = window.getSelection().toString();

            //adds span element to cover text that was highlighted
            injectElement = document.createElement('span');
            injectElement.className = 'translatedText';
            let selection = window.getSelection().getRangeAt(0);
            selection.surroundContents(injectElement);
            
            //creates the tooltip for the span element
            tooltip = document.createElement('span');
            tooltip.className = 'translation';
            tooltip.innerHTML = `Now translating ${textToTranslate} to English.`;
            injectElement.appendChild(tooltip);

            //adds the translation for the text
            translatePhrase()
            .then(resolve => {
                translation = resolve;
                firstSpan.innerHTML = textToTranslate;
                thirdSpan.innerHTML = translation;
            }).catch(err => {
                console.log(err);
            });
            firstSpan = document.createElement('span');
            secondSpan = document.createElement('span');
            thirdSpan = document.createElement('span');
            firstSpan.className = 'wordsInTranslation';
            thirdSpan.className = 'wordsInTranslation';
            secondSpan.innerHTML = ' means ';
            translationOfPhrase = document.createElement('p');
            translationOfPhrase.appendChild(firstSpan);
            translationOfPhrase.appendChild(secondSpan);
            translationOfPhrase.appendChild(thirdSpan);

            tooltip.appendChild(translationOfPhrase);
            //adds the link that translates the text in the span
            linkToElement = document.createElement('a');
            linkToElement.innerHTML = 'Translation';
            linkToElement.href = 'https://www.spanishdict.com/translate/' + textToTranslate;
            linkToElement.target = '_blank';
            window.getSelection().removeAllRanges();
            tooltip.appendChild(linkToElement);
            nextLine = document.createElement('br');
            tooltip.appendChild(nextLine);

            //add the submit button to submit text
            
            submitForm = document.createElement('form');
            submitForm.setAttribute('method', 'get');
            tooltip.append(submitForm);

            submitButton = document.createElement('input');
            submitButton.setAttribute('type', 'submit');
            submitButton.setAttribute('name', 'add');
            submitForm.appendChild(submitButton);

            nextLine2 = document.createElement('br');
            tooltip.appendChild(nextLine2);
            

    }
});

document.addEventListener('submit', event => {
    event.preventDefault();
    if (!port) {
        addPort();
    }
    port.postMessage({
        task : 'add',
        text : textToTranslate,
        translation: translation
    });
    port.onMessage.addListener(msg => {
        console.log(msg);
    })
    
});

document.addEventListener('mousedown', event => {
    if (event.target === injectElement || event.target === tooltip || event.target === linkToElement || event.target === nextLine || event.target === submitButton || event.target === submitForm) {
        return;
    }
    deleteAddedElement();
});