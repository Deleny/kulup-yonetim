document.addEventListener('DOMContentLoaded', () => {
    const assistant = document.querySelector('.ai-assistant');
    if (!assistant) {
        return;
    }

    const toggle = assistant.querySelector('.ai-toggle');
    const panel = assistant.querySelector('.ai-panel');
    const closeBtn = assistant.querySelector('.ai-close');
    const form = assistant.querySelector('.ai-form');
    const input = assistant.querySelector('.ai-input-field');
    const messages = assistant.querySelector('.ai-messages');

    const setOpen = (open) => {
        if (open) {
            panel.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            panel.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    };

    const addMessage = (role, text) => {
        const msg = document.createElement('div');
        msg.className = `ai-msg ${role}`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    };

    toggle.addEventListener('click', () => {
        setOpen(!panel.classList.contains('open'));
    });

    closeBtn.addEventListener('click', () => {
        setOpen(false);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) {
            return;
        }

        addMessage('user', text);
        input.value = '';
        input.focus();

        try {
            const response = await fetch('/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await response.json();
            addMessage('bot', data.reply || 'Su an yanit veremiyorum.');
        } catch (err) {
            addMessage('bot', 'Su an yanit veremiyorum.');
        }
    });
});
