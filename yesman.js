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
   function fillFirstRadios(gradingForm) {
       const questions = gradingForm.querySelectorAll('app-question');
       questions.forEach((q) => {
           const firstRadio = q.querySelector('input[type="radio"]');
           if (firstRadio && !firstRadio.checked) {
               firstRadio.click();
           }
       });
   }
   function addButton(gradingForm) {
       const questionsList = gradingForm.querySelector('app-questions-list');
       if (!questionsList || questionsList.dataset.autoBtnAdded) return;
       questionsList.dataset.autoBtnAdded = '1';
       const btn = document.createElement('button');
       btn.type = 'button';
       btn.textContent = BUTTON_TEXT;
       btn.className = 'btn btn-primary mb-2';
       btn.addEventListener('click', () => fillFirstRadios(gradingForm));
       questionsList.parentElement.insertBefore(btn, questionsList);
   }
   const start = () => {
       new MutationObserver(() => {
           document.querySelectorAll('app-gradingform').forEach((form) => {
               if (!form.dataset.pinged) {
                   form.dataset.pinged = '1';
                   console.log('[GradingForm]:', form);
               }
               addButton(form);
           });
       }).observe(document.querySelector('app-layout') || document.body, {
           childList: true,
           subtree: true,
       });
   };
   document.body ? start() : document.addEventListener('DOMContentLoaded', start);
})();
