document.querySelector('#admin-username').innerText = `${localStorage.user}`;
let orgUserList = [];
let inputDataArray = [];
const userListEditToggle = document.querySelector('#user-list-edit');
const userListInputArea = document.querySelector('#userlist-input');
const userlistSubmit = document.querySelector('#userlist-submit');
const userlistReset = document.querySelector('#userlist-reset');
const userlistMsg = document.querySelector('#userlist-msg');

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
  
userListEditToggle.addEventListener('click', (e)=> {
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

userlistSubmit.addEventListener('click' ,(e) => {
    e.preventDefault();
    let inputData = userListInputArea.value.trim()
    inputDataArray = inputData.split('\n');
    if (!(arrayEquals(orgUserList, inputDataArray))){
        window.api.updateUserList(inputDataArray);
        userlistMsg.innerText = 'User list updated. *Reload required'
        setTimeout(()=> {
            userlistMsg.innerText = '';
            userListEditToggle.classList.add('edit-on');
            userListInputArea.disabled = true;
            userlistSubmit.disabled = true;
            userlistReset.disabled = true;
        }, 3000);
    }
});

userlistReset.addEventListener('click', (e) => {
    e.preventDefault();
    getUserList();
})




// ****************************************

feather.replace()