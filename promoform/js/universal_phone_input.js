// Ensure initialization runs whether DOMContentLoaded has already fired or not
function startUniversalInit() {
  // Try geo lookup but don't block init; run init immediately with 'en', then update labels once geo resolves.
  initPhoneForms('en');
  fetch('https://ipinfo.io/json').then(function (r) { return r.json(); }).then(function (d) {
    var userCountry = (d && d.country) ? d.country : 'US';
    var lang = getLanguageFromCountry(userCountry);
    // Update existing labels language if they still default
    document.querySelectorAll('[data-phone-label]').forEach(function(el){
      if (!el.dataset.locked && el.textContent.trim() === '') el.textContent = getText('invalid', lang);
    });
  }).catch(function () { /* silent */ });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startUniversalInit);
} else {
  startUniversalInit();
}

function initPhoneForms(userLang) {
  document.querySelectorAll('.promoform-container form').forEach(function (form) {
    // Support multiple tel inputs per form later if needed
    var input = form.querySelector('input[type="tel"]');
    if (!input) return;

    // Ensure hidden + label exist; create if missing
    var hidden = form.querySelector('[data-phone-hidden]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'full_phone_number';
      hidden.setAttribute('data-phone-hidden','');
      form.appendChild(hidden);
    }
    var label = form.querySelector('[data-phone-label]');
    if (!label) {
      label = document.createElement('div');
      label.setAttribute('data-phone-label','');
      label.style.margin = '4px 0';
      label.style.fontSize = '14px';
      input.insertAdjacentElement('afterend', label);
    }

    var iti = null;
    try {
      if (window.intlTelInput) {
        iti = window.intlTelInput(input, {
          initialCountry: 'auto',
          geoIpLookup: function (success, failure) {
            fetch('https://ipinfo.io/json').then(function (r) { return r.json(); }).then(function (d2) { success(d2 && d2.country ? d2.country.toLowerCase() : 'us'); }).catch(function () { failure(); });
          },
          separateDialCode: true,
          nationalMode: false,
          autoHideDialCode: false,
          allowDropdown: true,
          autoPlaceholder: 'polite',
          utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js'
        });
        console.log('[phone] iti created for', input.id || input.name);
      } else {
        console.warn('[phone] intlTelInput not found on window at init time, retrying in 150ms');
        setTimeout(function(){
          if (!window.intlTelInput) return;
          try {
            iti = window.intlTelInput(input, {
              initialCountry: 'auto',
              separateDialCode: true,
              nationalMode: false,
              autoHideDialCode: false,
              allowDropdown: true,
              autoPlaceholder: 'polite',
              utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@25.11.2/build/js/utils.js'
            });
            console.log('[phone] iti created on retry for', input.id || input.name);
            adjustPadding();
          } catch(e2){ console.error('[phone] retry init failed', e2); }
        },150);
      }
    } catch (e) {
      console.error('[phone] init error', e);
    }

    function adjustPadding() {
        try {
          var wrapper = input.closest('.iti');
          if (!wrapper) return;
          var flagEl = wrapper.querySelector('.iti__flag-container');
          if (!flagEl) return;
          var dialEl = flagEl.querySelector('.iti__selected-dial-code');
          var inputRect = input.getBoundingClientRect();
          var refRect = (dialEl && dialEl.offsetWidth) ? dialEl.getBoundingClientRect() : flagEl.getBoundingClientRect();
          // distance from input left edge to right edge of dial area + gap
          var needed = Math.round((refRect.right - inputRect.left) + 10);
          if (needed < 52) needed = 52; // minimum safety
          var current = parseInt(window.getComputedStyle(input).paddingLeft, 10) || 0;
          if (Math.abs(current - needed) > 1) {
            input.style.paddingLeft = needed + 'px';
          }
        } catch (e) { /* silent */ }
    }

      // Stabilize padding with a short rAF loop (layout may shift after fonts / utils load)
      (function stabilizePadding(attempt){
        adjustPadding();
        if (attempt < 10) {
          requestAnimationFrame(function(){ stabilizePadding(attempt + 1); });
        }
      })(0);
      // Add focus styling class on wrapper for CSS styling of flag container
      try {
        var w = input.closest('.iti');
        if (w) {
          input.addEventListener('focus', function(){ w.classList.add('phone-focused'); });
          input.addEventListener('blur', function(){ w.classList.remove('phone-focused'); });
        }
      } catch(e){}

      /* ================== MASK PLACEHOLDER LOGIC ================== */
      // We keep autoPlaceholder (polite) temporarily to grab an example, then convert to a mask.
      function buildMask(example) {
        if (!example) return '';
        // Replace all digits with underscore, keep +, spaces, brackets, hyphens.
        var mask = example.replace(/\d/g, '_');
        // Collapse multiple spaces
        mask = mask.replace(/\s{2,}/g, ' ');
        return mask;
      }

      function applyMask() {
        try {
          // If utils not yet loaded, we may not have an example placeholder— defer.
          var ph = input.getAttribute('placeholder');
          if (!ph || ph.trim() === '' || ph.indexOf('_') !== -1) return; // already masked or empty
          var mask = buildMask(ph);
          if (mask) {
            input.dataset.maskPlaceholder = mask;
            input.setAttribute('placeholder', mask);
          }
        } catch (e) {}
      }

      // Show mask initially (after plugin sets placeholder)
      setTimeout(applyMask, 150);
      setTimeout(applyMask, 600);
      // Update mask when country changes (placeholder may change)
      input.addEventListener('countrychange', function(){ setTimeout(applyMask, 60); });

      // Hide mask while user focuses / types
      input.addEventListener('focus', function(){
        if (!input.value && input.dataset.maskPlaceholder) {
          input.setAttribute('placeholder', '');
        }
      });
      input.addEventListener('input', function(){
        if (input.value && input.dataset.maskPlaceholder) {
          if (input.getAttribute('placeholder')) input.setAttribute('placeholder','');
        }
      });
      input.addEventListener('blur', function(){
        if (!input.value && input.dataset.maskPlaceholder) {
          input.setAttribute('placeholder', input.dataset.maskPlaceholder);
        }
      });
      /* ================= END MASK PLACEHOLDER LOGIC ================ */

  setTimeout(adjustPadding, 20);
  setTimeout(adjustPadding, 250);
  setTimeout(adjustPadding, 600); // ensure after utils.js loads and dial code width finalizes
  setTimeout(adjustPadding, 1200); // late layout / font fallback
  // Observe dial code mutations (some versions update text after async utils load)
  try {
    var wrapper = input.closest('.iti');
    if (wrapper) {
      var dialNode = wrapper.querySelector('.iti__selected-dial-code');
      if (dialNode) {
        var mo = new MutationObserver(function(){ adjustPadding(); });
        mo.observe(dialNode, { characterData: true, childList: true, subtree: true });
      }
    }
  } catch (e) {}
    window.addEventListener('resize', adjustPadding);
    input.addEventListener('focus', adjustPadding);
    input.addEventListener('input', adjustPadding);

    function validate() {
        var selected = iti && iti.getSelectedCountryData ? iti.getSelectedCountryData() : null;
        var rawDigits = input.value.replace(/\D/g,'');
        var e164 = '';
        try { if (iti && typeof iti.getNumber === 'function') e164 = iti.getNumber(); } catch (e) { e164 = ''; }

        var pluginValid = false;
        if (iti && typeof iti.isValidNumber === 'function') {
          try { pluginValid = iti.isValidNumber(); } catch (e) { pluginValid = false; }
        }

        // Heuristic fallback: if utils not yet loaded or plugin still says false but user entered enough digits
        var heuristicValid = rawDigits.length >= 7; // simple length rule
        var finalValid = pluginValid || (!pluginValid && heuristicValid);

        if (!input.value.trim()) {
          label.textContent = getText('invalid', userLang);
          label.style.color = 'red';
          hidden.value = '';
          return;
        }

        if (finalValid) {
          var dial = (selected && selected.dialCode) ? selected.dialCode : '';
          // Prefer plugin e164 if it produced one and it starts with +
          if (e164 && /^\+\d{5,}$/.test(e164)) {
            hidden.value = e164;
          } else {
            var normalized = rawDigits.replace(/^0+/, '');
              hidden.value = dial ? ('+' + dial + normalized) : ('+' + normalized);
          }
          label.textContent = getText('valid', userLang);
          label.style.color = 'green';
        } else {
          label.textContent = getText('invalid', userLang);
          label.style.color = 'red';
          hidden.value = '';
        }
    }
    input.addEventListener('input', validate);
    input.addEventListener('change', validate);
  try { input.addEventListener('countrychange', function(){ adjustPadding(); validate(); }); } catch(e){}
  // Custom events from plugin for opening dropdown (v17+) - adjust after open
  // Some versions emit open/close events; keep safe listeners
  try { input.addEventListener('open:countrydropdown', function(){ setTimeout(adjustPadding, 30); }); } catch(e){}
  try { input.addEventListener('close:countrydropdown', function(){ setTimeout(adjustPadding, 30); }); } catch(e){}

    // Initial validation state
    validate();
    // Re-run after potential utils.js load (plugin may improve validity result)
    setTimeout(validate, 800);
    setTimeout(validate, 1600);

    form.addEventListener('submit', function(e){
      if (!hidden.value) { e.preventDefault(); alert(getText('invalid', userLang)); }
    });
  });
}

  function getLanguageFromCountry(code) {
    var map = { RU: 'ru', UA: 'ua', TR: 'tr', DE: 'de', FR: 'fr', ES: 'es', IT: 'it', PL: 'pl', US: 'en', GB: 'en', CA: 'en' };
    return map[code] || 'en';
  }

  function getText(type, lang) {
    var texts = {
      valid: { en: 'Valid number!', ru: 'Номер действителен!', ua: 'Дійсний номер!', tr: 'Geçerli numara!', de: 'Gültige Nummer!', fr: 'Numéro valide !', es: '¡Número válido!', it: 'Numero valido!', pl: 'Poprawny numer!' },
      invalid: { en: 'Invalid number', ru: 'Неправильный номер', ua: 'Неправильний номер', tr: 'Geçersiz numara', de: 'Ungültige Nummer', fr: 'Numéro invalide', es: 'Número no válido', it: 'Numero non valido', pl: 'Nieprawidłowy номер' }
    };
    return (texts[type] && texts[type][lang]) ? texts[type][lang] : texts[type]['en'];
  }
