/* Stone Crusher order desk: shared store, i18n, helpers (demo: state lives in localStorage) */
(function () {
  const WA = '5997178728';
  const KEY = 'sc-desk-v1';
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  function defaultPumpDays() {
    const out = []; let d = new Date(); let i = 0;
    for (const step of [1, 2, 5, 8, 9, 13]) { let x = addDays(d, step); if (x.getDay() === 0) x = addDays(x, 1); out.push(ymd(x)); i++; }
    return out;
  }

  const DEFAULTS = () => ({
    status: { mode: 'open', note: '' },
    cutoff: '2026-12-11',
    holidayFrom: '2026-12-24',
    holidayTo: '2027-01-04',
    pricesUpdated: ymd(new Date()),
    products: [
      { id: 'c2025', kind: 'concrete', name: 'Ready-mix C20/25', unit: 'm3', price: 230, promo: true, img: 'aggregate-pour-sm' },
      { id: 'c2530', kind: 'concrete', name: 'Ready-mix C25/30', unit: 'm3', price: null, promo: false, img: 'pump-harbour-sm' },
      { id: 'cur3', kind: 'stone', name: 'Steenslag Curaçao #3', unit: 'm3', price: null, promo: false, img: 'curacao3' },
      { id: 'stod', kind: 'stone', name: 'Steenslag Sto. Domingo', unit: 'm3', price: null, promo: false, img: 'stodomingo' },
      { id: 'grey', kind: 'stone', name: 'Grey gravel', unit: 'm3', price: null, promo: false, img: 'grey-gravel-sm' },
      { id: 'sand', kind: 'stone', name: 'Sand', unit: 'm3', price: null, promo: false, img: '' },
      { id: 'cem', kind: 'bag', name: 'Argos Portland cement', unit: 'bag', price: null, promo: false, img: '' }
    ],
    pump: defaultPumpDays(),
    orders: []
  });

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.products) return s; } catch (e) {}
    return DEFAULTS();
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* ---------- i18n ---------- */
  const T = {
    en: {
      'st.open': 'Open and taking orders', 'st.early': 'Closing early today', 'st.closed': 'Closed today', 'st.holiday': 'Holiday break',
      'st.cutoff': 'Last orders before the holiday break: {d}',
      'nav.prices': 'Prices', 'nav.order': 'Order', 'nav.guide': 'Mix guide', 'nav.contact': 'Contact', 'cta.order': 'Order now',
      'hero.h1': 'Book your concrete in two minutes.',
      'hero.p': "Today's prices, free pump dates and one clear message to the office. Ready-mix, steenslag, sand and cement from Kaya Industria.",
      'hero.c1': 'Start an order', 'hero.c2': "See today's prices",
      'today.t': 'Today at the plant', 'today.pump': 'Pump free from', 'today.upd': 'Prices updated', 'today.cut': 'Last orders',
      'pr.h': "Today's prices.", 'pr.p': 'Set by our office and updated the moment they change. No more scrolling Facebook for the latest flyer.',
      'pr.ask': 'On request', 'pr.order': 'Order', 'pr.special': 'Special', 'u.m3': 'per m³', 'u.bag': 'per bag',
      'or.h': 'Order desk.', 'or.p': 'Fill it in once. The office gets one complete message and confirms your slot.',
      'or.what': 'What do you need?', 'or.how': 'How much?', 'or.calcT': 'Work it out from your slab',
      'or.L': 'Length (m)', 'or.W': 'Width (m)', 'or.T': 'Thickness (cm)', 'or.qty': 'Quantity', 'or.extra': 'We add 5% extra and round up to the next half m³.',
      'or.when': 'When?', 'or.free': 'Free', 'or.pumpb': 'Pump booked', 'or.closed': 'Closed',
      'or.pump': 'Add the concrete pump', 'or.pumpBusy': 'The pump is booked that day. Pick another date or skip the pump.',
      'or.where': 'Where?', 'or.area': 'Area', 'or.addr': 'Street and house number, or send a map pin later', 'or.name': 'Your name', 'or.phone': 'Phone or WhatsApp', 'or.note': 'Anything the driver should know?',
      'su.t': 'Your order', 'su.prod': 'Product', 'su.qty': 'Amount', 'su.date': 'Date', 'su.pump': 'Pump', 'su.area': 'Area', 'su.yes': 'Yes', 'su.no': 'No',
      'su.est': 'Estimate', 'su.estn': 'Plus delivery, confirmed by the office.', 'su.ask': 'Price confirmed by the office.',
      'su.send': 'Send order on WhatsApp', 'su.miss': 'Pick a product, an amount and a date.', 'su.ok': 'Order {r} is ready. WhatsApp opens with everything filled in. The office confirms your slot.',
      'gd.h': 'Which concrete do I need?', 'gd.n': 'Building something structural? Your engineer has the final word.',
      'gd.r1': 'Blinding layer under foundations', 'gd.r2': 'House floors, foundations, footpaths', 'gd.r3': 'Columns, beams, roof slabs, driveways', 'gd.r4': 'Cisterns, pools, anything near the sea',
      'ar.h': 'We deliver all over Bonaire.', 'ar.p': 'From Rincon to Sorobon. Delivery cost depends on distance and load. The office confirms it with your order.',
      'cr.h': 'Bonaire builds with this crew.', 'cr.p': 'Drivers, operators, plant staff and the office. Every load you order passes through these hands.',
      'ct.h': 'Come by or call.', 'ct.call': 'Call the office', 'ct.wa': 'Fastest for orders', 'ct.mail': 'Quotes and invoices',
      'ft.office': 'Office view (demo)', 'ft.by': 'Design preview by Salty Code Studio'
    },
    nl: {
      'st.open': 'Open, we nemen bestellingen aan', 'st.early': 'Vandaag eerder dicht', 'st.closed': 'Vandaag gesloten', 'st.holiday': 'Feestdagensluiting',
      'st.cutoff': 'Laatste bestellingen voor de feestdagen: {d}',
      'nav.prices': 'Prijzen', 'nav.order': 'Bestellen', 'nav.guide': 'Betongids', 'nav.contact': 'Contact', 'cta.order': 'Bestel nu',
      'hero.h1': 'Beton bestellen in twee minuten.',
      'hero.p': 'Prijzen van vandaag, vrije pompdagen en één duidelijk bericht aan kantoor. Stortklaar beton, steenslag, zand en cement van Kaya Industria.',
      'hero.c1': 'Start je bestelling', 'hero.c2': 'Prijzen van vandaag',
      'today.t': 'Vandaag op de centrale', 'today.pump': 'Pomp vrij vanaf', 'today.upd': 'Prijzen bijgewerkt', 'today.cut': 'Laatste bestellingen',
      'pr.h': 'Prijzen van vandaag.', 'pr.p': 'Door ons kantoor ingesteld en meteen aangepast als ze veranderen. Niet meer door Facebook scrollen voor de laatste flyer.',
      'pr.ask': 'Op aanvraag', 'pr.order': 'Bestel', 'pr.special': 'Actie', 'u.m3': 'per m³', 'u.bag': 'per zak',
      'or.h': 'Bestelbalie.', 'or.p': 'Eén keer invullen. Kantoor krijgt één compleet bericht en bevestigt je tijdslot.',
      'or.what': 'Wat heb je nodig?', 'or.how': 'Hoeveel?', 'or.calcT': 'Reken het uit vanaf je vloer',
      'or.L': 'Lengte (m)', 'or.W': 'Breedte (m)', 'or.T': 'Dikte (cm)', 'or.qty': 'Hoeveelheid', 'or.extra': 'We tellen 5% extra en ronden af op een halve m³.',
      'or.when': 'Wanneer?', 'or.free': 'Vrij', 'or.pumpb': 'Pomp bezet', 'or.closed': 'Gesloten',
      'or.pump': 'Betonpomp erbij', 'or.pumpBusy': 'De pomp is die dag bezet. Kies een andere datum of bestel zonder pomp.',
      'or.where': 'Waar?', 'or.area': 'Wijk', 'or.addr': 'Straat en huisnummer, of stuur later een locatie', 'or.name': 'Je naam', 'or.phone': 'Telefoon of WhatsApp', 'or.note': 'Iets wat de chauffeur moet weten?',
      'su.t': 'Je bestelling', 'su.prod': 'Product', 'su.qty': 'Hoeveelheid', 'su.date': 'Datum', 'su.pump': 'Pomp', 'su.area': 'Wijk', 'su.yes': 'Ja', 'su.no': 'Nee',
      'su.est': 'Schatting', 'su.estn': 'Plus bezorging, bevestigd door kantoor.', 'su.ask': 'Prijs wordt bevestigd door kantoor.',
      'su.send': 'Verstuur via WhatsApp', 'su.miss': 'Kies een product, hoeveelheid en datum.', 'su.ok': 'Bestelling {r} staat klaar. WhatsApp opent met alles ingevuld. Kantoor bevestigt je tijdslot.',
      'gd.h': 'Welk beton heb ik nodig?', 'gd.n': 'Iets constructiefs? Je constructeur heeft het laatste woord.',
      'gd.r1': 'Werkvloer onder funderingen', 'gd.r2': 'Vloeren, funderingen, paden', 'gd.r3': 'Kolommen, balken, dakvloeren, opritten', 'gd.r4': 'Regenbakken, zwembaden, alles bij zee',
      'ar.h': 'We bezorgen op heel Bonaire.', 'ar.p': 'Van Rincon tot Sorobon. Bezorgkosten hangen af van afstand en lading. Kantoor bevestigt ze bij je bestelling.',
      'cr.h': 'Bonaire bouwt met deze ploeg.', 'cr.p': 'Chauffeurs, machinisten, centralepersoneel en kantoor. Elke lading gaat door deze handen.',
      'ct.h': 'Kom langs of bel.', 'ct.call': 'Bel kantoor', 'ct.wa': 'Snelst voor bestellingen', 'ct.mail': 'Offertes en facturen',
      'ft.office': 'Kantoorweergave (demo)', 'ft.by': 'Ontwerpvoorstel door Salty Code Studio'
    },
    pap: {
      'st.open': 'Habrí i nos ta tuma òrdu', 'st.early': 'Awe nos ta sera mas tempran', 'st.closed': 'Awe nos ta sera', 'st.holiday': 'Vakansi di fin di aña',
      'st.cutoff': 'Último dia pa ordená promé ku vakansi: {d}',
      'nav.prices': 'Preis', 'nav.order': 'Ordená', 'nav.guide': 'Guia di beton', 'nav.contact': 'Kontakto', 'cta.order': 'Ordená awor',
      'hero.h1': 'Ordená bo beton den dos minüt.',
      'hero.p': 'Preis di awe, dianan ku e pomp ta liber i un mensahe kla pa ofisina. Beton, steenslag, santu i semènt for di Kaya Industria.',
      'hero.c1': 'Kuminsá bo òrdu', 'hero.c2': 'Mira preis di awe',
      'today.t': 'Awe na planta', 'today.pump': 'Pomp liber for di', 'today.upd': 'Preis aktualisá', 'today.cut': 'Último òrdu',
      'pr.h': 'Preis di awe.', 'pr.p': 'Nos ofisina ta pone nan i ta kambia nan mesora. No mester buska den Facebook mas pa e último flyer.',
      'pr.ask': 'Puntra pa preis', 'pr.order': 'Ordená', 'pr.special': 'Spesial', 'u.m3': 'pa m³', 'u.bag': 'pa saku',
      'or.h': 'Mesa di òrdu.', 'or.p': 'Yena un biaha. Ofisina ta haña un mensahe kompleto i ta konfirmá bo ora.',
      'or.what': 'Kiko bo mester?', 'or.how': 'Kuantu?', 'or.calcT': 'Kalkulá for di bo vloer',
      'or.L': 'Largura (m)', 'or.W': 'Hanchura (m)', 'or.T': 'Diki (cm)', 'or.qty': 'Kantidat', 'or.extra': 'Nos ta pone 5% ekstra i rondu te na e siguiente mitar m³.',
      'or.when': 'Ki dia?', 'or.free': 'Liber', 'or.pumpb': 'Pomp okupá', 'or.closed': 'Será',
      'or.pump': 'Agregá e pomp di beton', 'or.pumpBusy': 'E pomp ta okupá e dia ei. Skohe otro dia òf ordená sin pomp.',
      'or.where': 'Unda?', 'or.area': 'Bario', 'or.addr': 'Kaya i number di kas, òf manda un lokashon despues', 'or.name': 'Bo nòmber', 'or.phone': 'Telefòn òf WhatsApp', 'or.note': 'Algu ku e chófer mester sa?',
      'su.t': 'Bo òrdu', 'su.prod': 'Produkto', 'su.qty': 'Kantidat', 'su.date': 'Dia', 'su.pump': 'Pomp', 'su.area': 'Bario', 'su.yes': 'Si', 'su.no': 'No',
      'su.est': 'Estimashon', 'su.estn': 'Mas entrega, ofisina ta konfirmá.', 'su.ask': 'Ofisina ta konfirmá e preis.',
      'su.send': 'Manda òrdu via WhatsApp', 'su.miss': 'Skohe un produkto, kantidat i dia.', 'su.ok': 'Òrdu {r} ta kla. WhatsApp ta habri ku tur kos yená. Ofisina ta konfirmá bo ora.',
      'gd.h': 'Ki beton mi mester?', 'gd.n': 'Bo ta traha algu struktural? Bo ingeniero tin e último palabra.',
      'gd.r1': 'Kapa bou di fundeshon', 'gd.r2': 'Vloer di kas, fundeshon, kaminda', 'gd.r3': 'Pilá, balki, dak, oprit', 'gd.r4': 'Regenbak, piscina, tur kos serka laman',
      'ar.h': 'Nos ta entregá rònt Boneiru.', 'ar.p': 'For di Rincon te Sorobon. Kosto di entrega ta dependé di distansia i karga. Ofisina ta konfirmá ku bo òrdu.',
      'cr.h': 'Boneiru ta traha ku e ekipo aki.', 'cr.p': 'Chófer, operador, hende di planta i ofisina. Tur karga ku bo ordená ta pasa den e mannan aki.',
      'ct.h': 'Pasa òf yama.', 'ct.call': 'Yama ofisina', 'ct.wa': 'Mas lihé pa òrdu', 'ct.mail': 'Kotisashon i faktura',
      'ft.office': 'Vista di ofisina (demo)', 'ft.by': 'Diseño di prueba pa Salty Code Studio'
    },
    es: {
      'st.open': 'Abierto, aceptamos pedidos', 'st.early': 'Hoy cerramos temprano', 'st.closed': 'Hoy cerrado', 'st.holiday': 'Vacaciones de fin de año',
      'st.cutoff': 'Últimos pedidos antes de las vacaciones: {d}',
      'nav.prices': 'Precios', 'nav.order': 'Pedir', 'nav.guide': 'Guía de concreto', 'nav.contact': 'Contacto', 'cta.order': 'Pedir ahora',
      'hero.h1': 'Pide tu concreto en dos minutos.',
      'hero.p': 'Precios de hoy, días libres de la bomba y un mensaje claro a la oficina. Concreto premezclado, piedra, arena y cemento desde Kaya Industria.',
      'hero.c1': 'Empezar pedido', 'hero.c2': 'Ver precios de hoy',
      'today.t': 'Hoy en la planta', 'today.pump': 'Bomba libre desde', 'today.upd': 'Precios actualizados', 'today.cut': 'Últimos pedidos',
      'pr.h': 'Precios de hoy.', 'pr.p': 'Los pone nuestra oficina y cambian en el momento. Ya no hace falta buscar el último flyer en Facebook.',
      'pr.ask': 'A consultar', 'pr.order': 'Pedir', 'pr.special': 'Oferta', 'u.m3': 'por m³', 'u.bag': 'por saco',
      'or.h': 'Mesa de pedidos.', 'or.p': 'Llénalo una vez. La oficina recibe un mensaje completo y confirma tu horario.',
      'or.what': '¿Qué necesitas?', 'or.how': '¿Cuánto?', 'or.calcT': 'Calcúlalo desde tu losa',
      'or.L': 'Largo (m)', 'or.W': 'Ancho (m)', 'or.T': 'Espesor (cm)', 'or.qty': 'Cantidad', 'or.extra': 'Sumamos 5% extra y redondeamos al siguiente medio m³.',
      'or.when': '¿Cuándo?', 'or.free': 'Libre', 'or.pumpb': 'Bomba ocupada', 'or.closed': 'Cerrado',
      'or.pump': 'Agregar la bomba de concreto', 'or.pumpBusy': 'La bomba está ocupada ese día. Elige otra fecha o pide sin bomba.',
      'or.where': '¿Dónde?', 'or.area': 'Zona', 'or.addr': 'Calle y número, o manda la ubicación después', 'or.name': 'Tu nombre', 'or.phone': 'Teléfono o WhatsApp', 'or.note': '¿Algo que deba saber el chofer?',
      'su.t': 'Tu pedido', 'su.prod': 'Producto', 'su.qty': 'Cantidad', 'su.date': 'Fecha', 'su.pump': 'Bomba', 'su.area': 'Zona', 'su.yes': 'Sí', 'su.no': 'No',
      'su.est': 'Estimado', 'su.estn': 'Más entrega, confirmada por la oficina.', 'su.ask': 'La oficina confirma el precio.',
      'su.send': 'Enviar pedido por WhatsApp', 'su.miss': 'Elige un producto, una cantidad y una fecha.', 'su.ok': 'El pedido {r} está listo. WhatsApp se abre con todo lleno. La oficina confirma tu horario.',
      'gd.h': '¿Qué concreto necesito?', 'gd.n': '¿Algo estructural? Tu ingeniero tiene la última palabra.',
      'gd.r1': 'Capa de limpieza bajo cimientos', 'gd.r2': 'Pisos, cimientos, aceras', 'gd.r3': 'Columnas, vigas, losas de techo, entradas', 'gd.r4': 'Cisternas, piscinas, todo cerca del mar',
      'ar.h': 'Entregamos en todo Bonaire.', 'ar.p': 'De Rincon a Sorobon. El costo depende de la distancia y la carga. La oficina lo confirma con tu pedido.',
      'cr.h': 'Bonaire construye con este equipo.', 'cr.p': 'Choferes, operadores, gente de planta y oficina. Cada carga pasa por estas manos.',
      'ct.h': 'Ven o llama.', 'ct.call': 'Llama a la oficina', 'ct.wa': 'Lo más rápido para pedidos', 'ct.mail': 'Cotizaciones y facturas',
      'ft.office': 'Vista de oficina (demo)', 'ft.by': 'Propuesta de diseño por Salty Code Studio'
    }
  };
  const PAP_DAYS = ['dum', 'lun', 'mar', 'rsn', 'wep', 'bie', 'sab'];
  const PAP_MONTHS = ['yanüari', 'febrüari', 'mart', 'aprel', 'mei', 'yüni', 'yüli', 'ougùstùs', 'sèptèmber', 'òktober', 'novèmber', 'desèmber'];

  let lang = 'en';
  try { lang = localStorage.getItem('sc-lang') || (navigator.language || 'en').slice(0, 2); } catch (e) {}
  if (!T[lang]) lang = 'en';

  const t = (k, vars) => { let s = (T[lang] && T[lang][k]) || T.en[k] || k; if (vars) for (const v in vars) s = s.replace('{' + v + '}', vars[v]); return s; };
  const locale = () => ({ en: 'en-GB', nl: 'nl-NL', es: 'es', pap: 'nl-NL' })[lang];
  function fmtDate(iso, opts) {
    const d = new Date(iso + 'T12:00:00');
    if (lang === 'pap') return `${d.getDate()} ${PAP_MONTHS[d.getMonth()]}`;
    return d.toLocaleDateString(locale(), opts || { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function monthName(y, m) {
    if (lang === 'pap') return `${PAP_MONTHS[m]} ${y}`;
    return new Date(y, m, 1).toLocaleDateString(locale(), { month: 'long', year: 'numeric' });
  }
  function dayNames() {
    const base = new Date(2024, 0, 1); // Monday
    if (lang === 'pap') return [1, 2, 3, 4, 5, 6, 0].map(i => PAP_DAYS[i]);
    return [...Array(7)].map((_, i) => addDays(base, i).toLocaleDateString(locale(), { weekday: 'short' }).slice(0, 2));
  }
  function applyI18n(root) {
    (root || document).querySelectorAll('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
    (root || document).querySelectorAll('[data-ip]').forEach(el => { el.placeholder = t(el.dataset.ip); });
    document.documentElement.lang = lang === 'pap' ? 'pap' : lang;
  }
  function setLang(l) { lang = l; try { localStorage.setItem('sc-lang', l); } catch (e) {} document.dispatchEvent(new Event('langchange')); }

  function dayState(s, iso) {
    const d = new Date(iso + 'T12:00:00');
    if (d.getDay() === 0) return 'closed';
    if (iso >= s.holidayFrom && iso <= s.holidayTo) return 'closed';
    if (s.pump.includes(iso)) return 'pump';
    return 'free';
  }
  function nextPumpFree(s) {
    let d = addDays(new Date(), 1);
    for (let i = 0; i < 60; i++) { const iso = ymd(d); if (dayState(s, iso) === 'free') return iso; d = addDays(d, 1); }
    return null;
  }
  const money = n => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const wa = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  window.SC = { load, save, reset, t, applyI18n, setLang, get lang() { return lang; }, fmtDate, monthName, dayNames, dayState, nextPumpFree, ymd, addDays, money, wa, langs: ['pap', 'nl', 'en', 'es'] };
})();
