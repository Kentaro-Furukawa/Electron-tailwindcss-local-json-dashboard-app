const adminPassword = 'admin';
const incPattern = /(INC)\d{7}(?!\d)|(TASK)\d{7}(?!\d)/gi;
let requestedRecord = '';
let copiedItem = '';
const currentStateIcon = document.querySelector('.current-state-icon');
const userSelecter = document.querySelector('#user-selecter');
const stateIconButtonContainer = document.querySelector('.state-icon-button-container');
const recipientIconButton = document.querySelector('.recipient-icon-button');
const recipientLabel = document.querySelector('.recipient-label');
const themeToggleButton = document.querySelector('.theme-toggle-button');
const refreshButton = document.querySelector('#refresh-button');
const recordInput = document.querySelector('#record-input');
const recordSendButton = document.querySelector('#record-send-button');
const recordClearButton = document.querySelector('#record-clear-button');
const recordTagButton = document.querySelector('#record-tag-button');
const recordFlashButton = document.querySelector('#record-flash-button');
const recordFormMessage = document.querySelector('.record-form-message');
const activeRecordTable = document.querySelector('#active-record-table');
const activeRecordTableBody = document.querySelector('#active-record-table-body');
const modalBackground = document.querySelector('.modal-background');
const modalInner = document.querySelector('.modal-inner');
const modalIconButton = document.querySelector('#modal-icon-button');
const modalCloseButton = document.querySelector('.modal-close-button');
const adminPassInput = document.querySelector('#admin-pass-input');
const adminErrorMessage = document.querySelector('.admin-error-message');
const tagModalBg = document.querySelector('#tag-modal-bg');
const tagModalCloseBtn = document.querySelector('#tag-modal-close-btn');
const tagValueInput = document.querySelector('#tag-value-input');
const tagIconsContainer = document.querySelector('#tag-icons-container');
const tagSubmitBtn = document.querySelector('#tag-submit-btn');
const tagCommentInput = document.querySelector('#tag-comment-input');
let isRecipient = false;

const getCurrentDateTime = () => {
    const current = new Date();
    const currentYear = current.getFullYear();
    const currentMonth = ("0" + (current.getMonth() + 1)).slice(-2);
    const currentDate = ("0" + current.getDate()).slice(-2);
    const currentHours = ('0' + current.getHours()).slice(-2);
    const currentMinutes = ('0' + current.getMinutes()).slice(-2);
    const currentSeconds = ('0' + current.getSeconds()).slice(-2);
    return `${currentYear}-${currentMonth}-${currentDate} ${currentHours}:${currentMinutes}:${currentSeconds}`;
}

const stateIcons = [
    { value: 'available', icon: 'user-check', caption: 'Available' },
    { value: 'nextUp', icon: 'phone-call', caption: 'Next up' },
    { value: 'onCall', icon: 'headphones', caption: 'On call' },
    { value: 'issuing', icon: 'pen-tool', caption: 'Issuing' },
    { value: 'announce', icon: 'radio', caption: 'Announce' },
    { value: 'away', icon: 'user-x', caption: 'Away' }
];

const tagIcons = [
    { value: 'help', icon: 'help-circle' },
    { value: 'alert', icon: 'alert-triangle' },
    { value: 'clip', icon: 'paperclip' }
];

if (!('currentState' in localStorage) || !(localStorage.currentState)) {
    localStorage.currentState = stateIcons[0].value;
}
const initState = stateIcons.filter((stateIcon) => stateIcon.value === localStorage.currentState)
const initStateIcon = initState[0].icon;
let currentStateIconInner = document.createElement('div');
currentStateIconInner.classList.add("current-state-icon-inner", `${initState[0].value}-icon`)
let currentStateIconElement = document.createElement('i');
currentStateIconElement.setAttribute('data-feather', initStateIcon);
currentStateIconInner.append(currentStateIconElement);
currentStateIcon.append(currentStateIconInner);

