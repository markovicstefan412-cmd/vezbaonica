/* Vežbaonica: predmeti, pregled tačnih odgovora i testovi. */
(function () {
  "use strict";

  const PREDMETI = window.PREDMETI || [];
  const DELOVI = [
    { id: "kol1", naziv: "Prvi kolokvijum", genitiv: "prvog kolokvijuma" },
    { id: "kol2", naziv: "Drugi kolokvijum", genitiv: "drugog kolokvijuma" },
    { id: "zavrsni", naziv: "Završni ispit", genitiv: "završnog ispita" },
  ];
  const NAZIV = "Vežbaonica";
  const SLOVA = "abcdefghij";
  const KLJUC = "vezbaonica.v1";
  // Odgovori tipa „Ništa od navedenog“ ostaju poslednji i posle mešanja.
  const UVEK_POSLEDNJI = /od navedenog|od navedenih|od ponuđenih/i;

  const IKONA_NAZAD = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const IKONA_DALJE = '<svg class="strelica" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const app = document.getElementById("app");
  let test = null;

  // Pitanja stižu po temama: jedna tema je obično jedna prezentacija.
  (window.TEME || []).forEach((tema) => {
    const predmet = PREDMETI.find((p) => p.id === tema.predmet);
    if (!predmet) {
      console.warn("Nepoznat predmet:", tema.predmet, tema.naziv);
      return;
    }
    predmet.delovi = predmet.delovi || {};
    predmet.delovi[tema.deo] = (predmet.delovi[tema.deo] || [])
      .concat(tema.pitanja.map((p) => Object.assign({ tema: tema.naziv }, p)));
  });

  /* ---------- pomoćne funkcije ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  // `kod` u tekstu se prikazuje kao kod, a novi red kao prelom
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  }

  function promesaj(niz) {
    const a = niz.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function mnozina(n, jedan, dva, pet) {
    const d = n % 10;
    const s = n % 100;
    if (d === 1 && s !== 11) return jedan;
    if (d >= 2 && d <= 4 && (s < 12 || s > 14)) return dva;
    return pet;
  }

  function brojPitanja(n) {
    return n + " " + mnozina(n, "pitanje", "pitanja", "pitanja");
  }

  function procenat(tacno, ukupno) {
    return ukupno ? Math.round((tacno / ukupno) * 100) : 0;
  }

  // pretraga radi i bez kvačica: "cvor" pronalazi "čvor"
  function normalizuj(s) {
    return String(s).toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function href() {
    return "#/" + Array.from(arguments).map(encodeURIComponent).join("/");
  }

  function postaviNaslov(naslov) {
    document.title = naslov ? naslov + " – " + NAZIV : NAZIV;
  }

  function nazad(link, tekst) {
    return `<a class="nazad" href="${link}">${IKONA_NAZAD}${esc(tekst)}</a>`;
  }

  function nadjiPredmet(id) {
    return PREDMETI.find((p) => p.id === id);
  }

  function nazivDela(id) {
    return (DELOVI.find((d) => d.id === id) || {}).naziv || id;
  }

  // id zavisi od teksta pitanja, pa zabeležene greške ostaju tačne i kad se dodaju nova pitanja
  function otisak(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function pitanjaDela(predmet, deoId) {
    const d = predmet.delovi || {};
    const grupa = (id) => (d[id] || []).map((p) => Object.assign({}, p, { id: predmet.id + "/" + id + "/" + otisak(p.pitanje + (p.slika || "")), grupa: id }));
    if (deoId === "zavrsni" && !predmet.zavrsniPosebno) {
      return grupa("kol1").concat(grupa("kol2"), grupa("zavrsni"));
    }
    return grupa(deoId);
  }

  function ukupnoPitanja(predmet) {
    const d = predmet.delovi || {};
    return DELOVI.reduce((zbir, deo) => zbir + (d[deo.id] || []).length, 0);
  }

  function temeDela(pitanja) {
    return pitanja.reduce((teme, p) => {
      if (p.tema && !teme.includes(p.tema)) teme.push(p.tema);
      return teme;
    }, []);
  }

  function slika(put, opis) {
    if (!put) return "";
    return `
      <figure class="slika">
        <button type="button" class="slika-dugme" data-akcija="uvecaj" aria-label="Uvećaj sliku">
          <img src="${esc(put)}" alt="${esc(opis)}" loading="lazy">
        </button>
      </figure>`;
  }

  // slika uz pitanje ne sme da otkrije odgovor, a slikaResenja se vidi tek uz rešenje
  function slikaPitanja(p) {
    return slika(p.slika, "Slika uz pitanje");
  }

  function slikaResenja(p) {
    return slika(p.slikaResenja, "Slika uz odgovor");
  }

  function proveriPodatke() {
    PREDMETI.forEach((predmet) => {
      DELOVI.forEach((deo) => {
        ((predmet.delovi || {})[deo.id] || []).forEach((p, i) => {
          if (!p.pitanje || !Array.isArray(p.tacni) || !p.tacni.length) {
            console.warn("Neispravno pitanje:", predmet.id, deo.id, i + 1, p);
          }
        });
      });
    });
  }

  /* ---------- napredak (čuva se u pregledaču) ---------- */

  function napredak() {
    let n = {};
    try {
      n = JSON.parse(localStorage.getItem(KLJUC)) || {};
    } catch (e) {
      n = {};
    }
    n.rezultati = n.rezultati || {};
    n.pogresna = n.pogresna || {};
    return n;
  }

  function sacuvajNapredak(n) {
    try {
      localStorage.setItem(KLJUC, JSON.stringify(n));
    } catch (e) {
      // privatni režim ili blokiran prostor; aplikacija radi i bez čuvanja
    }
  }

  /* ---------- strane ---------- */

  function pocetna() {
    postaviNaslov();
    if (!PREDMETI.length) {
      app.innerHTML = `
        <header class="naslov-strane">
          <h1>Još nema predmeta</h1>
          <p>Predmeti se dodaju u folder <code>podaci</code>.</p>
        </header>`;
      return;
    }
    app.innerHTML = `
      <header class="naslov-strane">
        <h1>Predmeti</h1>
        <p>Izaberi predmet, pa kolokvijum ili ispit za koji se spremaš.</p>
      </header>
      ${PREDMETI.length > 6 ? `
        <div class="alati">
          <input class="pretraga" type="search" placeholder="Pronađi predmet" aria-label="Pronađi predmet" data-filter=".spisak > li">
        </div>` : ""}
      <ul class="list stavke spisak">
        ${PREDMETI.map((p) => `
          <li data-tekst="${esc(normalizuj(p.naziv + " " + (p.opis || "")))}">
            <a href="${href("p", p.id)}">
              <span class="stavka-tekst">
                <span class="stavka-naziv">${esc(p.naziv)}</span>
                ${p.opis ? `<span class="stavka-opis">${esc(p.opis)}</span>` : ""}
              </span>
              <span class="stavka-broj">${brojPitanja(ukupnoPitanja(p))}</span>
              ${IKONA_DALJE}
            </a>
          </li>`).join("")}
      </ul>
      <p class="nema-rezultata" hidden>Nijedan predmet ne odgovara pretrazi.</p>`;
  }

  function opisDela(predmet, deoId, broj) {
    const d = predmet.delovi || {};
    if (deoId !== "zavrsni" || predmet.zavrsniPosebno) return brojPitanja(broj);
    const kol = ["kol1", "kol2"].filter((id) => (d[id] || []).length);
    if (!kol.length) return brojPitanja(broj);
    const dodatna = (d.zavrsni || []).length;
    let tekst = kol.length === 2 ? "Pitanja iz oba kolokvijuma" : "Pitanja iz " + (kol[0] === "kol1" ? "prvog" : "drugog") + " kolokvijuma";
    if (dodatna) tekst += " i " + dodatna + " " + mnozina(dodatna, "dodatno", "dodatna", "dodatnih");
    return tekst + ", ukupno " + brojPitanja(broj);
  }

  function stranaPredmeta(predmet) {
    postaviNaslov(predmet.naziv);
    const n = napredak();
    const redovi = DELOVI.map((deo) => {
      const pitanja = pitanjaDela(predmet, deo.id);
      if (!pitanja.length) return "";
      const rez = n.rezultati[predmet.id + "/" + deo.id];
      return `
        <div class="deo">
          <div>
            <h2>${deo.naziv}</h2>
            <p class="deo-meta">${opisDela(predmet, deo.id, pitanja.length)}</p>
            ${rez ? `<p class="deo-meta">Poslednji test: <strong>${rez.poslednji.tacno} od ${rez.poslednji.ukupno}</strong>, najbolji rezultat ${rez.najbolji}%</p>` : ""}
          </div>
          <div class="deo-dugmad">
            <a class="dugme sporedno-dugme" href="${href("p", predmet.id, deo.id, "odgovori")}">Tačni odgovori</a>
            <a class="dugme" href="${href("p", predmet.id, deo.id, "test")}">Pokreni test</a>
          </div>
        </div>`;
    }).join("");

    const prefiks = predmet.id + "/";
    const imaRezultata = Object.keys(n.rezultati).concat(Object.keys(n.pogresna)).some((k) => k.startsWith(prefiks));

    app.innerHTML = `
      ${nazad("#/", "Svi predmeti")}
      <header class="naslov-strane">
        <h1>${esc(predmet.naziv)}</h1>
        ${predmet.opis ? `<p>${esc(predmet.opis)}</p>` : ""}
      </header>
      ${redovi ? `<section class="list">${redovi}</section>` : `<p class="sporedno">Za ovaj predmet još nema pitanja.</p>`}
      ${imaRezultata ? `
        <p class="ispod">
          <button type="button" class="tekst-dugme" data-akcija="obrisi-rezultate" data-predmet="${esc(predmet.id)}">Obriši moje rezultate iz ovog predmeta</button>
        </p>` : ""}`;
  }

  function stranaOdgovora(predmet, deo) {
    const pitanja = pitanjaDela(predmet, deo.id);
    if (!pitanja.length) return nijePronadjeno();
    postaviNaslov(deo.naziv + " – " + predmet.naziv);

    const grupe = [];
    pitanja.forEach((p) => {
      const naslov = p.tema || (p.grupa === "zavrsni" ? "Dodatna pitanja za završni" : nazivDela(p.grupa));
      const poslednja = grupe[grupe.length - 1];
      if (poslednja && poslednja.naslov === naslov) poslednja.pitanja.push(p);
      else grupe.push({ naslov, pitanja: [p] });
    });
    const teme = temeDela(pitanja);

    let redni = 0;
    app.innerHTML = `
      ${nazad(href("p", predmet.id), predmet.naziv)}
      <header class="naslov-strane">
        <h1>${deo.naziv}</h1>
        <p>Sva pitanja sa tačnim odgovorima, ukupno ${brojPitanja(pitanja.length)}.</p>
      </header>
      <div class="alati">
        <input class="pretraga" type="search" placeholder="Pretraži pitanja i odgovore" aria-label="Pretraži pitanja i odgovore" data-filter=".pitanje-red">
        ${teme.length > 1 ? `
          <select class="izbor-teme" aria-label="Tema" data-akcija="izbor-teme">
            <option value="">Sve teme</option>
            ${teme.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}
          </select>` : ""}
        <label class="kvacica"><input type="checkbox" data-akcija="sakrij-odgovore"><span>Sakrij odgovore</span></label>
      </div>
      <div class="pregled">
        ${grupe.map((g) => `
          <section class="grupa">
            ${grupe.length > 1 ? `<h2 class="grupa-naslov">${esc(g.naslov)}</h2>` : ""}
            <ul class="list stavke">${g.pitanja.map((p) => redOdgovora(p, ++redni)).join("")}</ul>
          </section>`).join("")}
        <p class="nema-rezultata" hidden>Nijedno pitanje ne odgovara pretrazi.</p>
      </div>
      <div class="kraj-strane">
        <a class="dugme" href="${href("p", predmet.id, deo.id, "test")}">Pokreni test iz ${deo.genitiv}</a>
      </div>`;
  }

  function redOdgovora(p, redni) {
    const tekst = normalizuj([p.pitanje].concat(p.tacni).join(" "));
    return `
      <li class="pitanje-red" data-tekst="${esc(tekst)}" data-tema="${esc(p.tema || "")}">
        <span class="redni">${redni}.</span>
        <div>
          <p class="pitanje">${fmt(p.pitanje)}</p>
          ${slikaPitanja(p)}
          <div class="odgovor">
            <ul class="tacni">${p.tacni.map((t) => `<li><span class="marker">${fmt(t)}</span></li>`).join("")}</ul>
            ${p.objasnjenje ? `<p class="objasnjenje">${fmt(p.objasnjenje)}</p>` : ""}
            ${slikaResenja(p)}
          </div>
          <button type="button" class="dugme sporedno-dugme malo otkrij" data-akcija="otkrij">Prikaži odgovor</button>
        </div>
      </li>`;
  }

  function izbor(vrednost, tekst, izabran) {
    return `<label class="izbor"><input type="radio" name="broj" value="${vrednost}"${izabran ? " checked" : ""}><span>${tekst}</span></label>`;
  }

  function izboriBroja(ukupno) {
    const ponude = [10, 20, 30, 50, 100].filter((x) => x < ukupno);
    const izabrano = ukupno > 20 ? 20 : ukupno;
    return ponude.map((x) => izbor(x, x, x === izabrano)).join("")
      + izbor(ukupno, (ponude.length ? "Sva" : "Sva pitanja") + " (" + ukupno + ")", izabrano === ukupno);
  }

  function kvacicaGresaka(pitanja) {
    const n = napredak();
    const pogresnih = pitanja.filter((p) => n.pogresna[p.id]).length;
    if (!pogresnih) return "";
    return `<label class="kvacica"><input type="checkbox" name="pogresna"><span>Samo pitanja na kojima je bilo grešaka (${pogresnih})</span></label>`;
  }

  function pitanjaForme(forma) {
    const pitanja = pitanjaDela(nadjiPredmet(forma.dataset.predmet), forma.dataset.deo);
    const tema = forma.elements.tema ? forma.elements.tema.value : "";
    return tema ? pitanja.filter((p) => p.tema === tema) : pitanja;
  }

  function podesavanjeTesta(predmet, deo) {
    const pitanja = pitanjaDela(predmet, deo.id);
    if (!pitanja.length) return nijePronadjeno();
    postaviNaslov("Test iz " + deo.genitiv + " – " + predmet.naziv);
    const teme = temeDela(pitanja);

    app.innerHTML = `
      ${nazad(href("p", predmet.id), predmet.naziv)}
      <header class="naslov-strane">
        <h1>Test iz ${deo.genitiv}</h1>
        <p>Pitanja i ponuđeni odgovori se mešaju svaki put. Kod svakog pitanja može biti jedan ili više tačnih odgovora.</p>
      </header>
      <form class="list podesavanja" data-predmet="${esc(predmet.id)}" data-deo="${deo.id}">
        ${teme.length > 1 ? `
          <label class="polje">
            <span class="polje-naziv">Tema</span>
            <select class="izbor-teme" name="tema" data-akcija="tema-testa">
              <option value="">Sve teme (${pitanja.length})</option>
              ${teme.map((t) => `<option value="${esc(t)}">${esc(t)} (${pitanja.filter((p) => p.tema === t).length})</option>`).join("")}
            </select>
          </label>` : ""}
        <fieldset>
          <legend>Broj pitanja</legend>
          <div class="izbori">${izboriBroja(pitanja.length)}</div>
        </fieldset>
        <div class="kvacice">
          <label class="kvacica"><input type="checkbox" name="odmah" checked><span>Prikaži rešenje posle svakog pitanja</span></label>
          <div class="gresaka">${kvacicaGresaka(pitanja)}</div>
        </div>
        <button class="dugme veliko" type="submit">Počni test</button>
      </form>`;
  }

  function nijePronadjeno() {
    postaviNaslov("Stranica ne postoji");
    app.innerHTML = `
      <header class="naslov-strane">
        <h1>Ova stranica ne postoji</h1>
        <p>Predmet je možda preimenovan ili uklonjen.</p>
      </header>
      <a class="dugme" href="#/">Idi na spisak predmeta</a>`;
  }

  /* ---------- test ---------- */

  function pripremiOpcije(p) {
    const sve = promesaj(
      p.tacni.map((t) => ({ tekst: t, tacan: true }))
        .concat((p.netacni || []).map((t) => ({ tekst: t, tacan: false })))
    );
    return sve.filter((o) => !UVEK_POSLEDNJI.test(o.tekst))
      .concat(sve.filter((o) => UVEK_POSLEDNJI.test(o.tekst)));
  }

  function pokreniTest(predmet, deo, pitanja, opcije) {
    test = {
      predmet,
      deo,
      odmah: opcije.odmah,
      zabelezi: opcije.zabelezi,
      pitanja: pitanja.map((p) => ({ p, opcije: pripremiOpcije(p), izabrano: [], provereno: false })),
      i: 0,
      gotov: false,
    };
    prikaziPitanje();
  }

  function tacnoOdgovoreno(s) {
    return s.opcije.every((o, i) => o.tacan === s.izabrano.includes(i));
  }

  function prikaziPitanje() {
    const s = test.pitanja[test.i];
    const ukupno = test.pitanja.length;
    const poslednje = test.i === ukupno - 1;
    const tekstDugmeta = test.odmah ? "Proveri" : poslednje ? "Završi test" : "Sledeće pitanje";

    app.innerHTML = `
      <div class="test-vrh">
        <span>Pitanje <strong>${test.i + 1}</strong> od ${ukupno}</span>
        <button type="button" class="tekst-dugme" data-akcija="prekini">Prekini test</button>
      </div>
      <div class="napredak" aria-hidden="true"><span style="width:${(test.i / ukupno) * 100}%"></span></div>
      <p class="test-tekst">${fmt(s.p.pitanje)}</p>
      ${slikaPitanja(s.p)}
      <p class="uputstvo">Označi sve tačne odgovore.</p>
      <ul class="opcije">
        ${s.opcije.map((o, i) => `
          <li>
            <button type="button" class="opcija" data-akcija="opcija" data-i="${i}" aria-pressed="false">
              <span class="kucica" aria-hidden="true"></span>
              <span class="opcija-slovo">${SLOVA[i]})</span>
              <span class="opcija-tekst">${fmt(o.tekst)}</span>
              <span class="opcija-oznaka"></span>
            </button>
          </li>`).join("")}
      </ul>
      <div class="povratna" hidden aria-live="polite"></div>
      <div class="test-akcije">
        <button type="button" class="dugme veliko" data-akcija="dalje" disabled>${tekstDugmeta}</button>
      </div>
      <p class="precice">Tastatura: <kbd>a</kbd> <kbd>b</kbd> <kbd>c</kbd> ili <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> označavaju odgovor, <kbd>Enter</kbd> potvrđuje.</p>`;
    window.scrollTo(0, 0);
  }

  function prebaciOpciju(i) {
    const s = test.pitanja[test.i];
    if (s.provereno) return;
    const k = s.izabrano.indexOf(i);
    if (k >= 0) s.izabrano.splice(k, 1);
    else s.izabrano.push(i);
    const el = app.querySelector('.opcija[data-i="' + i + '"]');
    if (el) el.setAttribute("aria-pressed", String(k < 0));
    app.querySelector('[data-akcija="dalje"]').disabled = s.izabrano.length === 0;
  }

  function proveri(s) {
    s.provereno = true;
    const tacno = tacnoOdgovoreno(s);
    const izabraniTacni = s.izabrano.filter((i) => s.opcije[i].tacan).length;
    const imaPogresnih = s.izabrano.some((i) => !s.opcije[i].tacan);

    app.querySelectorAll(".opcija").forEach((el, i) => {
      const o = s.opcije[i];
      const izabran = s.izabrano.includes(i);
      const vrsta = o.tacan ? (izabran ? "je-tacno" : "je-propusteno") : (izabran ? "je-pogresno" : "je-ostalo");
      el.classList.add("provereno", vrsta);
      el.setAttribute("aria-disabled", "true");
      el.querySelector(".opcija-oznaka").textContent =
        { "je-tacno": "Tačno", "je-propusteno": "Tačan odgovor", "je-pogresno": "Netačno", "je-ostalo": "" }[vrsta];
    });

    let naslov = "Netačno.";
    if (tacno) naslov = "Tačno.";
    else if (izabraniTacni && !imaPogresnih) naslov = "Delimično. Nisu označeni svi tačni odgovori.";

    const povratna = app.querySelector(".povratna");
    povratna.className = "povratna " + (tacno ? "dobro" : "lose");
    povratna.innerHTML = `<p class="povratna-naslov">${naslov}</p>${s.p.objasnjenje ? `<p>${fmt(s.p.objasnjenje)}</p>` : ""}${slikaResenja(s.p)}`;
    povratna.hidden = false;

    const dugme = app.querySelector('[data-akcija="dalje"]');
    dugme.textContent = test.i < test.pitanja.length - 1 ? "Sledeće pitanje" : "Pogledaj rezultat";
    dugme.focus({ preventScroll: true });
    povratna.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function dalje() {
    const s = test.pitanja[test.i];
    if (!s.izabrano.length) return;
    if (test.odmah && !s.provereno) {
      proveri(s);
      return;
    }
    s.provereno = true;
    if (test.i < test.pitanja.length - 1) {
      test.i++;
      prikaziPitanje();
    } else {
      zavrsiTest();
    }
  }

  function zavrsiTest() {
    const ukupno = test.pitanja.length;
    const tacnih = test.pitanja.filter(tacnoOdgovoreno).length;
    const n = napredak();

    test.pitanja.forEach((s) => {
      if (tacnoOdgovoreno(s)) delete n.pogresna[s.p.id];
      else n.pogresna[s.p.id] = 1;
    });

    // ponavljanje grešaka ne ulazi u rezultate predmeta
    if (test.zabelezi) {
      const kljuc = test.predmet.id + "/" + test.deo.id;
      const pre = n.rezultati[kljuc];
      n.rezultati[kljuc] = {
        poslednji: { tacno: tacnih, ukupno, datum: Date.now() },
        najbolji: Math.max(procenat(tacnih, ukupno), pre ? pre.najbolji : 0),
        pokusaja: (pre ? pre.pokusaja : 0) + 1,
      };
    }

    sacuvajNapredak(n);
    test.gotov = true;
    prikaziRezultat();
  }

  function prikaziRezultat() {
    const ukupno = test.pitanja.length;
    const tacnih = test.pitanja.filter(tacnoOdgovoreno).length;
    const pogresnih = ukupno - tacnih;
    postaviNaslov("Rezultat – " + test.predmet.naziv);

    app.innerHTML = `
      ${nazad(href("p", test.predmet.id), test.predmet.naziv)}
      <section class="rezultat">
        <h1>${test.zabelezi ? "Test iz " + test.deo.genitiv : "Ponavljanje grešaka iz " + test.deo.genitiv}</h1>
        <p class="rezultat-broj"><span class="marker">${tacnih}</span><small> od ${ukupno}</small></p>
        <p class="rezultat-opis">${procenat(tacnih, ukupno)}% tačnih odgovora.</p>
        <div class="rezultat-dugmad">
          ${pogresnih ? `<button type="button" class="dugme" data-akcija="ponovi-pogresna">Ponovi pogrešna pitanja (${pogresnih})</button>` : ""}
          <button type="button" class="dugme${pogresnih ? " sporedno-dugme" : ""}" data-akcija="novi-test">Novi test</button>
        </div>
      </section>
      <section>
        <div class="odeljak-vrh">
          <h2>Pregled odgovora</h2>
          ${pogresnih && tacnih ? `<label class="kvacica"><input type="checkbox" data-akcija="samo-pogresni"><span>Prikaži samo pogrešne</span></label>` : ""}
        </div>
        <ul class="list stavke">${test.pitanja.map((s, i) => redRezultata(s, i + 1)).join("")}</ul>
      </section>`;
    window.scrollTo(0, 0);
  }

  function redRezultata(s, redni) {
    const ok = tacnoOdgovoreno(s);
    const ishod = s.opcije.map((o, i) => {
      const izabran = s.izabrano.includes(i);
      if (!o.tacan && !izabran) return "";
      const vrsta = o.tacan ? (izabran ? "je-tacno" : "je-propusteno") : "je-pogresno";
      const oznaka = { "je-tacno": "označeno, tačno", "je-propusteno": "tačno, nije označeno", "je-pogresno": "označeno, netačno" }[vrsta];
      return `<li class="${vrsta}"><span>${fmt(o.tekst)}</span><span class="ishod-oznaka">${oznaka}</span></li>`;
    }).join("");

    return `
      <li class="pitanje-red ${ok ? "red-tacno" : "red-netacno"}">
        <span class="redni">${redni}.</span>
        <div>
          <p class="status ${ok ? "status-tacno" : "status-netacno"}">${ok ? "Tačno" : "Netačno"}</p>
          <p class="pitanje">${fmt(s.p.pitanje)}</p>
          ${slikaPitanja(s.p)}
          <ul class="ishod">${ishod}</ul>
          ${s.p.objasnjenje ? `<p class="objasnjenje">${fmt(s.p.objasnjenje)}</p>` : ""}
          ${slikaResenja(s.p)}
        </div>
      </li>`;
  }

  /* ---------- uvećana slika ---------- */

  function uvecaj(dugme) {
    const img = dugme.querySelector("img");
    const sloj = document.createElement("div");
    sloj.className = "uvecano";
    sloj.setAttribute("role", "dialog");
    sloj.setAttribute("aria-label", "Uvećana slika. Dodirni bilo gde da zatvoriš.");
    sloj.innerHTML = `<img src="${esc(img.getAttribute("src"))}" alt="${esc(img.alt)}">`;
    sloj.addEventListener("click", zatvoriUvecano);
    document.body.appendChild(sloj);
  }

  function zatvoriUvecano() {
    const sloj = document.querySelector(".uvecano");
    if (sloj) sloj.remove();
    return !!sloj;
  }

  /* ---------- pretraga ---------- */

  function filtriraj() {
    const polje = app.querySelector("[data-filter]");
    const izborTeme = app.querySelector('[data-akcija="izbor-teme"]');
    const upit = normalizuj(polje.value.trim());
    const tema = izborTeme ? izborTeme.value : "";
    let vidljivih = 0;
    app.querySelectorAll(polje.dataset.filter).forEach((el) => {
      const vidi = (!upit || el.dataset.tekst.includes(upit)) && (!tema || el.dataset.tema === tema);
      el.hidden = !vidi;
      if (vidi) vidljivih++;
    });
    app.querySelectorAll(".grupa").forEach((g) => {
      g.hidden = !g.querySelector("li[data-tekst]:not([hidden])");
    });
    const poruka = app.querySelector(".nema-rezultata");
    if (poruka) poruka.hidden = vidljivih > 0;
  }

  /* ---------- tema ---------- */

  const KLJUC_TEME = "vezbaonica.tema";
  const sistemTamna = matchMedia("(prefers-color-scheme: dark)");

  function primeniTemu(tema) {
    document.documentElement.dataset.tema = tema;
    document.querySelectorAll(".tema button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tema === tema)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = tema === "tamna" ? "#1c1f24" : "#ffffff";
  }

  function sacuvanaTema() {
    try {
      return localStorage.getItem(KLJUC_TEME);
    } catch (e) {
      return null;
    }
  }

  document.querySelector(".tema").addEventListener("click", (ev) => {
    const dugme = ev.target.closest("button[data-tema]");
    if (!dugme) return;
    try {
      localStorage.setItem(KLJUC_TEME, dugme.dataset.tema);
    } catch (e) {
      // izbor važi bar dok je strana otvorena
    }
    primeniTemu(dugme.dataset.tema);
  });

  // dok korisnik sam ne izabere temu, ona prati podešavanje uređaja
  sistemTamna.addEventListener("change", (ev) => {
    if (!sacuvanaTema()) primeniTemu(ev.matches ? "tamna" : "svetla");
  });

  /* ---------- navigacija ---------- */

  function ruta() {
    const d = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
    test = null;
    zatvoriUvecano();
    window.scrollTo(0, 0);

    if (!d.length) return pocetna();
    if (d[0] === "p") {
      const predmet = nadjiPredmet(d[1]);
      if (!predmet) return nijePronadjeno();
      if (d.length === 2) return stranaPredmeta(predmet);
      const deo = DELOVI.find((x) => x.id === d[2]);
      if (deo && d[3] === "odgovori") return stranaOdgovora(predmet, deo);
      if (deo && d[3] === "test") return podesavanjeTesta(predmet, deo);
    }
    nijePronadjeno();
  }

  /* ---------- događaji ---------- */

  app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-akcija]");
    if (!el) return;

    switch (el.dataset.akcija) {
      case "opcija":
        prebaciOpciju(Number(el.dataset.i));
        break;
      case "dalje":
        dalje();
        break;
      case "prekini": {
        const zapoceto = test.i > 0 || test.pitanja[0].izabrano.length > 0;
        if (zapoceto && !confirm("Prekinuti test? Odgovori iz ovog testa neće biti sačuvani.")) return;
        location.hash = href("p", test.predmet.id);
        break;
      }
      case "ponovi-pogresna": {
        const pogresna = test.pitanja.filter((s) => !tacnoOdgovoreno(s)).map((s) => s.p);
        pokreniTest(test.predmet, test.deo, promesaj(pogresna), { odmah: test.odmah, zabelezi: false });
        break;
      }
      case "novi-test":
        ruta();
        break;
      case "otkrij":
        el.closest(".pitanje-red").classList.add("otkriveno");
        break;
      case "uvecaj":
        uvecaj(el);
        break;
      case "obrisi-rezultate": {
        if (!confirm("Obrisati sve zabeležene rezultate i greške iz ovog predmeta?")) return;
        const n = napredak();
        const prefiks = el.dataset.predmet + "/";
        Object.keys(n.rezultati).forEach((k) => { if (k.startsWith(prefiks)) delete n.rezultati[k]; });
        Object.keys(n.pogresna).forEach((k) => { if (k.startsWith(prefiks)) delete n.pogresna[k]; });
        sacuvajNapredak(n);
        ruta();
        break;
      }
    }
  });

  app.addEventListener("change", (e) => {
    const akcija = e.target.dataset.akcija;
    if (akcija === "sakrij-odgovore") {
      app.querySelector(".pregled").classList.toggle("skriveno", e.target.checked);
      app.querySelectorAll(".otkriveno").forEach((el) => el.classList.remove("otkriveno"));
    } else if (akcija === "samo-pogresni") {
      app.querySelectorAll(".red-tacno").forEach((el) => { el.hidden = e.target.checked; });
    } else if (akcija === "izbor-teme") {
      filtriraj();
    } else if (akcija === "tema-testa") {
      const forma = e.target.form;
      const pitanja = pitanjaForme(forma);
      forma.querySelector(".izbori").innerHTML = izboriBroja(pitanja.length);
      forma.querySelector(".gresaka").innerHTML = kvacicaGresaka(pitanja);
    }
  });

  app.addEventListener("input", (e) => {
    if (e.target.dataset.filter) filtriraj();
  });

  app.addEventListener("submit", (e) => {
    const forma = e.target.closest(".podesavanja");
    if (!forma) return;
    e.preventDefault();

    const predmet = nadjiPredmet(forma.dataset.predmet);
    const deo = DELOVI.find((d) => d.id === forma.dataset.deo);
    const polja = forma.elements;
    const samoPogresna = !!(polja.pogresna && polja.pogresna.checked);

    let pitanja = pitanjaForme(forma);
    if (samoPogresna) {
      const n = napredak();
      pitanja = pitanja.filter((p) => n.pogresna[p.id]);
    }
    const broj = Number(polja.broj.value) || pitanja.length;
    pokreniTest(predmet, deo, promesaj(pitanja).slice(0, broj), { odmah: polja.odmah.checked, zabelezi: !samoPogresna });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && zatvoriUvecano()) return;
    if (!test || test.gotov || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".uvecano") || e.target.matches("input, textarea, select")) return;

    const akcijaFokusa = e.target.dataset && e.target.dataset.akcija;
    if (e.key === "Enter") {
      // Enter na drugim dugmićima (npr. „Prekini test“) radi ono što piše na njima
      if (e.target.closest("button, a") && akcijaFokusa !== "opcija" && akcijaFokusa !== "dalje") return;
      e.preventDefault();
      dalje();
      return;
    }

    let i = -1;
    if (/^[1-9]$/.test(e.key)) i = Number(e.key) - 1;
    else if (e.key.length === 1) i = SLOVA.indexOf(e.key.toLowerCase());
    if (i >= 0 && i < test.pitanja[test.i].opcije.length) {
      e.preventDefault();
      prebaciOpciju(i);
    }
  });

  window.addEventListener("hashchange", ruta);

  primeniTemu(document.documentElement.dataset.tema || (sistemTamna.matches ? "tamna" : "svetla"));
  proveriPodatke();
  ruta();
})();
