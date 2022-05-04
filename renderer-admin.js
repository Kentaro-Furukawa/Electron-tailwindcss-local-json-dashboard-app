document.querySelector('#admin-username').innerText = `${localStorage.user}`;
const userListInputArea = document.querySelector('#userlist-input');

window.addEventListener('load', (event) => {
    getUserList();
});


const getUserList = async () => {
    let userList = await window.api.requestUserList();
    console.log(userList);
    userListInputArea.textContent = userList.join('\r\n');
}



// ****************************************

feather.replace()