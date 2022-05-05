document.querySelector('#admin-username').innerText = `${localStorage.user}`;
let orgUserList = [];
let inputDataArray = [];
const userListInputArea = document.querySelector('#userlist-input');
const userlistSubmit = document.querySelector('#userlist-submit');

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
  
userlistSubmit.addEventListener('click' ,(e) => {
    e.preventDefault();
    let inputData = userListInputArea.value
    inputDataArray = inputData.split('\n');
    if (!(arrayEquals(orgUserList, inputDataArray))){
        console.log('some change')
    }
  
});




// ****************************************

feather.replace()