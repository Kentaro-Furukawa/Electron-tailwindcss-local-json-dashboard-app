let currentState = 'globalState';
let isRecipient = false;
const stateIconButtonContainer = document.querySelector('.state-icon-button-container');
const recipientIconButton = document.querySelector('.recipient-icon-button');
const recipientLabel = document.querySelector('.recipient-label');
const themeToggleButton = document.querySelector('.theme-toggle-button');
const modalBackground = document.querySelector('.modal-background');
const modalInner = document.querySelector('.modal-inner');
const modalIconButton = document.querySelector('.modal-icon-button');
const modalCloseButton = document.querySelector('.modal-close-button');

const stateIcons = [
    { value: 'available', icon: 'user-check', caption: 'Available' },
    { value: 'nextUp', icon: 'phone-call', caption: 'Next up' },
    { value: 'onCall', icon: 'headphones', caption: 'On call' },
    { value: 'issuing', icon: 'pen-tool', caption: 'Issuing' },
    { value: 'announce', icon: 'radio', caption: 'Announce' },
    { value: 'away', icon: 'user-x', caption: 'Away' }
];

stateIcons.forEach(iconItem => {
    const iconElement = document.createElement('button');
    iconElement.classList.add("state-icon-button", "sidebar-icon", "group")
    iconElement.addEventListener('click', (e) => {
            e.preventDefault();
            currentState = iconItem.value;
            document.querySelector('.current-state-icon').innerHTML = `<i data-feather="${iconItem.icon}"></i>`;
            feather.replace();
        });

    iconElement.innerHTML =
    `
    <i data-feather="${iconItem.icon}"></i>
    <span class="sidebar-caption group-hover:scale-100">
    ${iconItem.caption}
    </span>
    `
    stateIconButtonContainer.appendChild(iconElement);
});

recipientIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    if ( isRecipient === false ) {
        const recipientStart = new Date();
        currentHours = ('0' + recipientStart.getHours()).slice(-2);
        currentMinutes = ('0' + recipientStart.getMinutes()).slice(-2);
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

modalIconButton.addEventListener('click', (e) => {
    e.preventDefault();
    modalBackground.style.display = 'block';
    modalInner.innerHTML = `
<h1>Login to admin page</h1>
<form>
<input class="admin-pass-input" type="password" minlength="5" required placeholder="Enter password...">
<p class="admin-pass-hint">Hint: admin</p>
<button class="admin-pass-button" type="submit"><i data-feather="log-in"></i></button>
</form>
`;
    feather.replace()    
});

modalCloseButton.addEventListener('click', (e) => {
    e.preventDefault();
    modalBackground.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if(e.target === modalBackground) {
        modalBackground.style.display = 'none';
    }
});



// ****************************************

feather.replace()

