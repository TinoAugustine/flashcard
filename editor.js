(function (blocks, blockEditor, element, components, i18n) {
  const { registerBlockType } = blocks;
  const { InspectorControls, MediaUpload, RichText } = blockEditor;
  const { PanelBody, Button, Notice, TextControl } = components;
  const { createElement: el, Fragment } = element;
  const { __ } = i18n;

  function parseCsvToCards(csvText) {
    const rows = [];
    let current = '';
    let inQuotes = false;
    const chars = csvText.replace(/\r\n/g, '\n').split('');
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
        if (row.some(cell => cell.length > 0)) resultRows.push(row);
        row = [];
      } else {
        current += c;
      }
    }
    if (current.length || row.length) {
      row.push(current.trim());
      if (row.some(cell => cell.length > 0)) resultRows.push(row);
    }

    if (!resultRows.length) return [];

    const firstRow = resultRows[0].map(c => c.toLowerCase());
    let startIndex = 0;
    if (firstRow.some(col => col.includes('question')) || firstRow.some(col => col.includes('answer'))) {
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
          .then(r => r.text())
          .then(text => {
            const parsed = parseCsvToCards(text);
            if (parsed.length) setAttributes({ cards: parsed });
          });
      };

      const count = cards?.length || 0;

      return el(
        Fragment,
        null,

        el(InspectorControls, {},
          el(PanelBody, { title: 'Header', initialOpen: true },
            el(TextControl, {
              label: 'Main title',
              value: title,
              onChange: value => setAttributes({ title: value })
            }),
            el(TextControl, {
              label: 'Subtitle',
              value: subtitle,
              onChange: value => setAttributes({ subtitle: value })
            })
          ),

          el(PanelBody, { title: 'Flashcards Settings', initialOpen: false },
            el('p', null, 'Upload CSV with Question + Answer columns'),
            el(MediaUpload, {
              onSelect: onSelectFile,
              allowedTypes: ['text/csv'],
              render: ({ open }) =>
                el(Button, { isSecondary: true, onClick: open },
                  csvUrl ? 'Replace CSV file' : 'Upload CSV file'
                )
            }),
            csvUrl && el(Notice, { status: 'info', isDismissible: false },
              'Using file: ' + csvUrl.split('/').pop()
            ),
            el('p', { style: { marginTop: 10 } }, 'Cards loaded: ' + count)
          )
        ),

        el('div', { className: 'flashcard-app' },

          el('header', { className: 'flashcard-header' },
            el('div', null,
              el(RichText, {
                tagName: 'h1',
                className: 'flashcard-main-title',
                value: title,
                onChange: v => setAttributes({ title: v }),
                placeholder: 'Test your knowledge'
              }),
              el(RichText, {
                tagName: 'p',
                className: 'flashcard-subtitle',
                value: subtitle,
                onChange: v => setAttributes({ subtitle: v }),
                placeholder: 'Deck title'
              })
            ),
            el('div', { className: 'flashcard-header-right' },
              el('button', { className: 'flashcard-maximize-toggle', disabled: true }, '⤢'),
              el('span', null, count ? `1 / ${count} cards` : '0 cards')
            )
          ),

          el('main', { className: 'flashcard-main' },
            el('button', { className: 'flashcard-nav-btn', disabled: true }, '‹'),

            el('section', { className: 'flashcard-card-wrapper' },
              el('div', { className: 'flashcard-card' },
                el('div', { className: 'flashcard-face flashcard-question' }, cards?.[0]?.q || 'Question here'),
                el('div', { className: 'flashcard-face flashcard-answer' }, cards?.[0]?.a || 'Answer here'),
                el('button', { className: 'flashcard-flip-btn', disabled: true }, 'See answer')
              ),
              el('div', { className: 'flashcard-card-meta' }, count ? `Card 1 of ${count}` : 'No cards loaded')
            ),

            el('button', { className: 'flashcard-nav-btn', disabled: true }, '›')
          ),

          el('footer', { className: 'flashcard-footer' },
            el('div', { className: 'flashcard-progress-bar' },
              el('div', { className: 'flashcard-progress-fill', style: { width: count ? `${100 / count}%` : '0%' } })
            ),
            el('p', { className: 'flashcard-tip' }, 'Preview only. Interaction on front-end.')
          )
        )
      );
    },

    save: function (props) {
      const { title, subtitle, cards } = props.attributes;
      const safeCards = Array.isArray(cards) ? cards : [];

      return el(
        'div',
        { className: 'flashcard-app', 'data-cards': JSON.stringify(safeCards) },

        el('div', { className: 'flashcard-inner' },

          el('header', { className: 'flashcard-header' },
            el('div', null,
              el('h1', { className: 'flashcard-main-title' }, title),
              el('p', { className: 'flashcard-subtitle' }, subtitle)
            ),
            el('div', { className: 'flashcard-header-right' },
              el('button', { className: 'flashcard-maximize-toggle', 'data-role': 'fullscreen-toggle' }, '⤢'),
              el('span', { className: 'flashcard-counter-header' },
                el('span', { 'data-role': 'counter-current' }, '1'),
                ' / ',
                el('span', { 'data-role': 'counter-total' }, safeCards.length || 0),
                ' cards'
              )
            )
          ),

          el('main', { className: 'flashcard-main' },
            el('button', { className: 'flashcard-nav-btn flashcard-nav-prev', 'data-role': 'prev' }, '‹'),

            el('section', { className: 'flashcard-card-wrapper' },
              el('div', { className: 'flashcard-card', 'data-role': 'card' },
                el('div', { className: 'flashcard-face flashcard-question', 'data-role': 'question' }),
                el('div', { className: 'flashcard-face flashcard-answer', 'data-role': 'answer' }),
                el('button', { className: 'flashcard-flip-btn', 'data-role': 'flip' }, 'See answer')
              ),
              el('div', { className: 'flashcard-card-meta' },
                el('span', { 'data-role': 'card-label' }, 'Card 1 of ' + (safeCards.length || 0))
              )
            ),

            el('button', { className: 'flashcard-nav-btn flashcard-nav-next', 'data-role': 'next' }, '›')
          ),

          el('footer', { className: 'flashcard-footer' },
            el('div', { className: 'flashcard-progress-bar' },
              el('div', { className: 'flashcard-progress-fill', 'data-role': 'progress' })
            ),
            el('p', { className: 'flashcard-tip' }, 'Tip: Click / tap to flip. Use ← and → keys.')
          )
        )
      );
    }

  });
})(
  window.wp.blocks,
  window.wp.blockEditor || window.wp.editor,
  window.wp.element,
  window.wp.components,
  window.wp.i18n
);
