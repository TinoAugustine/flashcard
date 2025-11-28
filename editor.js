(function (blocks, blockEditor, element, components, i18n) {
  const { registerBlockType } = blocks;
  const { InspectorControls, MediaUpload, RichText } = blockEditor;
  const { PanelBody, Button, Notice } = components;
  const { createElement: el, Fragment } = element;
  const { __ } = i18n;

  function parseCsvToCards(csvText) {
    // Simple but header-aware CSV parser for 2 columns (Q, A)
    const rows = [];
    let current = '';
    let inQuotes = false;
    const chars = csvText.replace(/\r\n/g, '\n').split('');

    const pushCell = () => {
      rows.push(current);
      current = '';
    };

    const resultRows = [];
    let row = [];

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === '"') {
        if (inQuotes && chars[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else if (c === '\n' && !inQuotes) {
        row.push(current.trim());
        current = '';
        if (row.length > 0 && row.some(cell => cell.length > 0)) {
          resultRows.push(row);
        }
        row = [];
      } else {
        current += c;
      }
    }
    if (current.length || row.length) {
      row.push(current.trim());
      if (row.some(cell => cell.length > 0)) {
        resultRows.push(row);
      }
    }

    if (!resultRows.length) return [];

    // Detect header if first row has "question" or "answer"
    const firstRow = resultRows[0].map(c => c.toLowerCase());
    let startIndex = 0;
    if (
      firstRow.some(col => col.includes('question')) ||
      firstRow.some(col => col.includes('answer'))
    ) {
      startIndex = 1;
    }

    const cards = [];
    for (let i = startIndex; i < resultRows.length; i++) {
      const r = resultRows[i];
      if (!r[0] || !r[1]) continue;
      cards.push({ q: r[0], a: r[1] });
    }
    return cards;
  }

  registerBlockType('setupmyhotel/flashcards', {
    edit: function (props) {
      const { attributes, setAttributes } = props;
      const { title, subtitle, cards, csvUrl } = attributes;

      const onSelectFile = (media) => {
        if (!media || !media.url) return;
        setAttributes({ csvUrl: media.url });

        fetch(media.url)
          .then((r) => r.text())
          .then((text) => {
            const parsed = parseCsvToCards(text);
            if (parsed && parsed.length) {
              setAttributes({ cards: parsed });
            } else {
              // no cards parsed – optional notice
              // console.log('No cards parsed from CSV');
            }
          })
          .catch((err) => {
            console.error('Error loading CSV', err);
          });
      };

      const cardCount = cards && cards.length ? cards.length : 0;

      return el(
        Fragment,
        null,
        el(
          InspectorControls,
          {},
          el(
            PanelBody,
            { title: __('Flashcards Settings', 'setupmyhotel'), initialOpen: true },
            el('p', null, __('Upload a CSV file with Question and Answer columns.', 'setupmyhotel')),
            el(MediaUpload, {
              onSelect: onSelectFile,
              allowedTypes: ['text/csv'],
              render: ({ open }) =>
                el(
                  Button,
                  { isSecondary: true, onClick: open },
                  csvUrl ? __('Replace CSV file', 'setupmyhotel') : __('Upload CSV file', 'setupmyhotel')
                ),
            }),
            csvUrl &&
              el(
                Notice,
                { status: 'info', isDismissible: false },
                __('Using CSV:', 'setupmyhotel') + ' ' + csvUrl.split('/').pop()
              ),
            el(
              'p',
              { style: { marginTop: '10px' } },
              __('Cards loaded:', 'setupmyhotel') + ' ' + cardCount
            )
          )
        ),
        el(
          'div',
          { className: 'flashcard-app' },
          el(
            'header',
            { className: 'flashcard-header' },
            el(
              'div',
              null,
              el(RichText, {
                tagName: 'h1',
                className: 'flashcard-main-title',
                value: title,
                onChange: (value) => setAttributes({ title: value }),
                placeholder: __('Test your knowledge', 'setupmyhotel'),
              }),
              el(RichText, {
                tagName: 'p',
                className: 'flashcard-subtitle',
                value: subtitle,
                onChange: (value) => setAttributes({ subtitle: value }),
                placeholder: __('Deck title', 'setupmyhotel'),
              })
            ),
            el(
              'div',
              { className: 'flashcard-header-right' },
              el(
                'button',
                { type: 'button', className: 'flashcard-maximize-toggle', disabled: true },
                '⤢'
              ),
              el(
                'span',
                null,
                (cards && cards.length ? 1 : 0) +
                  ' / ' +
                  (cards && cards.length ? cards.length : 0) +
                  ' cards'
              )
            )
          ),
          el(
            'main',
            { className: 'flashcard-main' },
            el('button', { className: 'flashcard-nav-btn', disabled: true }, '‹'),
            el(
              'section',
              { className: 'flashcard-card-wrapper' },
              el(
                'div',
                { className: 'flashcard-card' },
                el(
                  'div',
                  { className: 'flashcard-face flashcard-question' },
                  cards && cards.length ? cards[0].q : __('Question will appear here', 'setupmyhotel')
                ),
                el(
                  'div',
                  { className: 'flashcard-face flashcard-answer' },
                  cards && cards.length ? cards[0].a : __('Answer will appear here', 'setupmyhotel')
                ),
                el(
                  'button',
                  { type: 'button', className: 'flashcard-flip-btn', disabled: true },
                  __('See answer (preview only)', 'setupmyhotel')
                )
              ),
              el(
                'div',
                { className: 'flashcard-card-meta' },
                cards && cards.length
                  ? __('Card 1 of ', 'setupmyhotel') + cards.length
                  : __('No cards loaded yet', 'setupmyhotel')
              )
            ),
            el('button', { className: 'flashcard-nav-btn', disabled: true }, '›')
          ),
          el(
            'footer',
            { className: 'flashcard-footer' },
            el(
              'div',
              { className: 'flashcard-progress-bar' },
              el('div', {
                className: 'flashcard-progress-fill',
                style: { width: cardCount ? (1 / cardCount) * 100 + '%' : '0%' },
              })
            ),
            el(
              'p',
              { className: 'flashcard-tip' },
              __('Tip: Cards flip and navigate on the front-end.', 'setupmyhotel')
            )
          )
        )
      );
    },

    save: function (props) {
      const { title, subtitle, cards } = props.attributes;
      const safeCards = Array.isArray(cards) && cards.length ? cards : [];

      const seoList = safeCards.length
        ? safeCards.map((card, index) =>
            el(
              'div',
              { key: index, className: 'flashcard-seo-item' },
              el('h4', { className: 'flashcard-seo-question' }, card.q),
              el('p', { className: 'flashcard-seo-answer' }, card.a)
            )
          )
        : [
            el(
              'p',
              { className: 'flashcard-seo-empty' },
              __('No flashcards available yet.', 'setupmyhotel')
            ),
          ];

      return el(
        'div',
        {
          className: 'flashcard-app',
          'data-cards': JSON.stringify(safeCards),
        },
        el(
          'div',
          { className: 'flashcard-inner' },
          el(
            'header',
            { className: 'flashcard-header' },
            el(
              'div',
              null,
              el('h1', { className: 'flashcard-main-title' }, title),
              el('p', { className: 'flashcard-subtitle' }, subtitle)
            ),
            el(
              'div',
              { className: 'flashcard-header-right' },
              el(
                'button',
                {
                  type: 'button',
                  className: 'flashcard-maximize-toggle',
                  'data-role': 'fullscreen-toggle',
                },
                '⤢'
              ),
              el(
                'span',
                { className: 'flashcard-counter-header' },
                el('span', { 'data-role': 'counter-current' }, '1'),
                ' / ',
                el(
                  'span',
                  { 'data-role': 'counter-total' },
                  safeCards.length ? safeCards.length : 0
                ),
                ' cards'
              )
            )
          ),
          el(
            'main',
            { className: 'flashcard-main' },
            el(
              'button',
              {
                type: 'button',
                className: 'flashcard-nav-btn flashcard-nav-prev',
                'data-role': 'prev',
              },
              '‹'
            ),
            el(
              'section',
              { className: 'flashcard-card-wrapper' },
              el(
                'div',
                {
                  className: 'flashcard-card',
                  'data-role': 'card',
                },
                el(
                  'div',
                  {
                    className: 'flashcard-face flashcard-question',
                    'data-role': 'question',
                  }
                ),
                el(
                  'div',
                  {
                    className: 'flashcard-face flashcard-answer',
                    'data-role': 'answer',
                  }
                ),
                el(
                  'button',
                  {
                    type: 'button',
                    className: 'flashcard-flip-btn',
                    'data-role': 'flip',
                  },
                  'See answer'
                )
              ),
              el(
                'div',
                { className: 'flashcard-card-meta' },
                el('span', { 'data-role': 'card-label' }, 'Card 1 of ' + (safeCards.length || 0))
              )
            ),
            el(
              'button',
              {
                type: 'button',
                className: 'flashcard-nav-btn flashcard-nav-next',
                'data-role': 'next',
              },
              '›'
            )
          ),
          el(
            'footer',
            { className: 'flashcard-footer' },
            el(
              'div',
              { className: 'flashcard-progress-bar' },
              el('div', {
                className: 'flashcard-progress-fill',
                'data-role': 'progress',
              })
            ),
            el(
              'p',
              { className: 'flashcard-tip' },
              'Tip: Click / tap to flip. Use ← and → keys to move.'
            )
          )
        ),
        el(
          'div',
          { className: 'flashcard-seo-content', 'aria-hidden': 'true' },
          el('h3', { className: 'flashcard-seo-heading' }, __('Flashcard Q&A', 'setupmyhotel')),
          el('div', { className: 'flashcard-seo-list' }, seoList)
        )
      );
    },
  });
})(
  window.wp.blocks,
  window.wp.blockEditor || window.wp.editor,
  window.wp.element,
  window.wp.components,
  window.wp.i18n
);