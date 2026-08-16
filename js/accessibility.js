/*
 * PULSE — Recursos de acessibilidade
 * V1 — Fundação
 */

(function () {
    'use strict';

    const body = document.body;

    function setTextSize(size) {
        body.classList.remove('large-text', 'extra-large-text');

        if (size === 'large') {
            body.classList.add('large-text');
        }

        if (size === 'extra-large') {
            body.classList.add('extra-large-text');
        }
    }

    document.querySelectorAll('[data-text-size]').forEach((button) => {
        button.addEventListener('click', () => {
            setTextSize(button.dataset.textSize);
        });
    });

    const contrastButton = document.querySelector('[data-toggle-contrast]');

    if (contrastButton) {
        contrastButton.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
        });
    }
})();
