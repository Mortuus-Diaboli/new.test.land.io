// Floating phone button: scrolls to bottom order form
(function(){
  var TARGET_ID = 'order-form-bottom';
  function createButton(){
    if (document.querySelector('.floating-phone-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'floating-phone-btn';
    btn.setAttribute('aria-label','Ir al formulario de pedido');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.54a1 1 0 01-1 1C11.3 22.06 2 12.76 2 2.99a1 1 0 011-1H6.5a1 1 0 011 1c0 1.25.2 2.46.57 3.59a1 1 0 01-.25 1.01l-2.2 2.2z" fill="#fff"/></svg>';
    btn.addEventListener('click', function(){
      var target = document.getElementById(TARGET_ID);
      if (!target) return;
      try {
        target.scrollIntoView({behavior:'smooth', block:'start'});
      } catch(e){
        window.location.hash = '#' + TARGET_ID;
      }
    });
    document.body.appendChild(btn);
  }

  function init(){
    createButton();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