stateIcons.forEach(iconItem => {
    const iconElement = document.createElement('button');
    iconElement.classList.add("state-icon-button", "sidebar-icon", "group", `${iconItem.value}-icon`)
    iconElement.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.currentState = iconItem.value;
        let currentStateIconInner = document.createElement('div');
        currentStateIconInner.classList.add("current-state-icon-inner", `${iconItem.value}-icon`)
        let setCurrentStateIconElement = document.createElement('i');
        setCurrentStateIconElement.setAttribute('data-feather', iconItem.icon);
        currentStateIconInner.append(setCurrentStateIconElement);
        currentStateIcon.removeChild(currentStateIcon.lastChild);
        currentStateIcon.append(currentStateIconInner);
        feather.replace();
    });

    let stateIconElement = document.createElement('i');
    stateIconElement.setAttribute('data-feather', iconItem.icon);
    let stateIconCaption = document.createElement('span');
    stateIconCaption.classList.add("sidebar-caption", "group-hover:scale-100");
    stateIconCaption.innerText = iconItem.caption;
    iconElement.append(stateIconElement, stateIconCaption);
    stateIconButtonContainer.appendChild(iconElement);
});

recipientIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRecipient === false) {
        const recipientStart = new Date();
        const currentHours = ('0' + recipientStart.getHours()).slice(-2);
        const currentMinutes = ('0' + recipientStart.getMinutes()).slice(-2);
        const recipientStartTime = `${currentHours}:${currentMinutes}`;
        recipientLabel.innerText = `💌 You are recipient since ${recipientStartTime} 💌`;
        recipientLabel.classList.add('recipient-label-on');
        isRecipient = true;
    } else {
        recipientLabel.innerText = '';
        recipientLabel.classList.remove('recipient-label-on');
        isRecipient = false;
    }
});

window.api.onUserList((userList) => {
    userList.forEach((user) => {
        let node = document.createElement("option");
        node.setAttribute("value", user);
        node.innerText = user;
        userSelecter.appendChild(node);
    });
    if (userList.includes(localStorage.user)) {
        userSelecter.value = localStorage.user;
    }
});

function tableOperation(records) {
    const sortedRecords = records.sort((a, b) => (a.time < b.time ? 1 : -1));
    document.querySelectorAll('.tr-record').forEach(el => el.remove());
    sortedRecords.forEach((record) => {
        let tableRow = document.createElement('tr');
        let keyData = document.createElement('td');
        let keyDataInner = document.createElement('div');
        let timeData = document.createElement('td');
        let valueData = document.createElement('td');
        let keyDataNameSpan = document.createElement('span');
        keyDataNameSpan.innerText = record.username;

        if (!(record.tagOn)) {
            let stateIconSpan = document.createElement('span');
            let stateIcon = document.createElement('i');
            let recordState = stateIcons.filter((stateIcon) => stateIcon.value === record.state)
            let recordStateIcon = recordState[0].icon;
            stateIconSpan.classList.add('td-key-state-icon-span', `${recordState[0].value}-icon`);
            stateIcon.setAttribute('data-feather', recordStateIcon);
            keyDataInner.append(stateIconSpan);
            stateIconSpan.append(stateIcon);
            stateIcon.classList.add('td-key-state-icon')
        }

        tableRow.classList.add("tr-record");
        activeRecordTableBody.appendChild(tableRow);
        tableRow.append(keyData, timeData, valueData);
        keyData.classList.add("td-key");
        keyData.append(keyDataInner);
        keyDataInner.append(keyDataNameSpan);
        keyDataInner.classList.add('td-key-inner')
        timeData.classList.add("td-time");
        timeData = timeData.innerText = record.time.slice(-8);
        valueData.classList.add("td-value")

        if (!(record.incNo.length > 0)) {
            valueData = valueData.innerText = record.inputValue;
        } else {
            record.incNo.forEach((inc) => {
                let incItem = document.createElement('span');
                incItem.classList.add('td-value-inc')
                incItem.innerText = inc;
                valueData.append(incItem);
            });
        }
    });
    feather.replace()
}

