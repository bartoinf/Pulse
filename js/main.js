/* PULSE — JavaScript principal da V1 */

(function () {
    'use strict';

    const year = document.querySelector('[data-current-year]');

    if (year) {
        year.textContent = new Date().getFullYear();
    }
})();
