# Vežbaonica

Aplikacija za učenje: izabereš predmet, pa prvi kolokvijum, drugi kolokvijum ili završni ispit, a onda gledaš tačne odgovore ili radiš test.

## Pokretanje

Dovoljan je dvoklik na `index.html`. Ništa ne mora da se instalira.

## Šta je gde

- `index.html` je stranica aplikacije. Svaka tema ovde ima svoj red `<script src="podaci/...">`.
- `podaci/predmeti.js` je spisak predmeta, sa opisom formata pitanja.
- `podaci/<predmet>/` sadrži pitanja i odgovore, po jedan fajl za svaku temu.
- `slike/` sadrži slike uz pitanja, sa posebnim folderom za svaki predmet.
- `prezentacije/` je mesto za prezentacije od kojih se prave pitanja. Ovaj folder se ne objavljuje.
- `css/` i `js/` sadrže izgled i logiku aplikacije.

## Objavljivanje na internetu

Sajt se objavljuje preko GitHub Pages i dostupan je svakome ko dobije link.
Folder `prezentacije` je u `.gitignore`, pa nikad ne ide na GitHub.
