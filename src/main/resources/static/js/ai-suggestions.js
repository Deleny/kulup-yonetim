document.addEventListener('DOMContentLoaded', () => {
    const clubBtn = document.getElementById('clubDescSuggestBtn');
    if (clubBtn) {
        clubBtn.addEventListener('click', async () => {
            const nameInput = document.querySelector('input[name="ad"]');
            const descInput = document.querySelector('textarea[name="aciklama"]');
            if (!nameInput || !descInput) {
                return;
            }
            const clubName = nameInput.value.trim();
            if (!clubName) {
                alert('Once kulup adini girin.');
                return;
            }

            clubBtn.disabled = true;
            const originalText = clubBtn.textContent;
            clubBtn.textContent = 'Oneriliyor...';

            try {
                const response = await fetch('/ai/club-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clubName })
                });
                const data = await response.json();
                if (data.description) {
                    descInput.value = data.description;
                }
            } catch (err) {
                alert('AI oneri su an calismiyor.');
            } finally {
                clubBtn.disabled = false;
                clubBtn.textContent = originalText;
            }
        });
    }

    const eventBtn = document.getElementById('eventSuggestBtn');
    if (eventBtn) {
        eventBtn.addEventListener('click', async () => {
            const titleInput = document.querySelector('input[name="baslik"]');
            const descInput = document.querySelector('textarea[name="aciklama"]');
            const locationInput = document.querySelector('input[name="konum"]');
            if (!titleInput || !descInput || !locationInput) {
                return;
            }

            const clubName = eventBtn.getAttribute('data-kulup-name') || '';
            eventBtn.disabled = true;
            const originalText = eventBtn.textContent;
            eventBtn.textContent = 'Oneriliyor...';

            try {
                const response = await fetch('/ai/event-suggestion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ clubName })
                });
                const data = await response.json();
                if (data.title) {
                    titleInput.value = data.title;
                }
                if (data.description) {
                    descInput.value = data.description;
                }
                if (data.location) {
                    locationInput.value = data.location;
                }
            } catch (err) {
                alert('AI oneri su an calismiyor.');
            } finally {
                eventBtn.disabled = false;
                eventBtn.textContent = originalText;
            }
        });
    }
});
