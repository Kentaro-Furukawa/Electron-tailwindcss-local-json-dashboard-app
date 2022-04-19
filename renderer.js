const stateIconButtons = document.querySelector('.state-icon-buttons');

const stateIcons = [
    { icon: 'user-check', caption: 'Available' },
    { icon: 'phone-call', caption: 'Next up' },
    { icon: 'headphones', caption: 'On call' },
    { icon: 'pen-tool', caption: 'Issuing' },
    { icon: 'radio', caption: 'Announce' },
    { icon: 'user-x', caption: 'Away' }
];

stateIcons.forEach(iconItem => {
    const iconElement = document.createElement('div');
    iconElement.classList.add("sidebar-icon", "group")
    iconElement.innerHTML =
        `
    <button>
    <i data-feather="${iconItem.icon}"></i>
    <span class="sidebar-caption group-hover:scale-100">
    ${iconItem.caption}
    </span>
    </button>
    `
    stateIconButtons.appendChild(iconElement);
});














// ****************************************

feather.replace()

