// ==UserScript==
// @name         Better diagdata
// @namespace    http://tampermonkey.net/
// @version      2025-06-17
// @description  gg
// @author       pragupea
// @match        https://ruby.foxway.tech/*
// @updateURL    https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/diagdata.js
// @downloadURL  https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/diagdata.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const config = { attributes: true, childList: true, subtree: true };
    const callback = (mutationList) => {
        const diagdata = document.querySelector('APP-DEVICE-DIAGNOSTIC-DATA');
        if (!diagdata) return; 
        let result = '';
        const rows = diagdata.querySelectorAll('div.row');
        rows.forEach((row) => {
            const text = row.textContent.trim();
            if (text.includes('Failed')) {
                result = 'F';
                const tests = row.querySelectorAll('li');
                tests.forEach((li) => {
                    const text = li.textContent.trim();
                    if (text.includes('Failed')) {
                        li.style.backgroundColor = '#ff8c66';//rrrrred aga heledam
                    }
                });
            }
            else if (text.includes('Disks')) {
                row.style.backgroundColor = '#8fff66';//geen.
            }
            else if (text.includes('Comment')) {
                row.style.backgroundColor = '#edff66';//yellw
                if (result == '') {
                    result = 'C';
                }
            };
        });
        console.log(result);
        switch (result) {
            case 'F':
                GM_addStyle(`
                    .diagnostic-data {
                    border: 4px solid #ff4000;
                    border-radius: 10px;
                    }`);//reeeeeeed
                break;
            case 'C':
                GM_addStyle(`
                    .diagnostic-data {
                    border: 4px solid #e1ff00;
                    border-radius: 10px;
                    }`);//yelllw
                break;
            default:
                GM_addStyle(`
                    .diagnostic-data {
                    border: 4px solid #44ff00;
                    border-radius: 10px;
                    }`);//geen.
                break;
        }
    };
    const checkDiag = () => {
        const diagdata = document.querySelector('APP-DEVICE-DIAGNOSTIC-DATA');
        if (!diagdata) return;

        // et härra ei reattachiks seda observerit GODDAMNIT
        if (diagdata.dataset.observed) return;

        console.log('omgitworkslol');
        diagdata.dataset.observed = 'true';

        const observer = new MutationObserver(callback);
        observer.observe(diagdata, config);
    };

    const bodyObserver = new MutationObserver(() => {
        checkDiag();//reactiga tehtud veebilehed on väga toredad
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });

    // äkki on somehow juba olemas?? never know :3
    checkDiag();
})();