function updateTable(obj) {
    return new Promise((resolve, reject) => {
        if (obj.incTaken === true) {
            console.log('is taken!!!!');
        } else {
            let activeRecord = obj.activeRecord;
            tableOperation(activeRecord);
        }
        const error = false;
        if (!error) {
            resolve();
        } else {
            reject('Error: failed to update table.');
        }
    });
}

// get active record at start.
window.api.getActiveRecord((activeRecord) => {
    tableOperation(activeRecord);
});

userSelecter.addEventListener('change', (e) => {
    localStorage.user = userSelecter.value;
    userSelecter.value = localStorage.user;
});

async function refreshRecord() {
    const data = await window.api.requestActiveRecord();
    tableOperation(data);
}

refreshButton.addEventListener('click', (e) => {
    e.preventDefault();
    refreshRecord();
});

themeToggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (localStorage.theme === 'dark') {
        localStorage.theme = 'light';
        document.documentElement.classList.remove('dark');
    } else {
        localStorage.theme = 'dark';
        document.documentElement.classList.add('dark');

    }
});

function createRecord() {
    return new Promise((resolve, reject) => {
        let incNo = recordInput.value.toUpperCase();
        incNo = incNo.match(incPattern);
        incNo = [...new Set(incNo)];
        const record = {
            username: localStorage.user,
            state: localStorage.currentState,
            time: getCurrentDateTime(),
            inputValue: recordInput.value,
            incNo: incNo,
            recipient: isRecipient,
        };
        const error = false;
        if (!error) {
            resolve(record);
        } else {
            reject('Error: failed to create record.');
        }
    });
}

const sendRecord = async () => {
    const record = await createRecord();
    const invokeRecord = await window.api.sendRecord(record);
    await updateTable(invokeRecord);
}

recordInput.addEventListener('keyup', (e) => {
    e.preventDefault();
    recordFormMessage.innerText = '';
});

recordSendButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (recordInput.value.trim().length === 0) {
        recordFormMessage.innerText = 'Input field is empty, Please enter value.';
        recordInput.value = '';
    } else {
        recordFormMessage.innerText = '';
        sendRecord();
        recordInput.value = '';
    }
});

recordClearButton.addEventListener('click', (e) => {
    e.preventDefault();
    recordInput.value = '';
    recordFormMessage.innerText = '';
});

async function getClipboard() {
    const data = await window.api.onFlash();
    copiedItem = data;
    if (!(incPattern.test(copiedItem))) {
        recordFormMessage.innerText = 'There is no incNo in your clipboard.';
    } else {
        recordInput.value = copiedItem;
        await sendRecord();
        recordFormMessage.innerText = '';
        recordInput.value = '';
    }
}
recordFlashButton.addEventListener('click', (e) => {
    e.preventDefault();
    getClipboard();
});

modalIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    modalBackground.style.display = 'block';
    document.querySelector('.admin-pass-hint').innerText = `🔑 : ${adminPassword}`;
    feather.replace();

    if (!('user' in localStorage) || !(localStorage.user)) {
        document.querySelector('#admin-pass-input').disabled = true;
        document.querySelector('#admin-pass-submit').disabled = true;
        adminErrorMessage.innerText = "Please select username first."
        adminErrorMessage.classList.add("admin-error-message-On");
    } else {
        document.querySelector('#admin-pass-input').disabled = false;
        document.querySelector('#admin-pass-submit').disabled = false;
        adminErrorMessage.classList.remove("admin-error-message-On");
        document.querySelector('#admin-pass-input').focus();
        adminPassInput.value = "";
        adminErrorMessage.innerText = "";
    }

    document.querySelector('#admin-pass-submit').addEventListener('click', (e) => {
        e.preventDefault();
        if (adminPassInput.value.trim().length === 0) {
            adminErrorMessage.innerText = "Please enter password.";
            adminErrorMessage.classList.add("admin-error-message-On");
            document.querySelector('#admin-pass-input').focus();
            adminPassInput.value = "";
        } else if (adminPassInput.value !== adminPassword) {
            adminErrorMessage.innerText = "Incorrect password.";
            adminErrorMessage.classList.add("admin-error-message-On");
            document.querySelector('#admin-pass-input').focus();
            adminPassInput.value = "";
        } else {
            console.log('success')
            adminErrorMessage.innerText = "";
            adminErrorMessage.classList.remove("admin-error-message-On");
            adminPassInput.value = "";
            modalBackground.style.display = 'none';

            const adminLog = {
                username: localStorage.user,
                date: getCurrentDateTime(),
            };
            console.log(adminLog);
            window.api.adminLogin(adminLog);
        }
    });
});

modalCloseButton.addEventListener('click', (e) => {
    e.preventDefault();
    modalBackground.style.display = 'none';
    adminErrorMessage.innerText = "";
});

window.addEventListener('click', (e) => {
    if (e.target === modalBackground) {
        modalBackground.style.display = 'none';
        adminErrorMessage.innerText = "";
    }
});



function createTagRecord() {
    return new Promise((resolve, reject) => {
        let incNo = tagValueInput.value.toUpperCase();
        incNo = incNo.match(incPattern);
        incNo = [...new Set(incNo)];
        const tags = [];
        tagIcons.forEach((tagIcon) => {
            if (document.querySelector(`.tag-${tagIcon.value}-btn`).classList.contains(`tag-${tagIcon.value}-btn-on`)) {
                tags.push(tagIcon.value);
            }
        });

        const tagRecord = {
            username: localStorage.user,
            state: localStorage.currentState,
            time: getCurrentDateTime(),
            inputValue: tagValueInput.value,
            incNo: incNo,
            recipient: isRecipient,
            tagOn: true,
            tags: tags,
            tagComment: tagCommentInput.value,
        };
        const error = false;
        if (!error) {
            resolve(tagRecord);
        } else {
            reject('Error: failed to create a tag record.');
        }
    });
}

const sendTagRecord = async () => {
    const record = await createTagRecord();
    const invokeRecord = await window.api.sendRecord(record);
    await updateTable(invokeRecord);
    console.log(invokeRecord);
}


tagIcons.forEach((tagIcon) => {
    let button = document.createElement('button');
    button.classList.add(`tag-${tagIcon.value}-btn`);
    let iElm = document.createElement('i');
    iElm.setAttribute('data-feather', tagIcon.icon);
    button.append(iElm);
    tagIconsContainer.append(button);

    button.addEventListener('click', (e) => {
        e.preventDefault();
        button.classList.toggle(`tag-${tagIcon.value}-btn-on`);
    });
});

recordTagButton.addEventListener('click', (e) => {
    e.preventDefault();
    let preInput = recordInput.value;
    if (preInput.trim().length > 0) {
        tagValueInput.value = preInput;
    }
    tagModalBg.style.display = 'flex';
    tagValueInput.focus();
});

const tagModalClose = () => {
    tagModalBg.style.display = 'none';
    tagValueInput.value = "";
    document.querySelector('.tag-help-btn').classList.remove('tag-help-btn-on');   // forEach these three lines.
    document.querySelector('.tag-alert-btn').classList.remove('tag-alert-btn-on');
    document.querySelector('.tag-clip-btn').classList.remove('tag-clip-btn-on');
    tagCommentInput.value = "";
};

tagModalCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    tagModalClose();
});

window.addEventListener('click', (e) => {
    if (e.target === tagModalBg) {
        tagModalClose();
    }
});

tagSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sendTagRecord();
})





// ****************************************

feather.replace()