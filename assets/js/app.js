/* US Kites — page logic. All content values come from config.js. */
(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TZ = "Asia/Karachi";
  var yy = String(C.basantYear).slice(-2);
  var catById = {};
  C.categories.forEach(function (c) { catById[c.id] = c; });

  /* ---------- 1. Fill {{tokens}} from config ---------- */
  var tokens = {
    year: C.basantYear,
    brand: C.brandName,
    city: C.city,
    siteUrl: C.siteUrl.replace(/\/$/, ""),
    waDisplay: C.whatsappDisplay,
    licenceNo: C.licence.number,
    licenceBy: C.licence.issuedBy,
    hours: C.businessHours,
    deliveryAreas: C.deliveryAreas,
    pickupAddress: C.pickupAddress,
  };
  function fill(str) {
    return str.replace(/\{\{(\w+)\}\}/g, function (m, k) { return k in tokens ? tokens[k] : m; });
  }
  function fillTokens(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) if (n.nodeValue.indexOf("{{") > -1) n.nodeValue = fill(n.nodeValue);
    ["content", "href", "alt", "aria-label", "title", "placeholder"].forEach(function (a) {
      $$("[" + a + "*='{{']", root).forEach(function (el) { el.setAttribute(a, fill(el.getAttribute(a))); });
    });
  }

  /* ---------- 2. Dates ---------- */
  function fmtDate(iso, opts) {
    return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: TZ }, opts))
      .format(new Date(iso + "T12:00:00+05:00"));
  }
  var datesNote = C.datesConfirmed
    ? "Dates as notified by the Government of Punjab."
    : "Tentative dates. Final Basant " + C.basantYear + " dates will be as notified by the Government of Punjab.";

  var binds = {
    datesNote: datesNote,
    licenceValid: fmtDate(C.licence.validTill, { day: "numeric", month: "long", year: "numeric" }),
    copyrightYear: new Date().getFullYear(),
    tagline: C.tagline,
    slogan: C.slogan,
  };

  function renderDates() {
    var ul = $("#date-list");
    ul.innerHTML = C.basantDates.map(function (d) {
      return "<li><b>" + fmtDate(d, { weekday: "short" }) + "</b> " +
        fmtDate(d, { day: "numeric", month: "long", year: "numeric" }) + "</li>";
    }).join("");
  }

  function startCountdown() {
    var target = new Date(C.basantDates[0] + "T00:00:00+05:00").getTime();
    var box = $("#countdown");
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        box.querySelector(".countdown-grid").outerHTML = '<p class="countdown-live">Basant ' + C.basantYear + " is here — order now for same-day pickup!</p>";
        return;
      }
      var s = Math.floor(diff / 1000);
      var parts = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      Object.keys(parts).forEach(function (k) {
        box.querySelector('[data-cd="' + k + '"]').textContent = k === "d" ? parts[k] : String(parts[k]).padStart(2, "0");
      });
      setTimeout(tick, 1000);
    }
    tick();
  }

  /* ---------- 3. WhatsApp links ---------- */
  var orderRef = (function () {
    var key = "usk-ref-" + C.basantYear, ref;
    try { ref = sessionStorage.getItem(key); } catch (e) {}
    if (!ref) {
      ref = "USK" + yy + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      try { sessionStorage.setItem(key, ref); } catch (e) {}
    }
    return ref;
  })();

  function waUrl(text) {
    return "https://wa.me/" + C.whatsappNumber + "?text=" + encodeURIComponent(text);
  }
  var greet = "Assalam o Alaikum " + C.brandName + "! ";
  var intent = C.bookingOpen ? "I want to book for Basant " + C.basantYear : "Please add me to the waiting list for Basant " + C.basantYear;

  var generalMsgs = {
    general: greet + intent + ". Please share the available kites and rates.",
    wholesale: greet + "I want a wholesale rate for Basant " + C.basantYear + " kites / Dor Pinna. Quantity: ",
    delivery: greet + intent + " with home delivery. My area: ",
    licence: greet + "Please share a copy of your kite manufacturing licence (" + C.licence.number + ").",
  };

  function priceText(p) {
    return p.price != null ? C.currency + " " + p.price.toLocaleString("en-PK") + " / " + p.unit : null;
  }
  function orderLines(items) {
    return items.map(function (it) {
      var p = productById[it.id];
      return "• " + p.name + " × " + it.qty + " " + p.unit +
        (priceText(p) ? " (" + priceText(p) + ")" : "");
    }).join("\n");
  }
  function orderMessage(items, extra) {
    extra = extra || {};
    return greet + intent + ":\n\n" + orderLines(items) +
      "\n\nDelivery / pickup: " + (extra.fulfil || "Home delivery / Self pickup") +
      "\nName: " + (extra.name || "") +
      "\nArea: " + (extra.area || "") +
      "\n\nOrder ref: " + orderRef;
  }

  function track(label, value) {
    try {
      if (window.gtag) window.gtag("event", "generate_lead", { method: "whatsapp", event_label: label, value: value || 0 });
      if (window.fbq) window.fbq("track", "Lead", { content_name: label });
      if (window.dataLayer) window.dataLayer.push({ event: "whatsapp_click", label: label });
    } catch (e) {}
  }

  function wireGeneralLinks() {
    $$("[data-wa]").forEach(function (a) {
      a.href = waUrl(generalMsgs[a.getAttribute("data-wa")] || generalMsgs.general);
      a.addEventListener("click", function () { track("cta_" + a.getAttribute("data-wa")); });
    });
  }

  /* ---------- 4. Products ---------- */
  var productById = {};
  C.products.forEach(function (p) { productById[p.id] = p; });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function cardHTML(p) {
    var cat = catById[p.category];
    var price = priceText(p);
    return '<article class="card" data-cat="' + p.category + '" id="p-' + p.id + '">' +
      '<div class="card-media" data-side="front">' +
        (p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : "") +
        '<button class="flip-hit" type="button" aria-label="Flip to see back of ' + esc(p.name) + '">' +
          '<span class="flip-inner">' +
            '<img class="face front" src="' + p.images.front + '" alt="' + esc(p.name) + ' kite, front side" width="400" height="440" loading="lazy">' +
            '<img class="face back" src="' + p.images.back + '" alt="' + esc(p.name) + ' kite, back side with frame" width="400" height="440" loading="lazy">' +
          "</span>" +
        "</button>" +
        '<div class="side-toggle" role="group" aria-label="Kite side">' +
          '<button type="button" data-side-btn="front" aria-pressed="true">Front</button>' +
          '<button type="button" data-side-btn="back" aria-pressed="false">Back</button>' +
        "</div>" +
        '<span class="flip-hint"><svg class="ico" aria-hidden="true"><use href="#i-flip"/></svg> Tap to flip</span>' +
      "</div>" +
      '<div class="card-body">' +
        '<p class="card-cat">' + esc(cat.short) + " · Govt Approved</p>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="card-desc">' + esc(p.desc) + "</p>" +
        '<p class="price">' + (price
          ? (p.oldPrice ? "<s>" + C.currency + " " + p.oldPrice.toLocaleString("en-PK") + "</s> " : "") + "<b>" + price + "</b>"
          : '<b>Best rate on WhatsApp</b> <span class="muted">· per ' + p.unit + "</span>") + "</p>" +
        '<div class="qty-row">' +
          '<div class="qty" role="group" aria-label="Quantity">' +
            '<button type="button" data-qty="-1" aria-label="Decrease quantity">−</button>' +
            '<input type="number" inputmode="numeric" min="1" max="999" value="1" aria-label="Quantity in ' + p.unit + '">' +
            '<button type="button" data-qty="1" aria-label="Increase quantity">+</button>' +
          "</div>" +
          '<span class="qty-unit">' + p.unit + "</span>" +
        "</div>" +
        '<a class="btn btn-wa btn-block" data-order href="#" target="_blank" rel="noopener"><svg class="ico" aria-hidden="true"><use href="#i-wa"/></svg> ' +
          (C.bookingOpen ? "Order on WhatsApp" : "Join waiting list") + "</a>" +
        '<button class="btn btn-ghost btn-block" type="button" data-add>+ Add to order list</button>' +
      "</div>" +
    "</article>";
  }

  function renderProducts() {
    var tabs = $("#tabs");
    var all = [{ id: "all", label: "All Kites", count: C.products.length }].concat(C.categories.map(function (c) {
      return { id: c.id, label: c.label, count: C.products.filter(function (p) { return p.category === c.id; }).length };
    }));
    tabs.innerHTML = all.map(function (t, i) {
      return '<button role="tab" type="button" data-filter="' + t.id + '" aria-selected="' + (i === 0) + '">' +
        esc(t.label) + ' <span class="tab-count">' + t.count + "</span></button>";
    }).join("");
    $("#product-grid").innerHTML = C.products.map(cardHTML).join("");

    $$(".card").forEach(function (card) {
      var p = productById[card.id.slice(2)];
      var media = $(".card-media", card);
      var input = $("input", card);
      var orderBtn = $("[data-order]", card);
      var qty = function () { return Math.max(1, Math.min(999, parseInt(input.value, 10) || 1)); };
      var updateHref = function () { orderBtn.href = waUrl(orderMessage([{ id: p.id, qty: qty() }])); };
      var setSide = function (side) {
        media.setAttribute("data-side", side);
        $$("[data-side-btn]", media).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-side-btn") === side)); });
      };

      $(".flip-hit", card).addEventListener("click", function () {
        setSide(media.getAttribute("data-side") === "front" ? "back" : "front");
      });
      $$("[data-side-btn]", card).forEach(function (b) {
        b.addEventListener("click", function () { setSide(b.getAttribute("data-side-btn")); });
      });
      $$("[data-qty]", card).forEach(function (b) {
        b.addEventListener("click", function () { input.value = qty() + Number(b.getAttribute("data-qty")); input.value = qty(); updateHref(); });
      });
      input.addEventListener("input", updateHref);
      input.addEventListener("blur", function () { input.value = qty(); updateHref(); });
      orderBtn.addEventListener("click", function () { updateHref(); track("order_" + p.id, qty()); });
      $("[data-add]", card).addEventListener("click", function () { addToOrder(p.id, qty()); });
      updateHref();
    });

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (b) setFilter(b.getAttribute("data-filter"));
    });
    $$("[data-filter-link]").forEach(function (a) {
      a.addEventListener("click", function () { setFilter(a.getAttribute("data-filter-link")); });
    });
  }

  function setFilter(id) {
    $$("#tabs [data-filter]").forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-filter") === id)); });
    $$(".card").forEach(function (c) { c.hidden = id !== "all" && c.getAttribute("data-cat") !== id; });
  }

  /* ---------- 5. Order list (multi-item) ---------- */
  var STORE = "usk-order-" + C.basantYear;
  var order = [];
  try { order = JSON.parse(localStorage.getItem(STORE)) || []; } catch (e) {}
  order = order.filter(function (it) { return productById[it.id]; });

  function save() { try { localStorage.setItem(STORE, JSON.stringify(order)); } catch (e) {} }

  function addToOrder(id, qty) {
    var it = order.filter(function (x) { return x.id === id; })[0];
    if (it) it.qty = Math.min(999, it.qty + qty); else order.push({ id: id, qty: qty });
    save(); renderOrder();
    toast("Added: " + productById[id].name + " × " + qty);
  }

  function formExtra() {
    var f = $("#order-form");
    return { fulfil: f.fulfil.value, name: f.name.value.trim(), area: f.area.value.trim() };
  }

  function renderOrder() {
    var bar = $("#order-bar");
    var count = order.reduce(function (s, it) { return s + it.qty; }, 0);
    bar.hidden = order.length === 0;
    document.body.classList.toggle("has-order", order.length > 0);
    $("#order-count").textContent = count;
    $("#order-send-bar").href = waUrl(orderMessage(order, formExtra()));
    $("#drawer-items").innerHTML = order.length ? order.map(function (it) {
      var p = productById[it.id];
      return '<li data-id="' + it.id + '"><img src="' + p.images.front + '" alt="" width="48" height="53">' +
        '<div><b>' + esc(p.name) + '</b><span class="muted">' + it.qty + " " + p.unit + "</span></div>" +
        '<div class="qty qty-sm"><button type="button" data-dq="-1" aria-label="Decrease">−</button><span>' + it.qty +
        '</span><button type="button" data-dq="1" aria-label="Increase">+</button></div>' +
        '<button class="icon-btn" type="button" data-rm aria-label="Remove ' + esc(p.name) + '">✕</button></li>';
    }).join("") : '<li class="empty">Your order list is empty.</li>';
    if (!order.length) closeDrawer();
  }

  function openDrawer() {
    $("#order-drawer").classList.add("open");
    $("#order-drawer").inert = false;
    $("#drawer-backdrop").hidden = false;
    $("#order-open").setAttribute("aria-expanded", "true");
    $("#order-drawer").focus();
  }
  function closeDrawer() {
    $("#order-drawer").classList.remove("open");
    $("#order-drawer").inert = true;
    $("#drawer-backdrop").hidden = true;
    $("#order-open").setAttribute("aria-expanded", "false");
  }

  function wireOrder() {
    $("#order-open").addEventListener("click", openDrawer);
    $("#order-close").addEventListener("click", closeDrawer);
    $("#drawer-backdrop").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

    $("#drawer-items").addEventListener("click", function (e) {
      var li = e.target.closest("li[data-id]");
      if (!li) return;
      var it = order.filter(function (x) { return x.id === li.getAttribute("data-id"); })[0];
      var dq = e.target.closest("[data-dq]");
      if (dq) it.qty = Math.max(1, Math.min(999, it.qty + Number(dq.getAttribute("data-dq"))));
      if (e.target.closest("[data-rm]")) order.splice(order.indexOf(it), 1);
      save(); renderOrder();
    });

    var form = $("#order-form");
    form.addEventListener("input", function () { $("#order-send-bar").href = waUrl(orderMessage(order, formExtra())); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      track("order_list", order.length);
      window.open(waUrl(orderMessage(order, formExtra())), "_blank", "noopener");
    });
    $("#order-send-bar").addEventListener("click", function () { track("order_list_bar", order.length); });
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  /* ---------- 6. TikTok ---------- */
  var tt = C.tiktok || {};
  var ttUser = (tt.username || "").replace(/^@/, "");
  var ttProfile = ttUser ? "https://www.tiktok.com/@" + ttUser : "";

  var igUser = (C.instagram || "").replace(/^@/, "");
  var igProfile = igUser ? "https://www.instagram.com/" + igUser + "/" : "";

  function renderSocial() {
    if (igUser) {
      $$("[data-ig-only]").forEach(function (el) { el.hidden = false; });
      $$("[data-ig-link]").forEach(function (a) {
        a.href = igProfile;
        a.addEventListener("click", function () { track("instagram_follow"); });
      });
      $$("[data-ig-handle]").forEach(function (el) { el.textContent = "@" + igUser; });
    }
    if (!ttUser) return;
    $("#tiktok").hidden = false;
    $$("[data-tt-only]").forEach(function (el) { el.hidden = false; });
    $$("[data-tt-link]").forEach(function (a) { a.href = ttProfile; });
    $$("[data-tt-handle]").forEach(function (el) { el.textContent = "@" + ttUser; });
    $("#tt-follow").href = ttProfile;
    $("#tt-follow-label").textContent = "Follow @" + ttUser;
    $("#tt-follow").addEventListener("click", function () { track("tiktok_follow"); });

    // Videos: TikTok's player shows the video cover with a play button inside the frame.
    var ids = (tt.videos || []).map(function (u) { var m = String(u).match(/\/video\/(\d+)/); return m && m[1]; }).filter(Boolean);
    $("#tt-videos").innerHTML = ids.map(function (id, i) {
      return '<div class="phone-frame"><iframe src="https://www.tiktok.com/player/v1/' + id +
        '?music_info=1&description=1&rel=0" title="' + esc(C.brandName) + " TikTok video " + (i + 1) +
        '" loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
    }).join("");
    $("#tt-videos").hidden = !ids.length;

    // Profile: TikTok's creator embed (avatar, follower count and latest video covers).
    $("#tt-profile").innerHTML = '<blockquote class="tiktok-embed" cite="' + ttProfile + '" data-unique-id="' + esc(ttUser) +
      '" data-embed-type="creator"><section><a target="_blank" rel="noopener" href="' + ttProfile + '">@' + esc(ttUser) + "</a></section></blockquote>";
    var loadEmbed = function () {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.tiktok.com/embed.js";
      document.body.appendChild(s);
    };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); loadEmbed(); }
      }, { rootMargin: "400px" });
      io.observe($("#tiktok"));
    } else loadEmbed();
  }

  /* ---------- 7. Structured data (SEO) ---------- */
  function injectSchema() {
    var url = tokens.siteUrl + "/";
    var graph = [
      {
        "@type": "Store",
        "@id": url + "#store",
        name: C.brandName,
        url: url,
        image: url + "assets/images/kites/t15-chand-front.svg",
        telephone: "+" + C.whatsappNumber,
        address: { "@type": "PostalAddress", streetAddress: C.pickupAddress, addressLocality: C.city, addressCountry: "PK" },
        areaServed: C.city,
        logo: url + C.logo,
        sameAs: [ttProfile, igProfile].filter(Boolean),
        description: "Licensed kite manufacturer selling govt approved kites and cotton Dor Pinna for Basant " + C.basantYear + ".",
        hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "Kite Manufacturing Licence", identifier: C.licence.number, recognizedBy: { "@type": "GovernmentOrganization", name: C.licence.issuedBy } },
      },
      {
        "@type": "ItemList",
        name: "Basant " + C.basantYear + " Govt Approved Kites",
        itemListElement: C.products.map(function (p, i) {
          var item = { "@type": "ListItem", position: i + 1, url: url + "#p-" + p.id, name: p.name };
          if (p.price != null) {
            item.item = {
              "@type": "Product", name: p.name, description: p.desc, image: url + p.images.front,
              brand: { "@type": "Brand", name: C.brandName },
              offers: { "@type": "Offer", priceCurrency: "PKR", price: p.price, availability: "https://schema.org/PreOrder", url: url + "#p-" + p.id },
            };
            delete item.name; delete item.url;
          }
          return item;
        }),
      },
      {
        "@type": "FAQPage",
        mainEntity: $$("#faq-list details").map(function (d) {
          return { "@type": "Question", name: $("summary", d).textContent.trim(),
            acceptedAnswer: { "@type": "Answer", text: $("p", d).textContent.trim() } };
        }),
      },
    ];
    if (C.datesConfirmed) {
      graph.push({
        "@type": "Event",
        name: "Basant " + C.basantYear + " " + C.city,
        startDate: C.basantDates[0],
        endDate: C.basantDates[C.basantDates.length - 1],
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Place", name: C.city, address: { "@type": "PostalAddress", addressLocality: C.city, addressCountry: "PK" } },
        organizer: { "@type": "Organization", name: "Government of Punjab" },
      });
    }
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(s);
  }

  /* ---------- Boot ---------- */
  fillTokens(document.documentElement);
  $$("[data-bind]").forEach(function (el) { el.textContent = binds[el.getAttribute("data-bind")]; });
  $$("[data-bind-href]").forEach(function (el) { el.href = C[el.getAttribute("data-bind-href")]; });
  $$("[data-bind-src]").forEach(function (el) { if (el.getAttribute("data-bind-src") === "licenceImage") el.src = C.licence.image; });
  renderDates();
  startCountdown();
  wireGeneralLinks();
  renderProducts();
  renderSocial();
  $$("img[src='assets/images/logo.svg']").forEach(function (img) { img.src = C.logo; });
  wireOrder();
  renderOrder();
  injectSchema();
  document.documentElement.classList.remove("js-pending");
})();
