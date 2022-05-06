const adminPassword = 'admin';
const incPattern = /(INC)\d{7}(?!\d)|(TASK)\d{7}(?!\d)/gi;
let requestedRecord = '';
let copiedItem = '';
let isRecipient = false;
const currentStateIcon = document.querySelector('.current-state-icon');
const userSelecter = document.querySelector('#user-selecter');
const stateIconButtonContainer = document.querySelector('.state-icon-button-container');
const recipientIconButton = document.querySelector('.recipient-icon-button');
const recipientLabel = document.querySelector('.recipient-label');
const topNavigation = document.querySelector('#top-navigation');
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
const alModalBtn = document.querySelector('#al-modal-icon-btn');
const alModalBg = document.querySelector('#al-modal-bg');
const alModalCloseBtn = document.querySelector('#al-modal-close-btn');
const alPassInput = document.querySelector('#al-pass-input');
const alPassLabel = document.querySelector('#al-pass-label');
const alSubmit = document.querySelector('#al-submit');
const alMsg = document.querySelector('#al-msg');
const tagModalBg = document.querySelector('#tag-modal-bg');
const tagModalCloseBtn = document.querySelector('#tag-modal-close-btn');
const tagValueInput = document.querySelector('#tag-value-input');
const tagIconsContainer = document.querySelector('#tag-icons-container');
const tagSubmitBtn = document.querySelector('#tag-submit-btn');
const tagCommentInput = document.querySelector('#tag-comment-input');
const tMsg = document.querySelector('#t-msg');

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
    { value: 'available', icon: 'check', caption: 'Available' },
    { value: 'nextUp', icon: 'phone-call', caption: 'Next up' },
    { value: 'onCall', icon: 'headphones', caption: 'On call' },
    { value: 'issuing', icon: 'pen-tool', caption: 'Issuing' },
    { value: 'announce', icon: 'radio', caption: 'Announce' },
    { value: 'away', icon: 'slash', caption: 'Away' }
];

const tagIcons = [
    { value: 'help', icon: 'help-circle', tcolor: 'text-blue-500' },
    { value: 'alert', icon: 'alert-triangle', tcolor: 'text-amber-500' },
    { value: 'clip', icon: 'paperclip', tcolor: 'text-lime-500' }
];

window.addEventListener('load', (event) => {
    refreshUserList();
    refreshRecord();
});

const refreshUserList = async () => {
    const userList = await window.api.requestUserList();
    userList.forEach((user) => {
        let node = document.createElement("option");
        node.setAttribute("value", user);
        node.innerText = user;
        userSelecter.appendChild(node);
    });
    if (userList.includes(localStorage.user)) {
        userSelecter.value = localStorage.user;
    }
};

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

function createOncallTagRecord(priorRecord) {
    return new Promise((resolve, reject) => {
        const onCalltagRecord = {
            username: localStorage.user,
            state: localStorage.currentState,
            time: getCurrentDateTime(),
            inputValue: priorRecord.inputValue,
            incNo: priorRecord.incNo,
            recipient: isRecipient,
            tagOn: true,
            tags: [tagIcons[2].value],
            tagComment: 'On call',
        };
        const error = false;
        if (!error) {
            resolve(onCalltagRecord);
        } else {
            reject('Error: failed to create a on call tag record.');
        }
    });
}

function createOncallRecord() {
    return new Promise((resolve, reject) => {
        const record = {
            username: localStorage.user,
            state: localStorage.currentState,
            time: getCurrentDateTime(),
            inputValue: 'On call',
            incNo: [],
            recipient: isRecipient,
        };
        const error = false;
        if (!error) {
            resolve(record);
        } else {
            reject('Error: failed to create on call record.');
        }
    });
}

const fireOnCall = async () => {
    const data = await window.api.requestActiveRecord();
    const priorRecord = data.filter((ar) => ar.username === localStorage.user && ar.incNo.length > 0 && !(ar.tagOn === true));
    if (priorRecord.length > 0) {
        const onCalltagRecord = await createOncallTagRecord(priorRecord[0]);
        await window.api.sendRecord(onCalltagRecord);
    }

    const onCallRecord = await createOncallRecord();
    const updateData = await window.api.sendRecord(onCallRecord);
    updateTable(updateData);

}


document.querySelector('button.onCall-icon').addEventListener('click', (e) => {
    fireOnCall();
})


recipientIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRecipient === false) {
        const recipientStart = new Date();
        const currentHours = ('0' + recipientStart.getHours()).slice(-2);
        const currentMinutes = ('0' + recipientStart.getMinutes()).slice(-2);
        const recipientStartTime = `${currentHours}:${currentMinutes}`;
        recipientLabel.innerText = `Recipient start at ${recipientStartTime}`;
        recipientLabel.classList.add('recipient-label-on');
        recipientIconButton.classList.add('recipient-icon-on');
        isRecipient = true;
    } else {
        recipientLabel.innerText = '';
        recipientLabel.classList.remove('recipient-label-on');
        recipientIconButton.classList.remove('recipient-icon-on');
        isRecipient = false;
    }
});

function tableOperation(records) {
    const sortedRecords = records.sort((a, b) => (a.time < b.time ? 1 : -1));
    document.querySelectorAll('.tr-record').forEach(el => el.remove());
    sortedRecords.forEach((record) => {
        const { username, state, time, inputValue, incNo, recipient, tagOn, tags, tagComment } = record;
        let tableRow = document.createElement('tr');
        let keyData = document.createElement('td');
        let keyDataInner = document.createElement('div');
        let timeData = document.createElement('td');
        let valueData = document.createElement('td');
        let keyDataNameSpan = document.createElement('span');
        keyDataNameSpan.innerText = username;

        if (!(tagOn)) {
            let stateIconSpan = document.createElement('span');
            let stateIcon = document.createElement('i');
            let recordState = stateIcons.filter((stateIcon) => stateIcon.value === state)
            let recordStateIcon = recordState[0].icon;
            stateIconSpan.classList.add('td-key-state-icon-span', `${recordState[0].value}-icon`);
            stateIcon.setAttribute('data-feather', recordStateIcon);
            keyDataInner.append(stateIconSpan);
            stateIconSpan.append(stateIcon);
            stateIcon.classList.add('td-key-state-icon')
        }

        if (recipient && !(tagOn)) {
            let recpIconSpan = document.createElement('span');
            let recpIcon = document.createElement('i');
            recpIconSpan.classList.add('td-key-recp-icon-span');
            recpIcon.setAttribute('data-feather', 'inbox');
            recpIcon.classList.add('td-key-recp-icon')
            recpIconSpan.append(recpIcon);
            keyDataInner.append(recpIconSpan);
        }

        tableRow.classList.add("tr-record");
        activeRecordTableBody.appendChild(tableRow);
        tableRow.append(keyData, timeData, valueData);
        keyData.classList.add("td-key");
        keyData.append(keyDataInner);
        keyDataInner.append(keyDataNameSpan);
        keyDataInner.classList.add('td-key-inner')
        timeData.classList.add("td-time");
        timeData = timeData.innerText = time.slice(-8);
        valueData.classList.add("td-value")

        if (tagOn) {
            tags.forEach((tag) => {
                let tagIconSpan = document.createElement('span');
                let tagIcon = document.createElement('i');
                let TargetTagIconFilter = tagIcons.filter((tItem) => tItem.value === tag);
                let targetTagIcon = TargetTagIconFilter[0].icon;
                tagIconSpan.classList.add('td-key-tag-icon-span', `td-key-${tag}-tag-icon`, TargetTagIconFilter[0].tcolor)
                tagIcon.setAttribute('data-feather', targetTagIcon);
                tagIconSpan.append(tagIcon);
                keyDataInner.append(tagIconSpan);
            });
        }

        if (tagComment) {
            let tagCommentSpan = document.createElement('span');
            tagCommentSpan.innerText = tagComment;
            keyDataInner.append(tagCommentSpan);
        }

        if (!(incNo.length > 0)) {
            let valueInputSpan = document.createElement('span');
            valueInputSpan.innerHTML = inputValue;
            valueData.append(valueInputSpan);
        } else {
            tableRow.setAttribute('inc-value', incNo.join('-'));
            incNo.forEach((inc) => {
                let incItem = document.createElement('span');
                incItem.classList.add('td-value-inc')
                incItem.innerText = inc;
                valueData.append(incItem);

            });
        }

        if (tagOn) {
            let tagDelBtn = document.createElement('button');
            let tagDelIcon = document.createElement('i');
            tagDelBtn.classList.add('tag-del-Btn');
            tagDelIcon.setAttribute('data-feather', 'x-circle');
            tagDelBtn.append(tagDelIcon);
            valueData.append(tagDelBtn);
            valueData.classList.add('pr-8')
            tagDelBtn.addEventListener('click', (e) => {
                tableRow.classList.add('bg-gray-200', 'text-gray-400');
                setTimeout(() => {
                    delTr(record);
                }, 300);
            })
        }
    });
    feather.replace()
}

