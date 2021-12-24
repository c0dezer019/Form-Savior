/***********
 * Globals *
 ***********/

import injectButtons from './core/injectButtons';

const blacklistedUrls = getBlacklistedUrls();
// Which form fields not to save (passwords, emails, personal info, etc).
const blacklistedFormFields = getBlacklistedFormFields();
const forms = document.forms;
const urlsWithSavedData = [];
// Will not auto-save unless url is whitelisted.
const whitelistedUrls = getWhitelistedUrls();

let autoSave = 'false';
// The form the user is currently working on.
let currentlyActiveForm = 'none';

/*********************
 * Utility functions *
 *********************/

// Highlight fields that are not unique.
const highlightField = field => { }; 

// Allows user to custom tag fields if form fields are too generic.
const tagField = (element, err) => {
   let answer = prompt(`We cannot find a specific tag for this field with the value ${element.value}, please input one (i.e. email, username, etc)`);
};

// if data is missing.
const subData = () => { };

const checkFieldType = input => {
   switch (input.type) {
      case 'checkbox':
         return input.checked ? true : false;
      case 'radio':
         return input.checked ? input.value : false;
      default:
         return input.value;
   };
};

const findFieldName = input => {
   switch (input.name) {
      case '':
         subData(input);
         return `${input.name}`;
      default:
         return `${input.name}`;
   }
};

const getFormInputs = form => {
   return Object.values(form.getElementsByTagName('input'));
};

async function getBlacklistedUrls() {
   const arrayOfUrls = [];

   await chrome.storage.sync.get('settings', data => data.settings.blacklistedUrls.forEach(el => arrayOfUrls.push(el)));
   
   return arrayOfUrls;
}

async function getBlacklistedFormFields() {
   const arrayOfFields = [];
   
   await chrome.storage.sync.get('settings', data => data.settings.blacklistedFormFields.forEach(el => arrayOfFields.push(el)));

   return arrayOfFields;
}

async function getWhitelistedUrls() {
   const arrayOfUrls = [];

   await chrome.storage.sync.get('settings', data => data.settings.whitelistedUrls.forEach(el => arrayOfUrls.push(el)));

   return arrayOfUrls;
}


const processInputs = new Promise((resolve, reject) => {
   for (let i = 0; i < forms.length; i++) {
      setTimeout(() => { resolve(getFormInputs(forms[i])); }, 300);
   }
});
 
/******************
 * Core functions *
 ******************/

// Save form state.
const backupFormData = () => {
   if (forms.length === 0) {
      console.log('No forms to save');
      return;
   }

   const saveData = [];

   for (let i = 0; i < forms.length; i++) {
      processInputs
         .then(data => {
            data.forEach(input => {
               if (blacklistedFormFields.find(blacklistedItem => blacklistedItem === input)) return;
   
               saveData.push({
                  fieldName: findFieldName(input),
                  fieldValue: checkFieldType(input),
               });
   
               if (!saveData[i].fieldValue) {
                  try {
                     delete saveData[i];
                  }
                  catch (err) {
                     console.log(err);
                  }
               }
            });
         });
   }

};

processInputs.then(inputs => {
   inputs.forEach(input => {
      input.addEventListener('change', () => {})
   })
})

const injectButtons = () => {
   if (document.getElementsByClassName('formSaviorButtons').length > 0) return;

   forms.forEach(el => {
      const btnContainer = document.createElement('div');
      const restoreBtn = document.createElement('button');
      const saveFormBtn = document.createElement('button');

      btnContainer.classList.add('formSaviorButtons');

      restoreBtn.classList.add('restoreBtn');
      restoreBtn.setAttribute('name', 'restoreForm');
      restoreBtn.setAttribute('type', 'button');
      restoreBtn.id = 'restoreBtn';
      restoreBtn.innerHTML = 'Restore';

      saveFormBtn.classList.add('formSaviorButtons');
      saveFormBtn.setAttribute('name', 'saveForm');
      saveFormBtn.setAttribute('type', 'button');
      saveFormBtn.setAttribute('onClick', backupFormData());
      saveFormBtn.id = 'saveForm';
      saveFormBtn.innerHTML = 'Save';

      btnContainer.appendChild(saveFormBtn);
      btnContainer.appendChild(restoreBtn);

      // Insert buttons next to existing form buttons
      for (let i = 0; i < el.length; i++) {
         if (el[i].type === 'submit') {
            el[i].parentNode.appendChild(btnContainer);

            // Adapt buttons to site style (if doable)
            el[i].classList.forEach(el => {
               saveFormBtn.classList.add(`${el}`);
               restoreBtn.classList.add(`${el}`);
            });
         }
      }
   });
};

/*************
 * Listeners *
 *************/

// Load welcome page/initial setup and tutorial.
chrome.runtime.onInstalled.addListener(() => {
   // Create default settings
   chrome.storage.sync.set({
      fsSettings: {
         autoSave: false,
         blacklistedUrls: [],
         blacklistedFormFields: ['reset', 'submit', 'hidden', 'submit', 'button'],
         whitelistedUrls: [],
      }
   });
   
   chrome.tabs.create({
      url: chrome.runtime.getURL('/pages/new_install.html'),
      active: true,
   });
});

chrome.tabs.onCreated.addListener(tab => {
   // if url loading contains save data,
   if (urlsWithSavedData.find(el => el === tab.pendingUrl)) {
      // ask if user wants to load saved data, discard, or keep for another time.
   }
});

/* Attach listeners to form inputs if AutoSave is on, otherwise *
 * inject manual save button next to form buttons.              */
chrome.tabs.onActivated.addListener(async () => {
   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

   // Do nothing if tab url is blacklisted or autoSave is off.
   if (
      blacklistedUrls.find(el => el === tab.url) ||
      !tab.url.startsWith('http') ||
      tab.url === ''
   ) {
      return;
   }

   if (forms.length > 0) {
      chrome.scripting.executeScript({
         target: { tabId: tab.id },
         function: injectButtons,
      });
   }

   if (forms.length > 0 && autoSave) {
      if (!urlsWithSavedData.find(el => el === tab.url))
         urlsWithSavedData.push(tab.url);

      backupFormData(forms);
   }
});

// On reload/refresh
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
   forms = document.querySelectorAll('form');

   if (
      tab.url === '' ||
      !tab.url.startsWith('http') ||
      blacklistedUrls.find(el => el === tab.url)
   )
      return;

   if (changeInfo.status === 'complete') {
      chrome.scripting.executeScript({
         target: { tabId: tab.id },
         function: injectButtons,
      });
   }

   // Check for saved data and restore if needed, if previous data is wiped.
});
