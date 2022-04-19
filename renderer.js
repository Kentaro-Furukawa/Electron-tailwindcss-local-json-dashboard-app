let currentState = 'globalState';

const stateIconButtonContainer = document.querySelector('.state-icon-button-container');

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
    iconElement.setAttribute("value", iconItem.value);
    iconElement.innerHTML =
    `
    <i data-feather="${iconItem.icon}"></i>
    <span class="sidebar-caption group-hover:scale-100">
    ${iconItem.caption}
    </span>
    `
    stateIconButtonContainer.appendChild(iconElement);
});

//working on this event button 

const stateIconButtons = document.querySelectorAll('.state-icon-button');

// stateIconButtons.addEventListener('click', (e) => {
//     e.preventDefault();
//     console.log(currentState);
//     currentState = this.value;
//     console.log(currentState);
 
// });










// ****************************************

feather.replace()

