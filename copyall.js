// ==UserScript==
// @name         [DLC] Copy all
// @namespace    http://tampermonkey.net/
// @version      0.0.0.0.0.0.0.0.0.0.0000001
// @description  sest ükshaaval copymine on nõme
// @author       jah
// @include      /^https:\/\/d.*o.*a.*y.*com\/?/
// @updateURL    https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/copyall.js
// @downloadURL  https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/copyall.js
// @icon         data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSItMi40IC0yLjQgMjguOCAyOC44IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0cm9rZT0iIzU3ZmZkZCIgY29sb3I9InJnYig4NywgMjU1LCAyMjEpIj48ZyBpZD0iU1ZHUmVwb19iZ0NhcnJpZXIiIHN0cm9rZS13aWR0aD0iMCI+PC9nPjxnIGlkPSJTVkdSZXBvX3RyYWNlckNhcnJpZXIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9nPjxnIGlkPSJTVkdSZXBvX2ljb25DYXJyaWVyIj48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPiA8cGF0aCBkPSJNNi41OTk2MSAxMS4zOTc0QzYuNTk5NjEgOC42NzExOSA2LjU5OTYxIDcuMzA4MSA3LjQ0MzE0IDYuNDYxMThDOC4yODY2NyA1LjYxNDI2IDkuNjQ0MzIgNS42MTQyNiAxMi4zNTk2IDUuNjE0MjZIMTUuMjM5NkMxNy45NTQ5IDUuNjE0MjYgMTkuMzEyNSA1LjYxNDI2IDIwLjE1NjEgNi40NjExOEMyMC45OTk2IDcuMzA4MSAyMC45OTk2IDguNjcxMiAyMC45OTk2IDExLjM5NzRWMTYuMjE2N0MyMC45OTk2IDE4Ljk0MjkgMjAuOTk5NiAyMC4zMDYgMjAuMTU2MSAyMS4xNTI5QzE5LjMxMjUgMjEuOTk5OCAxNy45NTQ5IDIxLjk5OTggMTUuMjM5NiAyMS45OTk4SDEyLjM1OTZDOS42NDQzMiAyMS45OTk4IDguMjg2NjcgMjEuOTk5OCA3LjQ0MzE0IDIxLjE1MjlDNi41OTk2MSAyMC4zMDYgNi41OTk2MSAxOC45NDI5IDYuNTk5NjEgMTYuMjE2N1YxMS4zOTc0WiIgZmlsbD0iIzU3ZmZkZCI+PC9wYXRoPiA8cGF0aCBvcGFjaXR5PSIwLjUiIGQ9Ik00LjE3MTU3IDMuMTcxNTdDMyA0LjM0MzE1IDMgNi4yMjg3NiAzIDEwVjEyQzMgMTUuNzcxMiAzIDE3LjY1NjkgNC4xNzE1NyAxOC44Mjg0QzQuNzg5MTMgMTkuNDQ2IDUuNjA1MSAxOS43MzggNi43OTEwNSAxOS44NzYxQzYuNTk5NjEgMTkuMDM1MyA2LjU5OTYxIDE3Ljg3OTYgNi41OTk2MSAxNi4yMTY3VjExLjM5NzRDNi41OTk2MSA4LjY3MTIgNi41OTk2MSA3LjMwODEgNy40NDMxNCA2LjQ2MTE4QzguMjg2NjcgNS42MTQyNiA5LjY0NDMyIDUuNjE0MjYgMTIuMzU5NiA1LjYxNDI2SDE1LjIzOTZDMTYuODkxNSA1LjYxNDI2IDE4LjA0MDkgNS42MTQyNiAxOC44Nzc3IDUuODA0OTRDMTguNzQwMyA0LjYxMTQ2IDE4LjQ0ODQgMy43OTE1NCAxNy44Mjg0IDMuMTcxNTdDMTYuNjU2OSAyIDE0Ljc3MTIgMiAxMSAyQzcuMjI4NzYgMiA1LjM0MzE1IDIgNC4xNzE1NyAzLjE3MTU3WiIgZmlsbD0iIzU3ZmZkZCI+PC9wYXRoPiA8L2c+PC9zdmc+
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const BUTTON_ID = 'copyAllImeisBtn';

    function getVisibleImeis() {
        const imeis = [];

        document.querySelectorAll('#resultsTableBody tr').forEach((row) => {
            if (row.hidden || getComputedStyle(row).display === 'none') {
                return;
            }

            const imeiCell = row.querySelector('td');
            const imei = imeiCell ? imeiCell.textContent.trim() : '';

            if (imei) {
                imeis.push(imei);
            }
        });

        return imeis;
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();

            let copied = false;
            try {
                copied = document.execCommand('copy');
            } finally {
                textarea.remove();
            }

            if (copied) {
                resolve();
            } else {
                reject(new Error('Copy failed'));
            }
        });
    }

    function addCopyButton() {
        const filterMenu = document.getElementById('filterMenu');
        if (!filterMenu || document.getElementById(BUTTON_ID)) {
            return;
        }

        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.type = 'button';
        button.className = 'btn-secondary';
        button.textContent = 'Copy all';

        button.addEventListener('click', async () => {
            const imeis = getVisibleImeis();
            if (imeis.length === 0) {
                button.textContent = 'No IMEIs';
                setTimeout(() => {
                    button.textContent = 'Copy all';
                }, 1500);
                return;
            }

            try {
                await copyText(imeis.join('\n'));
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy all';
                }, 1500);
            } catch (error) {
                button.textContent = 'Copy failed';
                setTimeout(() => {
                    button.textContent = 'Copy all';
                }, 1500);
                console.error('[DLC Copy all] ', error);
            }
        });

        filterMenu.insertAdjacentElement('afterend', button);
    }

    addCopyButton();

    const observer = new MutationObserver(addCopyButton);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
