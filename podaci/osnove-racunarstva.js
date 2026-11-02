/*
  Predmet: Osnove računarstva (primer, biće zamenjen pravim predmetima)

  Svako pitanje ima:
    pitanje      tekst pitanja; `ovako` se prikazuje kao kod
    slika        opciono, putanja do slike
    tacni        jedan ili više tačnih odgovora
    netacni      pogrešni ponuđeni odgovori
    objasnjenje  opciono, kratko objašnjenje koje se vidi posle odgovora

  Završni ispit automatski sadrži pitanja iz oba kolokvijuma, a u "zavrsni"
  idu samo dodatna pitanja. Ako završni ima potpuno posebno gradivo,
  predmetu se dodaje zavrsniPosebno: true.
*/
(window.PREDMETI = window.PREDMETI || []).push({
  id: "osnove-racunarstva",
  naziv: "Osnove računarstva",
  opis: "Primer predmeta dok ne stignu prave prezentacije.",
  delovi: {
    kol1: [
      {
        pitanje: "Koliko bita ima jedan bajt?",
        tacni: ["8"],
        netacni: ["4", "10", "16"],
        objasnjenje: "Bajt je grupa od 8 bita. Jednim bajtom može da se zapiše 256 različitih vrednosti, od 0 do 255.",
      },
      {
        pitanje: "Koji od navedenih zapisa mogu biti brojevi u binarnom sistemu?",
        tacni: ["1011", "100110"],
        netacni: ["1021", "2A", "19"],
        objasnjenje: "Binarni sistem koristi samo cifre 0 i 1.",
      },
      {
        pitanje: "Koliko iznosi binarni broj `1010` u dekadnom sistemu?",
        tacni: ["10"],
        netacni: ["5", "8", "12"],
        objasnjenje: "1×8 + 0×4 + 1×2 + 0×1 = 10.",
      },
      {
        pitanje: "Koliko iznosi heksadekadni broj `FF` u dekadnom sistemu?",
        tacni: ["255"],
        netacni: ["256", "15", "1515"],
        objasnjenje: "F ima vrednost 15, pa je FF = 15×16 + 15 = 255.",
      },
      {
        pitanje: "Koje logičko kolo je prikazano na slici?",
        slika: "slike/osnove-racunarstva/i-kolo.svg",
        tacni: ["I kolo (AND)"],
        netacni: ["ILI kolo (OR)", "NE kolo (NOT)", "Isključivo ILI kolo (XOR)"],
        objasnjenje: "I kolo ima ravnu ulaznu stranu i zaobljen izlaz. Izlaz je 1 samo kada su oba ulaza 1.",
      },
      {
        pitanje: "Koji od navedenih uređaja su ulazni uređaji?",
        tacni: ["Tastatura", "Miš", "Skener"],
        netacni: ["Monitor", "Štampač"],
        objasnjenje: "Ulazni uređaji unose podatke u računar. Monitor i štampač su izlazni uređaji.",
      },
      {
        pitanje: "Šta je tačno za RAM memoriju?",
        tacni: ["Sadržaj se briše kada se računar isključi", "U nju može i da se upisuje i da se iz nje čita"],
        netacni: ["Služi za trajno čuvanje podataka", "Sporija je od hard diska"],
        objasnjenje: "RAM je radna memorija računara: brza je, ali privremena.",
      },
    ],

    kol2: [
      {
        pitanje: "Šta je operativni sistem?",
        tacni: ["Softver koji upravlja hardverom i omogućava rad drugih programa"],
        netacni: ["Deo matične ploče", "Program za obradu teksta", "Vrsta računarske mreže"],
      },
      {
        pitanje: "Koji od navedenih programa su operativni sistemi?",
        tacni: ["Linux", "Windows", "Android"],
        netacni: ["Microsoft Word", "Photoshop"],
      },
      {
        pitanje: "Šta označava skraćenica LAN?",
        tacni: ["Lokalnu računarsku mrežu"],
        netacni: ["Mrežu koja povezuje računare širom sveta", "Protokol za bežični prenos podataka", "Vrstu kabla za napajanje"],
        objasnjenje: "LAN (Local Area Network) povezuje računare na manjem prostoru, na primer u kući, kancelariji ili učionici.",
      },
      {
        pitanje: "Koje protokole veb pregledač koristi za učitavanje stranica?",
        tacni: ["HTTP", "HTTPS"],
        netacni: ["SMTP", "POP3"],
        objasnjenje: "HTTPS je HTTP sa šifrovanom vezom. SMTP i POP3 služe za elektronsku poštu.",
      },
      {
        pitanje: "Koja je uloga DNS servera?",
        tacni: ["Prevodi ime domena u IP adresu"],
        netacni: ["Dodeljuje računarima MAC adrese", "Šifruje podatke koji se šalju mrežom", "Čuva kopije veb stranica"],
        objasnjenje: "Kada se u pregledač upiše `www.example.com`, DNS vraća IP adresu servera na kom se sajt nalazi.",
      },
      {
        pitanje: "Šta od navedenog je aplikativni softver?",
        tacni: ["Program za obradu teksta", "Veb pregledač"],
        netacni: ["Drajver za grafičku karticu", "Operativni sistem"],
        objasnjenje: "Aplikativni softver služi korisniku za konkretne zadatke. Drajveri i operativni sistem spadaju u sistemski softver.",
      },
    ],

    zavrsni: [
      {
        pitanje: "Koja je od navedenih jedinica najveća?",
        tacni: ["Terabajt (TB)"],
        netacni: ["Gigabajt (GB)", "Megabajt (MB)", "Kilobajt (KB)"],
      },
      {
        pitanje: "Šta se nalazi u procesoru?",
        tacni: ["Aritmetičko-logička jedinica", "Upravljačka jedinica", "Registri"],
        netacni: ["Hard disk", "Napajanje"],
        objasnjenje: "Aritmetičko-logička jedinica računa, upravljačka jedinica usmerava rad procesora, a registri čuvaju podatke sa kojima se trenutno radi.",
      },
      {
        pitanje: "Šta je tačno za binarni broj `1111`?",
        tacni: ["Dekadna vrednost mu je 15"],
        netacni: ["Dekadna vrednost mu je 16", "Nije ispravan binarni broj", "Ništa od navedenog"],
        objasnjenje: "8 + 4 + 2 + 1 = 15.",
      },
    ],
  },
});
