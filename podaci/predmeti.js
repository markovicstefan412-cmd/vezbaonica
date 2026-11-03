/*
  Spisak predmeta. Pitanja su u posebnim fajlovima, po jedan za svaku temu.

  zavrsniPosebno: true znači da završni ispit ima samo svoja pitanja.
  Bez toga završni sadrži i pitanja iz oba kolokvijuma.

  Format fajla sa temom:
    (window.TEME = window.TEME || []).push({
      predmet: "id-predmeta",
      deo: "kol1" | "kol2" | "zavrsni",
      naziv: "Naziv teme",
      pitanja: [ ... ],
    });

  Svako pitanje ima:
    pitanje       tekst pitanja; `ovako` se prikazuje kao kod
    tacni         jedan ili više tačnih odgovora
    netacni       pogrešni ponuđeni odgovori
    objasnjenje   opciono, kratko objašnjenje koje se vidi uz rešenje
    slika         opciono, slika uz pitanje; ne sme da otkriva odgovor
    slikaResenja  opciono, slika koja se vidi tek uz rešenje
*/
window.PREDMETI = [
  {
    id: "anatomija",
    naziv: "Anatomija",
    // Još nije određeno šta obuhvata završni, pa se ne prikazuje dok ne dobije svoja pitanja.
    zavrsniPosebno: true,
  },
];
