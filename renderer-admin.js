document.querySelector('#admin-username').innerText = `${localStorage.user}`;
let orgUserList = [];
let inputDataArray = [];
const userListEditToggle = document.querySelector('#user-list-edit');
const userListInputArea = document.querySelector('#userlist-input');
const userlistSubmit = document.querySelector('#userlist-submit');
const userlistReset = document.querySelector('#userlist-reset');
const userlistMsg = document.querySelector('#userlist-msg');
const exportJsonStartDate = document.querySelector('#export-json-start-date');
const exportJsonEndDate = document.querySelector('#export-json-end-date');
const exportJsonFileSubmit = document.querySelector('#export-json-file-submit');
const exportJsonMsg = document.querySelector('#export-json-msg');

window.addEventListener('load', (event) => {
    getUserList();
});

const getUserList = async () => {
    orgUserList = await window.api.requestUserList();
    userListInputArea.value = orgUserList.join('\n');
}

const arrayEquals = (a, b) => {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val.trim() === b[index].trim());
}

userListEditToggle.addEventListener('click', (e) => {
    if (userListInputArea.disabled === true) {
        userListEditToggle.classList.remove('edit-on');
        userListInputArea.disabled = false;
        userlistSubmit.disabled = false;
        userlistReset.disabled = false;
    } else {
        userListEditToggle.classList.add('edit-on');
        userListInputArea.disabled = true;
        userlistSubmit.disabled = true;
        userlistReset.disabled = true;
    }
})

userlistSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    let inputData = userListInputArea.value.trim()
    inputDataArray = inputData.split('\n');
    if (!(arrayEquals(orgUserList, inputDataArray))) {
        window.api.updateUserList(inputDataArray);
        getUserList();
        userlistMsg.innerText = 'User list updated. *Reload required'
        userlistMsg.classList.add('user-list-msg-on');
        userListEditToggle.classList.add('edit-on');
        userListInputArea.disabled = true;
        setTimeout(() => {
            userlistMsg.innerText = '';
            userlistMsg.classList.remove('user-list-msg-on');
            userlistSubmit.disabled = true;
            userlistReset.disabled = true;
        }, 5000);
    }
});

userlistReset.addEventListener('click', (e) => {
    e.preventDefault();
    getUserList();
})

const exportJsonRequest = async (dateRange) => {
    const msg = await window.api.exportJson(dateRange);
    exportJsonMsg.innerText = msg;
    exportJsonMsg.classList.add('export-json-msg-on');
    setTimeout(() => {
        exportJsonMsg.innerText = '';
        exportJsonMsg.classList.remove('export-json-msg-on');
    }, 5000);
}

exportJsonFileSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    const startDateInt = parseInt(exportJsonStartDate.value.replaceAll('-', ''))
    const endDateInt = parseInt(exportJsonEndDate.value.replaceAll('-', ''))

    if (!(exportJsonStartDate.value) || !(exportJsonEndDate.value) || endDateInt - startDateInt < 0) {
        exportJsonMsg.innerText = 'Invalid date range.';
        exportJsonMsg.classList.add('export-json-msg-on');
        setTimeout(() => {
            exportJsonMsg.innerText = '';
            exportJsonMsg.classList.remove('export-json-msg-on');
        }, 5000);
    
    } else {
        const dateRange = {
            startDate: exportJsonStartDate.value,
            startDateInt: startDateInt,
            endDate: exportJsonEndDate.value,
            endDateInt: endDateInt
        }
        exportJsonRequest(dateRange);
    }
});




// ****************************************

feather.replace()