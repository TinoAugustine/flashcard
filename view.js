(function () {
  function initFlashcardBlock(root) {
    const cardsData = root.getAttribute('data-cards') || '[]';
    let cards;
    try {
      cards = JSON.parse(cardsData);
    } catch (e) {
      cards = [];
    }
    if (!Array.isArray(cards) || !cards.length) {
      cards = [{ q: 'No cards loaded', a: 'Please upload a CSV file in the editor.' }];
    }

    const questionEl = root.querySelector('[data-role="question"]');
    const answerEl = root.querySelector('[data-role="answer"]');
    const flipBtn = root.querySelector('[data-role="flip"]');
    const cardEl = root.querySelector('[data-role="card"]');
    const prevBtn = root.querySelector('[data-role="prev"]');
    const nextBtn = root.querySelector('[data-role="next"]');
    const labelEl = root.querySelector('[data-role="card-label"]');
    const progressFill = root.querySelector('[data-role="progress"]');
    const headerCounterCurrent = root.querySelector('[data-role="counter-current"]');
    const headerCounterTotal = root.querySelector('[data-role="counter-total"]');
    const fullscreenToggle = root.querySelector('[data-role="fullscreen-toggle"]');

    let currentIndex = 0;
    let showingAnswer = false;

    if (headerCounterTotal) {
      headerCounterTotal.textContent = cards.length;
    }

    function renderCard() {
      const card = cards[currentIndex];
      if (questionEl) questionEl.textContent = card.q;
      if (answerEl) answerEl.textContent = card.a;
      if (labelEl)
        labelEl.textContent = 'Card ' + (currentIndex + 1) + ' of ' + cards.length;
      if (headerCounterCurrent) headerCounterCurrent.textContent = currentIndex + 1;
      if (progressFill) {
        progressFill.style.width =
          ((currentIndex + 1) / cards.length) * 100 + '%';
      }
      showingAnswer = false;
      if (cardEl) {
        cardEl.classList.remove('is-flipped');
      }
      if (flipBtn) {
        flipBtn.textContent = 'See answer';
      }
    }

    function flipCard() {
      showingAnswer = !showingAnswer;
      if (cardEl) {
        cardEl.classList.toggle('is-flipped', showingAnswer);
      }
      if (flipBtn) {
        flipBtn.textContent = showingAnswer ? 'See question' : 'See answer';
      }
    }

    function nextCard() {
      currentIndex = (currentIndex + 1) % cards.length;
      renderCard();
    }

    function prevCard() {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      renderCard();
    }

    if (flipBtn) {
      flipBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        flipCard();
      });
    }

    if (cardEl) {
      cardEl.addEventListener('click', function (e) {
        if (e.target !== flipBtn) {
          flipCard();
        }
      });
    }

    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (prevBtn) prevBtn.addEventListener('click', prevCard);

    window.addEventListener('keydown', function (e) {
      // Only react if user is interacting with this block
      const isFocused =
        root.classList.contains('flashcard-fullscreen') || root.matches(':hover');
      if (!isFocused) return;

      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') prevCard();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      }
    });

    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', function () {
        root.classList.toggle('flashcard-fullscreen');
      });
    }

    renderCard();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document
      .querySelectorAll('.flashcard-app')
      .forEach(function (root) {
        initFlashcardBlock(root);
      });
  });
})();