function updateTable(obj) {
    const { activeRecord: ar } = obj
    return new Promise((resolve, reject) => {
        if (obj.incTaken === true) {
            const { incNo: dplIncs, username: dplUser } = obj.duplicateRecord[0]; // shold be looped over?
            tableOperation(ar);
            topNavigation.classList.add('top-nav-dpl');
            const dplTr = document.querySelector(`tr[inc-value*= ${dplIncs.join('-')}]`);
            dplTr.classList.add('dpl-tr-on');
            setTimeout(() => {
                topNavigation.classList.remove('top-nav-dpl');
                dplTr.classList.remove('dpl-tr-on');
            }, 2000);
        } else {
            tableOperation(ar);
            topNavigation.classList.add('top-nav-scc');
            setTimeout(() => {
                topNavigation.classList.remove('top-nav-scc');
            }, 2000);
        }
        const error = false;
        if (!error) {
            resolve();
        } else {
            reject('Error: failed to update table.');
        }
    });
}

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
    recordFormMessage.classList.remove('record-form-message-on');
});

recordSendButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (recordInput.value.trim().length === 0) {
        recordInput.focus();
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

const delTr = async (record) => {
    const updatedRecord = await window.api.delTagRecord(record);
    tableOperation(updatedRecord);
}

async function getClipboard() {
    const data = await window.api.onFlash();
    copiedItem = data;
    if (!(incPattern.test(copiedItem))) {
        recordFormMessage.innerText = 'No valid incNo copied.';
        recordFormMessage.classList.add('record-form-message-on');
        setTimeout(() => {
            recordFormMessage.innerText = '';
            recordFormMessage.classList.remove('record-form-message-on');
        }, 2000);
    } else {
        recordInput.value = copiedItem;
        await sendRecord();
        recordInput.value = '';
    }
}
recordFlashButton.addEventListener('click', (e) => {
    e.preventDefault();
    getClipboard();
});

alModalBtn.addEventListener('click', (e) => {
    alModalBg.style.display = 'flex';

    if (!('user' in localStorage) || !(localStorage.user)) {
        alPassInput.disabled = true;
        alSubmit.disabled = true;
        alMsg.classList.add('al-msg-on');
        alMsg.innerHTML = "Please select user.";
    } else {
        alPassLabel.innerHTML = `🔑 : ${adminPassword}`;
        alPassInput.focus();
    }
});

alSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const inputPass = alPassInput.value;

    if (!(inputPass === adminPassword)) {
        alMsg.classList.add('al-msg-on');
        alMsg.innerHTML = "Incorrect password.";
        alPassInput.focus();
    } else {
        const log = {
            username: localStorage.user,
            date: getCurrentDateTime(),
        };
        window.api.adminLogin(log);
        alModalClose();
    }
});

const alModalClose = () => {
    alModalBg.style.display = 'none';
    alMsg.classList.remove('al-msg-on');
    alMsg.innerHTML = "";
    alPassInput.value = "";
    alPassInput.disabled = false;
    alSubmit.disabled = false;
};

alModalCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alModalClose();
});

window.addEventListener('click', (e) => {
    if (e.target === alModalBg) {
        alModalClose();
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
    tagCommentInput.value = "";
    tMsg.classList.remove('al-msg-on');
    tMsg.innerHTML = "";
    tMsg.style.display = 'none';
    document.querySelector('.tag-help-btn').classList.remove('tag-help-btn-on');   // forEach these three lines.
    document.querySelector('.tag-alert-btn').classList.remove('tag-alert-btn-on');
    document.querySelector('.tag-clip-btn').classList.remove('tag-clip-btn-on');
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
    if (tagValueInput.value.trim().length === 0) {
        tMsg.classList.add('t-msg-on');
        tMsg.innerHTML = "Value is requred.";
        tMsg.style.display = 'block';
        tagValueInput.focus();

    } else {
        sendTagRecord();
        recordInput.value = "";
        tagModalClose();
    }

})

const spark = async (clipedItem) => {
    if (!(incPattern.test(clipedItem))) {
        recordFormMessage.innerText = 'No valid incNo copied.';
        recordFormMessage.classList.add('record-form-message-on');
        setTimeout(() => {
            recordFormMessage.innerText = '';
            recordFormMessage.classList.remove('record-form-message-on');
        }, 2000);
    } else {
        recordInput.value = clipedItem;
        await sendRecord();
        recordInput.value = '';
    }
}


window.api.onSpark((clipedItem) => {
    spark(clipedItem);
})

const escapeKey = (event) => {
    if (event.which == 27) { // Escape key
        tagModalClose();
        alModalClose();
        recordFormMessage.innerText = '';
        recordFormMessage.classList.remove('record-form-message-on');
    }
}
window.addEventListener('keyup', escapeKey, true)


// ****************************************

feather.replace()