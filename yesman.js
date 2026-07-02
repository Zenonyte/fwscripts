// ==UserScript==
// @name         [RUBY] yesman
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Button for selecting the first option in all grading questions
// @include      /^https:\/\/r.*a.*tech\/?/
// @updateURL    https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/yesman.js
// @downloadURL  https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/yesman.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHJvbGU9ImltZyIgZm9jdXNhYmxlPSJmYWxzZSIgYXJpYS1oaWRkZW49InRydWUiIHZpZXdCb3g9IjAgMCAxNCAxNCI+PHBhdGggZmlsbD0iIzE2YTM0YSIgZD0iTTEzIDQuMTk3NHEwIC4zMDk3LS4yMTY3Ny41MjY1TDcuMTc4MDYgMTAuMzI5bC0xLjA1MjkgMS4wNTI5cS0uMjE2NzcuMjE2OC0uNTI2NDUuMjE2OC0uMzA5NjggMC0uNTI2NDUtLjIxNjhMNC4wMTkzNSAxMC4zMjkgMS4yMTY3NyA3LjUyNjRRMSA3LjMwOTcgMSA3dC4yMTY3Ny0uNTI2NWwxLjA1MjkxLTEuMDUyOXEuMjE2NzctLjIxNjcuNTI2NDUtLjIxNjcuMzA5NjggMCAuNTI2NDUuMjE2N2wyLjI3NjEzIDIuMjgzOSA1LjA3ODcxLTUuMDg2NHEuMjE2NzctLjIxNjguNTI2NDUtLjIxNjguMzA5NjggMCAuNTI2NDUuMjE2OGwxLjA1MjkxIDEuMDUyOVExMyAzLjg4NzcgMTMgNC4xOTc0eiIvPjwvc3ZnPg==
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    const BUTTON_TEXT = 'Fill all';
    const LOCK_KEY = 'gradingform_autolock';
    let isLocked = GM_getValue(LOCK_KEY, false);
    const LOCK_SVG = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10V8a6 6 0 1 1 12 0v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
        </svg>
    `;
    function fillFirstRadios(gradingForm) {
        gradingForm.querySelectorAll('app-question').forEach((q) => {
            const firstRadio = q.querySelector('input[type="radio"]');
            if (firstRadio && !firstRadio.checked) {
                firstRadio.click();
            }
        });
    }
    function addControls(gradingForm) {
        const questionsList = gradingForm.querySelector('app-questions-list');
        if (!questionsList || questionsList.dataset.autoBtnAdded) return;
        questionsList.dataset.autoBtnAdded = '1';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.borderRadius = '6px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.marginBottom = '8px';
       
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = BUTTON_TEXT;
        btn.className = 'btn btn-primary';
        btn.style.borderRadius = '0';
        btn.style.borderRight = '1px solid rgba(255,255,255,0.35)';
        btn.style.flex = '1';
        btn.style.textAlign = 'left';
        btn.addEventListener('click', () => fillFirstRadios(gradingForm));

        const lockBtn = document.createElement('button');
        lockBtn.type = 'button';
        lockBtn.className = 'btn btn-primary';
        lockBtn.innerHTML = LOCK_SVG;
        lockBtn.style.borderRadius = '0';
        lockBtn.style.width = '100px';
        lockBtn.style.flexShrink = '0';
        lockBtn.style.display = 'flex';
        lockBtn.style.alignItems = 'center';
        lockBtn.style.justifyContent = 'center';
        lockBtn.title = 'Auto-run on load';

        const renderLockIcon = () => {
            const icon = lockBtn.querySelector('svg');
            icon.style.color = isLocked ? '#ffd166' : 'transparent';
            icon.style.transition = 'color 0.15s ease';
        };
        renderLockIcon();
        lockBtn.addEventListener('click', () => {
            isLocked = !isLocked;
            GM_setValue(LOCK_KEY, isLocked);
            renderLockIcon();
        });
        wrapper.append(btn, lockBtn);
        questionsList.parentElement.insertBefore(wrapper, questionsList);
        if (isLocked) {
            fillFirstRadios(gradingForm);
        }
    }
    const start = () => {
        new MutationObserver(() => {
            document.querySelectorAll('app-gradingform').forEach((form) => {
                if (!form.dataset.pinged) {
                    form.dataset.pinged = '1';
                    console.log('[GradingForm] appeared:', form);
                }
                addControls(form);
            });
        }).observe(document.querySelector('app-layout') || document.body, {
            childList: true,
            subtree: true,
        });
    };

    document.body ? start() : document.addEventListener('DOMContentLoaded', start);
})();
