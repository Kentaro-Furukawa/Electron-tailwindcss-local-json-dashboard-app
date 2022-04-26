const adminPassword = 'admin';
const currentStateIcon = document.querySelector('.current-state-icon');
const userSelecter = document.querySelector('#user-selecter');
const stateIconButtonContainer = document.querySelector('.state-icon-button-container');
const recipientIconButton = document.querySelector('.recipient-icon-button');
const recipientLabel = document.querySelector('.recipient-label');
const themeToggleButton = document.querySelector('.theme-toggle-button');
const recordInput = document.querySelector('#record-input');
const recordSendButton = document.querySelector('#record-send-button');
const modalBackground = document.querySelector('.modal-background');
const modalInner = document.querySelector('.modal-inner');
const modalIconButton = document.querySelector('.modal-icon-button');
const modalCloseButton = document.querySelector('.modal-close-button');
let isRecipient = false;

const getCurrentDateTime = () => {
    let current = new Date();
    const currentYear = current.getFullYear();
    const currentMonth = ("0" + (current.getMonth() + 1)).slice(-2);
    const currentDate = ("0" + current.getDate()).slice(-2);
    const currentHours = ('0' + current.getHours()).slice(-2);
    const currentMinutes = ('0' + current.getMinutes()).slice(-2);
    const currentSeconds = ('0' + current.getSeconds()).slice(-2);
    return current = `${currentYear}-${currentMonth}-${currentDate} ${currentHours}:${currentMinutes}:${currentSeconds}`;
}

const stateIcons = [
    { value: 'available', icon: 'user-check', caption: 'Available' },
    { value: 'nextUp', icon: 'phone-call', caption: 'Next up' },
    { value: 'onCall', icon: 'headphones', caption: 'On call' },
    { value: 'issuing', icon: 'pen-tool', caption: 'Issuing' },
    { value: 'announce', icon: 'radio', caption: 'Announce' },
    { value: 'away', icon: 'user-x', caption: 'Away' }
];

if (!('currentState' in localStorage) || !(localStorage.currentState)) {
    localStorage.currentState = stateIcons[0].value;
}
const initState = stateIcons.filter((stateIcon) => stateIcon.value === localStorage.currentState)
const initStateIcon = initState[0].icon;
currentStateIcon.innerHTML = `<i data-feather="${initStateIcon}"></i>`;

stateIcons.forEach(iconItem => {
    const iconElement = document.createElement('button');
    iconElement.classList.add("state-icon-button", "sidebar-icon", "group")
    iconElement.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.currentState = iconItem.value;
        currentStateIcon.innerHTML = `<i data-feather="${iconItem.icon}"></i>`;
        feather.replace();
    });

    iconElement.innerHTML = `
    <i data-feather="${iconItem.icon}"></i>
    <span class="sidebar-caption group-hover:scale-100">
    ${iconItem.caption}
    </span>
    `
    stateIconButtonContainer.appendChild(iconElement);
});

recipientIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (isRecipient === false) {
        const recipientStart = new Date();
        const currentHours = ('0' + recipientStart.getHours()).slice(-2);
        const currentMinutes = ('0' + recipientStart.getMinutes()).slice(-2);
        const recipientStartTime = `${currentHours}:${currentMinutes}`;
        recipientLabel.innerHTML = `💌 You are recipient since ${recipientStartTime} 💌`;
        recipientLabel.classList.add('recipient-label-on');
        isRecipient = true;
    } else {
        recipientLabel.innerHTML = '';
        recipientLabel.classList.remove('recipient-label-on');
        isRecipient = false;
    }
});

window.api.onUserList((userList) => {
    userList.forEach((user) => {
        let node = document.createElement("option");
        node.setAttribute("value", user);
        node.innerHTML = user;
        userSelecter.appendChild(node);
    });
    if (userList.includes(localStorage.user)) {
        userSelecter.value = localStorage.user;
    }
});

userSelecter.addEventListener('change', (e) => {
    localStorage.user = userSelecter.value;
    userSelecter.value = localStorage.user;
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
        let inputValue = recordInput.value.toUpperCase();
        inputValue = inputValue.match(/(INC)\d{7}/gi);
        inputValue = [...new Set(inputValue)];
        const record = {
            username: localStorage.user,
            state: localStorage.currentState,
            time: getCurrentDateTime(),
            value: inputValue,
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
    console.log('Send : ', record);
    console.log(invokeRecord);
}

recordSendButton.addEventListener('click', (e) => {
    e.preventDefault();
    sendRecord();
});

modalIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    modalBackground.style.display = 'block';
    const modalOn = true;
    modalInner.innerHTML = `
<h1>Login to admin page</h1>
<div class="admin-error-message"></div>
<form>
<input id="admin-pass-input" type="password" name="adminpass" minlength="5" required placeholder="Enter password...">
<lable for="adminpass" class="admin-pass-hint">🔑 : ${adminPassword}</lable>
<button id="admin-pass-submit" type="submit"><i data-feather="log-in"></i></button>
</form>
`;
    feather.replace();

    if (!('user' in localStorage) || !(localStorage.user)) {
        document.querySelector('#admin-pass-input').disabled = true;
        document.querySelector('#admin-pass-submit').disabled = true;
        document.querySelector('.admin-error-message').innerHTML = "Please select username first."
        document.querySelector('.admin-error-message').classList.add("admin-error-message-On");
        userSelecter.focus();
    } else {
        document.querySelector('#admin-pass-input').disabled = false;
        document.querySelector('#admin-pass-submit').disabled = false;
        document.querySelector('.admin-error-message').classList.remove("admin-error-message-On");
        document.querySelector('#admin-pass-input').focus();
    }

    if (modalOn) {
        document.querySelector('#admin-pass-submit').addEventListener('click', (e) => {
            e.preventDefault();
            const adminPassInput = document.querySelector('#admin-pass-input').value;
            document.querySelector('.admin-error-message').classList.add("admin-error-message-On");

            if (adminPassInput.trim().length === 0) {
                document.querySelector('.admin-error-message').innerHTML = "Please enter password."
                document.querySelector('.admin-error-message').classList.add("admin-error-message-On");
                document.querySelector('#admin-pass-input').focus();
            } else if (adminPassInput !== adminPassword) {
                document.querySelector('.admin-error-message').innerHTML = "Incorrect password."
                document.querySelector('.admin-error-message').classList.add("admin-error-message-On");
                document.querySelector('#admin-pass-input').focus();
            } else {
                console.log('success')
                document.querySelector('.admin-error-message').innerHTML = "";
                document.querySelector('.admin-error-message').classList.remove("admin-error-message-On");
                modalBackground.style.display = 'none';

                const adminLog = {
                    username: localStorage.user,
                    date: getCurrentDateTime(),
                };
                console.log(adminLog);
                window.api.adminLogin(adminLog);

            }
        })
    }
});

modalCloseButton.addEventListener('click', (e) => {
    e.preventDefault();
    modalBackground.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modalBackground) {
        modalBackground.style.display = 'none';
    }
});

// ****************************************

feather.replace()