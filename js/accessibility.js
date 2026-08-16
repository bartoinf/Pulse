/*
 * PULSE — Access Core V1.1
 * Preferências compartilhadas de acessibilidade + leitura integrada.
 */

(function () {
    'use strict';

    const body = document.body;
    const storageKey = 'pulse-accessibility';
    const defaults = { textSize: 'normal', contrast: false, reducedMotion: false };
    let preferences = loadPreferences();

    function loadPreferences() {
        try { return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
        catch (error) { return { ...defaults }; }
    }

    function savePreferences() {
        try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (error) {}
    }

    function setPressed(selector, value) {
        document.querySelectorAll(selector).forEach((button) => button.setAttribute('aria-pressed', String(value)));
    }

    function applyTextSize(size) {
        body.classList.remove('large-text', 'extra-large-text');
        if (size === 'large') body.classList.add('large-text');
        if (size === 'extra-large') body.classList.add('extra-large-text');
        setPressed('[data-text-size="normal"]', size === 'normal');
        setPressed('[data-text-size="large"]', size === 'large');
        setPressed('[data-text-size="extra-large"]', size === 'extra-large');
    }

    function applyContrast(enabled) { body.classList.toggle('high-contrast', enabled); setPressed('[data-toggle-contrast]', enabled); }
    function applyReducedMotion(enabled) { body.classList.toggle('reduced-motion', enabled); setPressed('[data-toggle-motion]', enabled); }
    function applyPreferences() { applyTextSize(preferences.textSize); applyContrast(preferences.contrast); applyReducedMotion(preferences.reducedMotion); }

    function getReadableContent() {
        const main = document.querySelector('main');
        if (!main) return '';
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, button, input, textarea, select, form').forEach((el) => el.remove());
        return clone.innerText.replace(/\s+/g, ' ').trim();
    }

    function speakPage() {
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        const text = getReadableContent();
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        const voices = speechSynthesis.getVoices();
        const preferred = voices.find((voice) => voice.lang.toLowerCase() === 'pt-br' && /linda|hugo|whisper/i.test(voice.name));
        if (preferred) utterance.voice = preferred;
        speechSynthesis.speak(utterance);
    }

    function stopSpeaking() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

    function buildPanel() {
        if (document.querySelector('.accessibility-toggle')) return;
        const toggle = document.createElement('button');
        toggle.type = 'button'; toggle.className = 'accessibility-toggle';
        toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-controls', 'pulse-accessibility-panel');
        toggle.textContent = '♿ Acessibilidade';

        const panel = document.createElement('aside');
        panel.className = 'accessibility-panel'; panel.id = 'pulse-accessibility-panel'; panel.hidden = true;
        panel.setAttribute('aria-labelledby', 'pulse-accessibility-title');
        panel.innerHTML = `
            <button class="accessibility-close" type="button" data-accessibility-close aria-label="Fechar acessibilidade">×</button>
            <h2 id="pulse-accessibility-title">Acessibilidade</h2>
            <p>Personalize a experiência do Pulse.</p>
            <fieldset class="accessibility-group"><legend>Tamanho do texto</legend><div class="accessibility-actions">
                <button class="accessibility-action" type="button" data-text-size="normal" aria-pressed="false">A</button>
                <button class="accessibility-action" type="button" data-text-size="large" aria-pressed="false">A+</button>
                <button class="accessibility-action" type="button" data-text-size="extra-large" aria-pressed="false">A++</button>
            </div></fieldset>
            <fieldset class="accessibility-group"><legend>Contraste</legend><button class="accessibility-action" type="button" data-toggle-contrast aria-pressed="false">Alto contraste</button></fieldset>
            <fieldset class="accessibility-group"><legend>Movimento</legend><button class="accessibility-action" type="button" data-toggle-motion aria-pressed="false">Reduzir movimento</button></fieldset>
            <fieldset class="accessibility-group"><legend>Leitura</legend><div class="accessibility-actions">
                <button class="accessibility-action" type="button" data-speak-page>🔊 Ler página</button>
                <button class="accessibility-action" type="button" data-stop-speech>⏹ Parar</button>
            </div></fieldset>`;

        document.body.append(toggle, panel);
        function setPanel(open) {
            panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open));
            if (open) panel.querySelector('.accessibility-close').focus(); else toggle.focus();
        }
        toggle.addEventListener('click', () => setPanel(panel.hidden));
        panel.querySelector('[data-accessibility-close]').addEventListener('click', () => setPanel(false));
        panel.querySelectorAll('[data-text-size]').forEach((button) => button.addEventListener('click', () => { preferences.textSize = button.dataset.textSize; applyTextSize(preferences.textSize); savePreferences(); }));
        panel.querySelector('[data-toggle-contrast]').addEventListener('click', () => { preferences.contrast = !preferences.contrast; applyContrast(preferences.contrast); savePreferences(); });
        panel.querySelector('[data-toggle-motion]').addEventListener('click', () => { preferences.reducedMotion = !preferences.reducedMotion; applyReducedMotion(preferences.reducedMotion); savePreferences(); });
        panel.querySelector('[data-speak-page]').addEventListener('click', speakPage);
        panel.querySelector('[data-stop-speech]').addEventListener('click', stopSpeaking);
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) setPanel(false); });
    }

    buildPanel(); applyPreferences();
})();
