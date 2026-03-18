// ==UserScript==
// @name         [RUBY] Valuelock beta
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  kesse viitsib koike manuaalselt sättida kui asjad samad on
// @author       MINNNAAAAA (also stackoverflow) ((godsend))
// @include      /^https:\/\/r.*a.*tech\/?/
// @updateURL    https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/valuelock.js
// @downloadURL  https://raw.githubusercontent.com/Zenonyte/fwscripts/refs/heads/main/valuelock.js
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgRnJlZSA3LjEuMCBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIChJY29uczogQ0MgQlkgNC4wLCBGb250czogU0lMIE9GTCAxLjEsIENvZGU6IE1JVCBMaWNlbnNlKSBDb3B5cmlnaHQgMjAyNSBGb250aWNvbnMsIEluYy4gLS0+PHBhdGggZmlsbD0iIzI4YTc0NSIgZD0iTTEyOCA5NmwwIDY0IDEyOCAwIDAtNjRjMC0zNS4zLTI4LjctNjQtNjQtNjRzLTY0IDI4LjctNjQgNjR6TTY0IDE2MGwwLTY0QzY0IDI1LjMgMTIxLjMtMzIgMTkyLTMyUzMyMCAyNS4zIDMyMCA5NmwwIDY0YzM1LjMgMCA2NCAyOC43IDY0IDY0bDAgMjI0YzAgMzUuMy0yOC43IDY0LTY0IDY0TDY0IDUxMmMtMzUuMyAwLTY0LTI4LjctNjQtNjRMMCAyMjRjMC0zNS4zIDI4LjctNjQgNjQtNjR6Ii8+PC9zdmc+
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
   'use strict';
   const STORAGE_KEY = 'bh_form_label_locks_v4';
   const LOCKABLE_FIELDS = [
       'Name',
       'Fault Description',
       'Additional Fault',
       'Additional Info',
       'Functionality',
       'Appearance',
       'Boxed',
       'Color',
       'Network Lock',
       'Cloud Lock',
       'Battery status',
       'Software',
       'Customized',
       'Manual Datawipe'
   ];
   // script huiama hakkab ss saab delaysid tsipa mudida
   const RESPECT_EXISTING_VALUES = true;
   const WIRE_INTERVAL_MS        = 100;
   const INITIAL_RESTORE_WAIT    = 100;
   const DROPDOWN_ENTER_DELAY    = 100;
   const DROPDOWN_CLICK_DELAY    = 100;
   const RESTORE_CONFIRM_DELAY   = 100;
   const RADIO_CONFIRM_DELAY     = 100;
   const NAME_POLL_INTERVAL      = 300;
   const NAME_POLL_MAX_TRIES     = 40;
   const NAME_OPTION_POLL_MS     = 200;
   const NAME_OPTION_POLL_MAX    = 25;
   const NAME_LABEL = 'Name';
   // ranked queue
   let restoreQueue = [];
   let restoreInProgress = false;
   let allLocks = {};
   try {
       const raw = GM_getValue(STORAGE_KEY, '{}');
       allLocks = JSON.parse(raw || '{}');
   } catch (e) {
       allLocks = {};
   }
   console.log('[BH LOCK] Loaded locks:', allLocks);
   function saveAllLocks() {
       GM_setValue(STORAGE_KEY, JSON.stringify(allLocks));
   }
   function getFieldName(row) {
       const label = row.querySelector('label.fw-stronger');
       return label ? label.textContent.replace('*', '').trim() : null;
   }
   function readValueFromRow(row) {
       const fieldName = getFieldName(row);
       if (fieldName === NAME_LABEL) {
           const ngVal = row.querySelector('.ng-value-label');
           if (ngVal && ngVal.textContent.trim()) return ngVal.textContent.trim();
           const input = row.querySelector('input');
           if (input && input.value.trim()) return input.value.trim();
           return null;
       }
       const ngLabel = row.querySelector('.ng-value-label');
       if (ngLabel && ngLabel.textContent.trim()) {
           return ngLabel.textContent.trim();
       }
       const checked = row.querySelector('input[type="radio"]:checked');
       if (checked) {
           const rLabel = checked.closest('label');
           if (rLabel) return rLabel.textContent.trim();
       }
       return null;
   }
   function fieldIsEmpty(row) {
       const v = readValueFromRow(row);
       return !v || v === '(none)' || v === '(empty)';
   }
   function setFieldDisabled(row, disabled) {
       const fieldName = getFieldName(row);
       if (fieldName === NAME_LABEL) {
           const input = row.querySelector('input');
           if (input) input.disabled = disabled;
           return;
       }
       const ngSelect = row.querySelector('ng-select');
       if (ngSelect) {
           const input = ngSelect.querySelector('input');
           if (input) input.disabled = disabled;
           if (disabled) ngSelect.classList.add('bh-locked');
           else ngSelect.classList.remove('bh-locked');
       }
       const radios = row.querySelectorAll('input[type="radio"]');
       radios.forEach(r => r.disabled = disabled);
   }
   function applyLabelStyle(label, locked) {
       const icon = label.querySelector('.bh-label-lock-icon');
       if (locked) {
           label.style.backgroundColor = 'rgba(25, 135, 84, 0.15)';
           label.style.color = '#28a745';
           if (icon) {
               icon.style.opacity = '1';
               icon.style.color = 'rgba(25, 135, 84, 0.25)';
           }
       } else {
           label.style.backgroundColor = 'transparent';
           label.style.color = '';
           if (icon) {
               icon.style.opacity = '0';
           }
       }
   }
   function restoreRadioButtons(row, fieldName, lockedValue) {
       const group = row.querySelector('.radio-buttons-field .check-radio-group');
       if (!group) return false;
       let restored = false;
       group.querySelectorAll('input[type="radio"]').forEach(radio => {
           const rLabel = radio.closest('label');
           const text = rLabel ? rLabel.textContent.trim() : '';
           if (text === lockedValue) {
               if (!radio.checked) {
                   radio.click();
                   radio.dispatchEvent(new Event('change', { bubbles: true }));
                   console.log(`[VALUELOCK] Radio restored: ${fieldName} = "${lockedValue}"`);
               }
               restored = true;
           }
       });
       return restored;
   }
   function restoreDropdown(row, fieldName, lockedValue) {
       const ngSelect = row.querySelector('ng-select');
       if (!ngSelect || ngSelect.classList.contains('ng-select-disabled')) return false;
       const input = ngSelect.querySelector('input');
       if (!input) return false;
       console.log(`[VALUELOCK] Restoring dropdown ${fieldName} = "${lockedValue}"`);
       input.focus();
       input.value = lockedValue;
       input.dispatchEvent(new Event('input', { bubbles: true }));
       setTimeout(() => {
           input.dispatchEvent(new KeyboardEvent('keydown', {
               key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true
           }));
           setTimeout(() => {
               ngSelect.querySelectorAll('.ng-option').forEach(opt => {
                   if (opt.textContent.trim() === lockedValue) {
                       opt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                       console.log(`[VALUELOCK] Dropdown restored by click: ${fieldName}`);
                   }
               });
           }, DROPDOWN_CLICK_DELAY);
       }, DROPDOWN_ENTER_DELAY);
       return true;
   }
   function restoreNameField(row, lockedValue, done) {
       const input = row.querySelector('input');
       const ngSelect = row.querySelector('ng-select');
       if (!input || !ngSelect) {
           done();
           return;
       }
       let tries = 0;
       const timer = setInterval(() => {
           tries++;
           if (!input.disabled) {
               const current = input.value.trim();
               if (RESPECT_EXISTING_VALUES && current && current !== lockedValue) {
                   console.log(`[VALUELOCK] Name: skipping restore (existing "${current}" != locked "${lockedValue}")`);
                   clearInterval(timer);
                   done();
                   return;
               }
               input.focus();
               input.value = lockedValue;
               input.dispatchEvent(new Event('input', { bubbles: true }));
               console.log(`[VALUELOCK] Name typed: "${lockedValue}", now waiting for options`);
               let optTries = 0;
               const optTimer = setInterval(() => {
                   optTries++;
                   const panel = document.querySelector('ng-dropdown-panel');
                   if (panel) {
                       const options = panel.querySelectorAll('.ng-option');
                       for (const opt of options) {
                           const txt = opt.textContent.trim();
                           if (txt === lockedValue) {
                               opt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                               console.log(`[VALUELOCK] Name option clicked: "${lockedValue}"`);
                               clearInterval(optTimer);
                               done();
                               return;
                           }
                       }
                   }
                   if (optTries >= NAME_OPTION_POLL_MAX) {
                       console.warn('[VALUELOCK] Name option not found in time');
                       clearInterval(optTimer);
                       done();
                   }
               }, NAME_OPTION_POLL_MS);
               clearInterval(timer);
           } else if (tries >= NAME_POLL_MAX_TRIES) {
               console.warn('[VALUELOCK] Name restore timeout, giving up this run');
               clearInterval(timer);
               done();
           }
       }, NAME_POLL_INTERVAL);
   }
   // fuck javascript
   function attemptRestoreOrUnlockQueued(entry, done) {
       const { row, label, icon, fieldName, lockedValue } = entry;
       if (row.dataset.bhRestoreDone === '1') {
           done();
           return;
       }
       row.dataset.bhRestoreDone = '1';
       if (fieldName === NAME_LABEL) {
           if (RESPECT_EXISTING_VALUES) {
               const before = readValueFromRow(row);
               if (before && before !== lockedValue) {
                   console.log(`[VALUELOCK] Name: skipping restore (existing "${before}" != locked "${lockedValue}")`);
                   done();
                   return;
               }
           }
           restoreNameField(row, lockedValue, done);
           return;
       }
       if (RESPECT_EXISTING_VALUES) {
           const before = readValueFromRow(row);
           if (before && before !== lockedValue) {
               console.log(`[VALUELOCK] Skipping restore for ${fieldName} (existing "${before}" != locked "${lockedValue}")`);
               done();
               return;
           }
       }
       let radioOk = restoreRadioButtons(row, fieldName, lockedValue);
       let dropdownAttempted = false;
       if (!radioOk) dropdownAttempted = restoreDropdown(row, fieldName, lockedValue);
       const delay = dropdownAttempted ? RESTORE_CONFIRM_DELAY : RADIO_CONFIRM_DELAY;
       setTimeout(() => {
           const current = readValueFromRow(row);
           if (current === lockedValue) {
               setFieldDisabled(row, true);
               console.log(`[VALUELOCK] Restore confirmed for ${fieldName}`);
           } else {
               if (!RESPECT_EXISTING_VALUES || fieldIsEmpty(row)) {
                   //sen bugged aga TARGET OOTAB nii et fixin hiljemalt 2030 k ty
                   //delete allLocks[fieldName];
                   //saveAllLocks();
                   //applyLabelStyle(label, false);
                   //setFieldDisabled(row, false);
                   console.warn(`[VALUELOCK] Auto-unlocked ${fieldName} – value "${lockedValue}" not available`);
               } else {
                   console.log(`[VALUELOCK] Leaving ${fieldName} locked but not overwritten (current "${current}" != "${lockedValue}")`);
               }
           }
           done();
       }, delay);
   }
   //aids1
   function processNextRestore() {
       if (restoreInProgress) return;
       const next = restoreQueue.shift();
       if (!next) return;
       restoreInProgress = true;
       attemptRestoreOrUnlockQueued(next, () => {
           restoreInProgress = false;
           setTimeout(processNextRestore, 150);
       });
   }
   function wireLabelsOnce() {
       const roots = [
           document.querySelector('app-item-form'),
           document.querySelector('app-test-plan-form')
       ];
       roots.forEach(root => {
           if (!root) return;
           const rows = root.querySelectorAll('.form-field__row.horizontal');
           rows.forEach(row => {
               const label = row.querySelector('label.fw-stronger');
               if (!label) return;
               const fieldName = label.textContent.replace('*', '').trim();
               if (!LOCKABLE_FIELDS.includes(fieldName)) return;
               if (label.dataset.bhLockWired === '1') return;
               label.dataset.bhLockWired = '1';
               label.style.cursor = 'pointer';
               label.style.userSelect = 'none';
               label.style.display = 'inline-flex';
               label.style.alignItems = 'center';
               label.style.gap = '4px';
               label.style.padding = '2px 8px';
               label.style.borderRadius = '999px';
               label.style.transition = 'background-color 0.2s ease, color 0.2s ease';
               const icon = document.createElement('i');
               icon.className = 'bh-label-lock-icon fa fa-lock';
               icon.style.fontSize = '11px';
               icon.style.opacity = '0';
               icon.style.transition = 'opacity 0.15s ease';
               icon.style.marginLeft = '2px';
               label.appendChild(icon);
               const lockedInitial = allLocks[fieldName] !== undefined;
               applyLabelStyle(label, lockedInitial);
               if (lockedInitial) {
                   const lockedValue = allLocks[fieldName];
                   restoreQueue.push({ row, label, icon, fieldName, lockedValue });
                   setTimeout(processNextRestore, INITIAL_RESTORE_WAIT);
               }
               label.addEventListener('click', e => {
                   e.preventDefault();
                   e.stopPropagation();
                   const isLocked = allLocks[fieldName] !== undefined;
                   if (isLocked) {
                       delete allLocks[fieldName];
                       saveAllLocks();
                       applyLabelStyle(label, false);
                       setFieldDisabled(row, false);
                       delete row.dataset.bhRestoreDone;
                       console.log('[VALUELOCK] UNLOCKED via label:', fieldName);
                   } else {
                       const currentValue = readValueFromRow(row);
                       if (!currentValue) {
                           alert(`Select a value for "${fieldName}" first`);
                           return;
                       }
                       allLocks[fieldName] = currentValue;
                       saveAllLocks();
                       applyLabelStyle(label, true);
                       setFieldDisabled(row, true);
                       console.log('[VALUELOCK] LOCKED via label:', fieldName, '=', currentValue);
                   }
               });
           });
       });
   }
   console.log('[VALUELOCK] Serialized label locks active; RESPECT_EXISTING_VALUES =', RESPECT_EXISTING_VALUES);
   setInterval(wireLabelsOnce, WIRE_INTERVAL_MS);
})();
