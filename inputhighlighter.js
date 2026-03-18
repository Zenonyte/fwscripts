// ==UserScript==
// @name         [RUBY] Identifer Input Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  mis loed sellest lae alla juba :3
// @include      /^https:\/\/r.*a.*tech\/?/
// @updateURL    https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/inputhighlighter.js
// @downloadURL  https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/inputhighlighter.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgRnJlZSA3LjEuMCBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIChJY29uczogQ0MgQlkgNC4wLCBGb250czogU0lMIE9GTCAxLjEsIENvZGU6IE1JVCBMaWNlbnNlKSBDb3B5cmlnaHQgMjAyNSBGb250aWNvbnMsIEluYy4gLS0+PHBhdGggZmlsbD0iI0Q5MDAwMiIgZD0iTTE2NC4zIDY0TDEzOC43IDE5MiA1NiAxOTJjLTEzLjMgMC0yNC0xMC43LTI0LTI0bDAtNC4xYzAtMi42IC40LTUuMSAxLjItNy42TDU4LjUgODAuNEM2MS44IDcwLjYgNzEgNjQgODEuMyA2NGw4MyAwem0yMy40IDEyOGwyNS42LTEyOCA4Mi43IDAgMCAxMjgtMTA4LjMgMHpNMzQ0IDY0bDgyLjcgMCAxNiA4MGMtMTQuNyAuMi0yOS4zIDUuNS00MC45IDE1LjktMTEuNSAxMC4zLTIyLjUgMjEtMzIuOCAzMi4xbC0yNC45IDAgMC0xMjh6TTk2IDI0MGwyMzMuMiAwYy02LjQgOC44LTEyLjMgMTcuNi0xNy43IDI2LjMtMjEuNCAzNC43LTM5LjUgNzYuMS0zOS41IDExNS44IDAgMTcuMSAyLjEgMzMuOCA2IDQ5LjlsLTEyMC40IDAgMS45IDEwLjNjMy4yIDE3LjQtOC40IDM0LTI1LjggMzcuMnMtMzQtOC40LTM3LjItMjUuOEM3MSAzMTMuMyA1OCAyNDIuMSA1Ny43IDI0MEw5NiAyNDB6bTUxMi03MmMwIDExLTcuNCAyMC4zLTE3LjUgMjMuMS0uOS0uOC0xLjctMS42LTIuNi0yLjQtMjEuOC0yMC01NC4zLTIxLjgtNzgtNS41LTQuMi00LjMtOC41LTguNS0xMi45LTEyLjZsLTIxLjMtMTA2LjYgODMgMGMxMC4zIDAgMTkuNSA2LjYgMjIuOCAxNi40bDI1LjMgNzUuOWMuOCAyLjQgMS4yIDUgMS4yIDcuNmwwIDQuMXpNNTA1LjcgMjQwLjNMNTE4IDIyNi41YzUuNC02LjEgMTMuMy04LjggMjAuOS04LjkgNy4yIDAgMTQuMyAyLjYgMTkuOSA3LjggMTkuNyAxOC4zIDM5LjggNDMuMiA1NSA3MC42IDE1LjEgMjcuMiAyNi4yIDU4LjEgMjYuMiA4OC4xIDAgODguNy03MS4zIDE1OS44LTE2MCAxNTkuOC04OS42IDAtMTYwLTcxLjMtMTYwLTE1OS44IDAtMzcuMyAxNi03My40IDM2LjgtMTA0LjUgMjAuOS0zMS4zIDQ3LjUtNTkgNzAuOS04MC4yIDUuNy01LjIgMTMuMS03LjcgMjAuMy03LjVzMTMuNCAzLjIgMTguOCA3LjVjMTQuNCAxMS40IDM4LjkgNDAuNyAzOC45IDQwLjd6TTU0NCA0MzIuMmMwLTM2LjUtMzctNzMtNTQuOC04OC40LTUuNC00LjctMTMuMS00LjctMTguNSAwLTE3LjcgMTUuNC01NC44IDUxLjktNTQuOCA4OC40IDAgMzUuMyAyOC43IDY0IDY0IDY0czY0LTI4LjcgNjQtNjR6Ii8+PC9zdmc+
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function updateInputColor(input) {
        const val = input.value;
        if (/[a-zA-Z]/.test(val)) {
            input.style.backgroundColor = 'rgba(50, 100, 255, 0.2)'; //serial
        } else if (/^\d*$/.test(val)) {
            if (val.length < 15) {
                input.style.backgroundColor = 'rgba(255, 255, 50, 0.25)';
            } else if (val.length === 15) {
                input.style.backgroundColor = 'rgba(50, 230, 100, 0.18)';
            } else {
                input.style.backgroundColor = 'rgba(255, 50, 50, 0.19)';
            }
        } else {
            input.style.backgroundColor = '';
        }
    }

    function bindListener(input) {
        if (input._itemIdentifierListenerBound) return; // äkki bound juba idfk we live in a society or sum
        input.addEventListener('input', () => updateInputColor(input));
        updateInputColor(input);
        input._itemIdentifierListenerBound = true;
    }

    const observer = new MutationObserver(() => {
        const input = document.getElementById('itemIdentifier');
        if (input && !input._itemIdentifierListenerBound) {
            bindListener(input);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
