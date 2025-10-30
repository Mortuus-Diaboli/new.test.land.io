// Purchase notification popup (Spanish) - appears every 20s, auto hides
(function(){
  var INTERVAL = 20000; // 20 seconds
  var DISPLAY_TIME = 5000; // visible duration
  var queue = [
    {name: 'Carlos', city: 'Madrid'},
    {name: 'Lucía', city: 'Barcelona'},
    {name: 'Javier', city: 'Valencia'},
    {name: 'María', city: 'Sevilla'},
    {name: 'Andrés', city: 'Zaragoza'},
    {name: 'Sofía', city: 'Bilbao'},
    {name: 'Raúl', city: 'Málaga'},
    {name: 'Elena', city: 'Alicante'},
    {name: 'Pablo', city: 'Murcia'},
    {name: 'Laura', city: 'Granada'}
  ];
  var products = ['Revitaprost', 'el producto', 'el tratamiento'];
  var root, timerShow, timerCycle;

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function buildText(){
    var user = rand(queue);
    var product = rand(products);
    // Example phrase: "Carlos de Madrid acaba de pedir Revitaprost"
    return '<strong>'+user.name+'</strong> de '+user.city+' acaba de pedir '+product+'.<small>Hace unos segundos</small>';
  }

  function ensureRoot(){
    if (root) return root;
    root = document.createElement('div');
    root.className = 'purchase-popup';
    root.setAttribute('aria-live','polite');
    root.innerHTML = '<div class="purchase-popup__icon">✓</div><button class="purchase-popup__close" aria-label="Cerrar">×</button><div class="purchase-popup__text"></div>';
    document.body.appendChild(root);
    root.querySelector('.purchase-popup__close').addEventListener('click', hidePopup);
    return root;
  }

  function showPopup(){
    var el = ensureRoot();
    var textEl = el.querySelector('.purchase-popup__text');
    textEl.innerHTML = buildText();
    requestAnimationFrame(function(){
      el.classList.add('purchase-popup--visible');
    });
    clearTimeout(timerShow);
    timerShow = setTimeout(hidePopup, DISPLAY_TIME);
  }

  function hidePopup(){
    if(!root) return;
    root.classList.remove('purchase-popup--visible');
  }

  function cycle(){
    showPopup();
    timerCycle = setTimeout(cycle, INTERVAL);
  }

  function init(){
    // start after slight delay so page loads first
    setTimeout(cycle, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
