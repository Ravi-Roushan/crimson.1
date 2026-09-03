/* CrimBot AI — lightweight, self-contained, no external API required. */
(function(){'use strict';
  var launcher=document.getElementById('crimbot-launcher');
  var panel=document.getElementById('crimbot-panel');
  var close=document.getElementById('crimbot-close');
  var input=document.getElementById('crimbot-input');
  var send=document.getElementById('crimbot-send');
  var answer=document.getElementById('crimbot-answer');
  var chatLog=document.getElementById('crimbot-chat-log');
  var volume=document.getElementById('heroMuteBtn');
  if(!launcher||!panel)return;

  var faq={
    vision:'The Crimson is positioned as a luxury residential development in Borivali West, combining a refined Art Deco-inspired design language with elevated amenities and skyline-facing living.',
    location:'The Crimson is at S.V. Road, Borivali West, Mumbai. The site highlights seamless connectivity to metro and railway stations, the Western Express Highway, schools, colleges, hospitals, shopping and dining.',
    interior:'Explore premium interior spaces including the members lounge, game zone, kids play area, swimming pool, resto-bar, banquet hall, The Social, The Wellness, gymnasium, yoga room, steam & sauna, salon and entrance lobby.',
    exterior:'The gallery includes exterior views such as the front gate, front entry, full building, front elevation, swimming pool, terrace, outside building and skyline views.',
    experience:'Architecture is presented as inspired by Art Deco and the project experience is associated with Hafeez Contractor and a specialist consultant/partner network.',
    amenities:'Key amenities shown include Members Lounge, Game Zone, Kids Play Area, Swimming Pool, Resto-Bar, Banquet Hall, The Social, Pickleball, Padel, Badminton, Glass Box, Gymnasium, Yoga Room, Steam & Sauna, Salon and Landscaped Retreat.',
    gallery:'Open the Gallery page to switch between Interior and Exterior and explore the project imagery.',
    contact:'The Crimson Sales Lounge, S.V. Road, Opp. Punit Nagar, Beside Chamundi Petrol Pump, Borivali West 400092. Email: sales@thecrimson.co. Info: info@imbuildcon.in.',
    preview:'Use the Private Preview section to request a virtual tour, pricing details, floor plans, site visit, brochure or investment consultation.'
  };

  function reply(q){
    q=(q||'').toLowerCase();
    if(/\b(hi|hello|hey)\b/.test(q))return'Hello. I’m CrimBot AI. Ask me about The Crimson, its gallery, amenities, location, architecture or a private preview.';
    if(/interior/.test(q))return faq.interior;
    if(/exterior/.test(q))return faq.exterior;
    if(/amenit/.test(q))return faq.amenities;
    if(/where|location|address|connect/.test(q))return faq.location;
    if(/gallery/.test(q))return faq.gallery;
    if(/contact|email|mail|phone/.test(q))return faq.contact;
    if(/preview|brochure|price|pricing|floor plan|site visit|investment/.test(q))return faq.preview;
    if(/architect|hafeez|art deco|design/.test(q))return faq.experience;
    if(/vision|crimson|project/.test(q))return faq.vision;
    return'I can help with the project vision, location, Interior, Exterior, amenities, Gallery, architecture, contact details and Private Preview options. Try one of the quick questions above.';
  }

  function size(){
    return window.innerWidth<=768?40:46;
  }

  // Keep CrimBot fixed in the viewport, just above the volume control.
  // Do not anchor it to the scrolling hero element.
  function placeLauncher(){
    var mobile=window.innerWidth<=768;
    var s=size();
    var bottom=mobile ? 46 : 52;
    var right=mobile ? 19 : 39;
    launcher.style.setProperty('position','fixed','important');
    launcher.style.setProperty('width',s+'px','important');
    launcher.style.setProperty('height',s+'px','important');
    launcher.style.setProperty('right',right+'px','important');
    launcher.style.setProperty('bottom','calc('+(mobile?'5.8vh':'6.8vh')+' + '+bottom+'px)','important');
    launcher.style.setProperty('left','auto','important');
    launcher.style.setProperty('top','auto','important');
    launcher.style.setProperty('visibility','visible','important');
    launcher.style.setProperty('opacity','1','important');
    launcher.style.setProperty('pointer-events','auto','important');
    launcher.style.setProperty('z-index','2147483647','important');
    if(panel.classList.contains('is-open')) placePanel();
  }

  function placePanel(){
    var r=launcher.getBoundingClientRect();
    var mobile=window.innerWidth<=768;
    var panelWidth=Math.min(350,Math.max(260,window.innerWidth-(mobile?20:28)));
    var gap=14;
    var topMargin=10;
    var bottomEdge=Math.max(topMargin+160,Math.round(r.top-gap));
    var available=Math.max(160,bottomEdge-topMargin);
    var desired=mobile?Math.min(520,Math.floor(window.innerHeight*0.68)):520;
    var panelHeight=Math.min(desired,available);
    var right=Math.max(10,Math.round(window.innerWidth-r.right));
    panel.style.setProperty('width',panelWidth+'px','important');
    panel.style.setProperty('max-width',mobile?'calc(100vw - 20px)':'350px','important');
    panel.style.setProperty('height',panelHeight+'px','important');
    panel.style.setProperty('max-height',panelHeight+'px','important');
    panel.style.setProperty('right',right+'px','important');
    panel.style.setProperty('left','auto','important');
    panel.style.setProperty('top',Math.max(topMargin,Math.round(bottomEdge-panelHeight))+'px','important');
    panel.style.setProperty('bottom','auto','important');
    panel.style.setProperty('min-height','0','important');
  }


  function openBot(){
    placeLauncher();
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded','true');
    placePanel();
  }
  function shutBot(){
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded','false');
  }

  // Explicitly keep click ownership on the bot launcher.
  launcher.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    if(panel.classList.contains('is-open')) shutBot(); else openBot();
  });
  if(close) close.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();shutBot();});

  function addMessage(text,type){
    if(!chatLog)return;
    var el=document.createElement('div');
    el.className=type==='user'?'crimbot-chat-user':'crimbot-chat-bot';
    el.textContent=text;
    chatLog.appendChild(el);
    chatLog.scrollTop=chatLog.scrollHeight;
  }

  document.querySelectorAll('.crimbot-quick button').forEach(function(b){
    b.addEventListener('click',function(){
      var q=b.getAttribute('data-q')||b.textContent.trim();
      addMessage(q,'user'); addMessage(reply(q),'bot'); openBot();
    });
  });

  function submit(){
    if(!input)return;
    var q=input.value.trim();
    if(!q)return;
    addMessage(q,'user'); addMessage(reply(q),'bot'); input.value=''; openBot(); input.focus();
  }
  if(send)send.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();submit();});
  if(input)input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();submit();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')shutBot();});

  // Mouse wheel on the six quick-options row moves it horizontally, while preserving normal touch swiping.
  var quick=document.querySelector('.crimbot-quick');
  if(quick){
    quick.addEventListener('wheel',function(e){
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX) && quick.scrollWidth>quick.clientWidth){
        e.preventDefault();
        quick.scrollLeft += e.deltaY;
      }
    },{passive:false});
  }

  window.addEventListener('resize',placeLauncher,{passive:true});
  window.addEventListener('orientationchange',function(){setTimeout(placeLauncher,80);},{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',placeLauncher,{once:true}); else placeLauncher();
  setTimeout(placeLauncher,150);
})();
