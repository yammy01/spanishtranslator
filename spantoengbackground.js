let mainPort;
const url = '';
const API_KEY = '';

function addPort() {
    mainPort = chrome.runtime.connect({name : 'vocabtransfer'});
}

async function translate (textToTranslate) {
    const response = await fetch(url + `?key=${API_KEY}&q=${textToTranslate}&source=es&target=en`, {
    
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: textToTranslate,
              source: 'es',
              target: 'en'
            })
        });
    const answer = await response.json();
    return answer.data.translations[0].translatedText;
}

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'webpage') {
        port.onMessage.addListener(msg => {
            if (msg.task === 'translate') {
                //run fetch
                translate(msg.text)
                .then(translatedText => {
                    port.postMessage(translatedText);
                }).catch(err => {
                    port.postMessage('Could not translate: ' + err);
                }) //replace msg.text with the actual translation
                
            } else if (msg.task === 'add') {
                if (!mainPort) {
                    addPort();
                }
                mainPort.postMessage({
                    word : msg.text,
                    //needs to be changed to the translation
                    answer : msg.translation
                })
            }
        });
    } else if (port.name === 'extension') {
        port.onMessage.addListener(msg => {
            if (msg.task === 'translate') {
                translate(msg.text)
                .then(translatedText => {
                    port.postMessage(translatedText);
                }).catch(err => {
                    port.postMessage('Could not translate: ' + err);
                })
            }
        })
    }
})
 

