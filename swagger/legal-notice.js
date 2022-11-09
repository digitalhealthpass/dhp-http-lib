/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 *
 */
/* eslint-disable max-len */

const licensingAddress = () => {
    const ul = document.createElement('ul');
    ul.style.listStyleType = 'none';

    return ul;
};

const firstLevelNotices = () => {
    const div = document.createElement('div');

    let elem = document.createElement('h2');
    elem.innerHTML = 'Notices';
    div.appendChild(elem);
    
    return div;
};

const secondLevelNotices = () => {
    const div = document.createElement('div');

    let elem = document.createElement('h3');
    elem.innerHTML = 'This page documents intended Programming Interfaces that allow the customer to write programs to obtain services of Digital Health Pass';
    div.appendChild(elem);
    
    return div;
};

const buildNoticesDiv = () => {
    const notices = document.createElement('div');
    notices.style.margin = '50px';

    notices.appendChild(firstLevelNotices());
    notices.appendChild(document.createElement('br'));
    notices.appendChild(secondLevelNotices());

    return notices;
};

const callback = () => {
    const noticesDiv = buildNoticesDiv();
    document.getElementById('swagger-ui').insertAdjacentElement('afterend', noticesDiv);
};

if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
    callback();
} else {
    document.addEventListener('DOMContentLoaded', callback);
}
