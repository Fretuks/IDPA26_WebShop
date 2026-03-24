const bcrypt = require('bcrypt');
const db = require('../config/db');
const env = require('../config/env');

const categories = [
  ['Elektronik', 'Geräte und Zubehör'],
  ['Bücher', 'Fach- und Freizeitliteratur'],
  ['Sport', 'Sportartikel'],
  ['Haushalt', 'Haushaltsgeräte'],
  ['Mode', 'Kleidung und Accessoires'],
  ['Beauty', 'Pflegeprodukte'],
  ['Spielzeug', 'Kinder und Lernspielzeug'],
  ['Garten', 'Gartenbedarf'],
  ['Office', 'Bürobedarf'],
  ['Lebensmittel', 'Haltbare Produkte']
];

const productsByCategory = {
  Elektronik: [
    ['Bluetooth-Kopfhörer', 'Kabellose Kopfhörer mit aktiver Geräuschunterdrückung und langer Akkulaufzeit.', 129.9, 32],
    ['4K-Monitor 27 Zoll', 'Scharfer IPS-Monitor für Homeoffice, Studium und kreative Arbeit.', 289.0, 18],
    ['Mechanische Tastatur', 'Robuste Tastatur mit taktilem Feedback und kompakter deutscher Belegung.', 94.5, 40],
    ['USB-C Dockingstation', 'Dock mit HDMI, USB-A, Ethernet und Power Delivery für moderne Laptops.', 119.0, 24],
    ['WLAN-Router AX3000', 'Schneller Dual-Band-Router für stabile Heimnetzwerke.', 159.0, 16],
    ['Portable SSD 1 TB', 'Externe SSD mit schnellem USB-C Anschluss für unterwegs.', 109.0, 28],
    ['Smartwatch Fitness', 'Alltagstaugliche Smartwatch mit Pulsmessung und Aktivitätstracking.', 179.0, 22],
    ['Webcam Full HD', 'Kompakte Webcam mit klarem Bild für Meetings und Streaming.', 69.9, 35],
    ['Bluetooth-Lautsprecher', 'Wasserfester Lautsprecher mit kraftvollem Klang für drinnen und draussen.', 89.0, 30],
    ['Wireless Charger', 'Schnelles Qi-Ladepad für kompatible Smartphones und Kopfhörer.', 34.9, 45]
  ],
  Bücher: [
    ['JavaScript für Einsteiger', 'Praxisnahes Grundlagenbuch für den Einstieg in modernes JavaScript.', 29.9, 55],
    ['React im Alltag', 'Verständliche Einführung in Komponenten, Routing und State-Management.', 36.5, 42],
    ['SQL kompakt', 'Übersichtliches Nachschlagewerk für Datenbanken und Abfragen.', 24.0, 38],
    ['Projektmanagement leicht gemacht', 'Methoden und Werkzeuge für strukturierte Teamarbeit.', 31.0, 21],
    ['Achtsamkeit im Alltag', 'Impulse für mehr Ruhe, Fokus und bessere Routinen.', 18.9, 48],
    ['Schweizer Wanderwege', 'Bildband und Tourenführer für Wochenendtrips in der Schweiz.', 27.5, 26],
    ['Ernährung einfach erklärt', 'Alltagstaugliche Tipps für ausgewogene Mahlzeiten.', 22.0, 34],
    ['Krimi am See', 'Spannender Regionalkrimi mit unerwarteten Wendungen.', 16.9, 60],
    ['Kinderlexikon Tiere', 'Bunt gestaltetes Wissensbuch über Tiere aus aller Welt.', 19.5, 29],
    ['Minimalismus Zuhause', 'Ideen für mehr Ordnung und bewusstes Wohnen.', 21.5, 33]
  ],
  Sport: [
    ['Yogamatte Premium', 'Rutschfeste Matte mit angenehmer Dämpfung für Training und Stretching.', 39.9, 44],
    ['Kurzhantel-Set 10 kg', 'Vielseitiges Set für Krafttraining zuhause.', 54.0, 20],
    ['Springseil Speed', 'Leichtes Trainingsseil für Cardio und Koordination.', 14.9, 70],
    ['Fussball Grösse 5', 'Strapazierfähiger Ball für Training und Freizeit.', 24.5, 36],
    ['Trinkflasche 750 ml', 'Isolierte Edelstahlflasche für Sport und Alltag.', 19.9, 58],
    ['Fitnessband Set', 'Drei Widerstandsbänder für Mobilität und Krafttraining.', 22.0, 47],
    ['Laufgürtel', 'Schmaler Gürtel für Smartphone, Schlüssel und Karten beim Joggen.', 17.5, 31],
    ['Gymnastikball 65 cm', 'Stabiler Ball für Core-Training und aktive Sitzhaltung.', 34.9, 25],
    ['Tennisbälle 4er Pack', 'Druckbälle für Freizeit- und Vereinsspieler.', 11.9, 52],
    ['Faszienrolle', 'Massagerolle zur Regeneration nach dem Training.', 26.0, 39]
  ],
  Haushalt: [
    ['Wasserkocher Edelstahl', 'Schnell erhitzender Wasserkocher mit 1.7 Liter Fassungsvermögen.', 49.9, 26],
    ['Staubsauger kabellos', 'Leichter Akkusauger für Böden, Teppiche und kleine Ecken.', 199.0, 14],
    ['Heissluftfritteuse 5 L', 'Fettarme Zubereitung für Pommes, Gemüse und Snacks.', 129.0, 19],
    ['Pfannenset 3-teilig', 'Antihaft-Pfannen für tägliches Kochen in drei Grössen.', 79.0, 27],
    ['Bettwäsche Baumwolle', 'Weiche Bettwäsche in zeitlosem Design für das ganze Jahr.', 59.0, 23],
    ['Mikrofaser-Reinigungstücher', 'Saugstarke Tücher für Küche, Bad und Fenster.', 12.9, 68],
    ['Aufbewahrungsbox Set', 'Stapelfähige Boxen für Schrank, Keller und Kinderzimmer.', 34.0, 41],
    ['Toaster 2-Scheiben', 'Kompakter Toaster mit Auftau- und Aufwärmfunktion.', 44.5, 24],
    ['Küchenwaage digital', 'Präzise Waage für Backen und Kochen.', 21.9, 33],
    ['Tischlampe LED', 'Schlichte Lampe mit warmem Licht für Wohn- und Arbeitsbereiche.', 37.0, 29]
  ],
  Mode: [
    ['Herren Hoodie', 'Bequemer Hoodie aus weicher Baumwollmischung für Alltag und Freizeit.', 49.9, 36],
    ['Damen Strickpullover', 'Leichter Pullover mit angenehmem Tragegefühl für kühlere Tage.', 54.0, 28],
    ['Sneaker Weiss', 'Vielseitige Alltagssneaker mit bequemer Sohle.', 79.9, 31],
    ['Ledergürtel Braun', 'Klassischer Gürtel mit schlichter Metallschliesse.', 34.5, 46],
    ['Wintermütze', 'Warme Mütze für kalte Tage mit weichem Innenfutter.', 24.0, 42],
    ['Schal aus Wolle', 'Zeitloser Schal für Herbst und Winter.', 39.9, 22],
    ['Regenjacke leicht', 'Wasserabweisende Jacke für Alltag, Reise und Outdoor.', 89.0, 18],
    ['Umhängetasche', 'Praktische Tasche für Stadt, Uni oder Arbeit.', 59.0, 25],
    ['Socken 5er Pack', 'Bequeme Alltagssocken mit hohem Baumwollanteil.', 19.9, 73],
    ['Sonnenbrille polarisiert', 'Leichte Sonnenbrille mit UV-Schutz für sonnige Tage.', 44.0, 27]
  ],
  Beauty: [
    ['Gesichtscreme Feuchtigkeit', 'Leichte Tagespflege mit Hyaluron für ein angenehmes Hautgefühl.', 24.9, 37],
    ['Shampoo Repair', 'Pflegendes Shampoo für trockenes und strapaziertes Haar.', 12.5, 64],
    ['Body Lotion Shea', 'Rückfettende Lotion mit sanftem Duft und schneller Absorption.', 16.9, 52],
    ['Sonnencreme SPF 50', 'Hoher UV-Schutz für Alltag, Ferien und Sport.', 18.0, 40],
    ['Handcreme Sensitiv', 'Milde Pflege für trockene Hände ohne starken Duft.', 8.9, 71],
    ['Lippenpflege', 'Praktischer Pflegestift für unterwegs.', 4.9, 85],
    ['Gesichtsreiniger Mild', 'Schonende Reinigung für morgens und abends.', 14.0, 44],
    ['Mascara Volume', 'Tiefschwarze Mascara mit flexiblem Bürstchen für mehr Volumen.', 17.5, 33],
    ['Parfum Fresh Bloom', 'Frischer Duft mit floralen und zitrischen Noten.', 49.0, 20],
    ['Kosmetiktasche', 'Kompakte Tasche für Pflegeprodukte auf Reisen.', 21.0, 29]
  ],
  Spielzeug: [
    ['Holzbausteine 100-teilig', 'Klassisches Bauset für kreatives Spielen und erstes Konstruieren.', 34.9, 32],
    ['Puzzle Weltkarte 500 Teile', 'Lehrreiches Puzzle für neugierige Kinder und Erwachsene.', 19.9, 27],
    ['Plüschtier Fuchs', 'Weiches Stofftier zum Kuscheln und Liebhaben.', 24.0, 36],
    ['Ferngesteuertes Auto', 'Schnelles RC-Auto für Indoor- und Outdoor-Spass.', 59.0, 18],
    ['Malset Kinder', 'Farbenfrohes Set mit Stiften, Wachsmalkreiden und Block.', 17.9, 49],
    ['Lernspiel Zahlen', 'Spielerischer Einstieg in Zahlen und Mengen für Vorschulkinder.', 21.5, 22],
    ['Wasserball bunt', 'Leichter Ball für Garten, Strand und Ferien.', 9.9, 55],
    ['Spielküche Holz', 'Liebevoll gestaltete Küche für Rollenspiele zuhause.', 129.0, 8],
    ['Knetset Kreativ', 'Mehrfarbiges Set mit Werkzeugen für fantasievolle Figuren.', 14.9, 39],
    ['Kinderbuch Taschenlampe', 'Interaktives Vorlesebuch für den Abend.', 16.0, 26]
  ],
  Garten: [
    ['Gartenschere Profi', 'Scharfe Schere für Rosen, Stauden und kleinere Zweige.', 29.9, 34],
    ['Blumenerde 20 L', 'Nährstoffreiche Erde für Balkon, Beet und Topfpflanzen.', 11.5, 80],
    ['Giesskanne 10 L', 'Robuste Giesskanne mit langem Auslauf für gezieltes Bewässern.', 18.9, 28],
    ['Solar-Gartenleuchte', 'Dekorative Leuchte mit warmweissem Licht für Wege und Terrasse.', 22.0, 46],
    ['Pflanzenset Kräuter', 'Starter-Set mit Basilikum, Petersilie und Schnittlauch.', 15.9, 24],
    ['Handschuhe Gartenarbeit', 'Griffige Handschuhe für Erde, Pflanzen und Werkzeuge.', 9.5, 57],
    ['Schlauchwagen kompakt', 'Praktische Aufbewahrung für Gartenschläuche bis 30 Meter.', 54.0, 12],
    ['Rankhilfe Metall', 'Stabile Unterstützung für Tomaten und Kletterpflanzen.', 19.0, 31],
    ['Vogelhaus Holz', 'Wetterfestes Haus für Meisen und andere Gartenvögel.', 27.0, 17],
    ['Outdoor-Sitzkissen', 'Wasserabweisendes Kissen für Balkon und Gartenbank.', 24.5, 22]
  ],
  Office: [
    ['Notebook A5', 'Schlichtes Notizbuch mit punktierten Seiten für Alltag und Projekte.', 9.9, 75],
    ['Kugelschreiber 10er Set', 'Zuverlässige Stifte mit angenehmem Schreibgefühl.', 12.0, 90],
    ['Ergonomische Maus', 'Komfortable Maus für lange Arbeitstage am Bildschirm.', 34.9, 26],
    ['Laptop-Ständer', 'Höhenverstellbarer Ständer für bessere Haltung am Schreibtisch.', 39.0, 20],
    ['Whiteboard klein', 'Kompaktes Whiteboard für Notizen, Planung und To-dos.', 29.5, 23],
    ['Aktenordner 5er Set', 'Stabile Ordner für Unterlagen und Dokumente.', 21.0, 44],
    ['Desk Organizer', 'Ordnungssystem für Stifte, Briefe und Kleinteile.', 18.9, 35],
    ['Papier A4 500 Blatt', 'Weisses Druckerpapier für Alltag und Büro.', 8.5, 110],
    ['Tischunterlage Filz', 'Schützt den Schreibtisch und verbessert das Schreibgefühl.', 24.0, 29],
    ['Headset Office', 'Leichtes Headset für Calls und Videokonferenzen.', 47.0, 18]
  ],
  Lebensmittel: [
    ['Bio Haferflocken 1 kg', 'Vielseitige Flocken für Müsli, Porridge und Backrezepte.', 4.9, 120],
    ['Basmati Reis 1 kg', 'Aromatischer Langkornreis für Alltag und Vorratsschrank.', 6.5, 95],
    ['Penne Pasta 500 g', 'Italienische Hartweizenpasta für schnelle Gerichte.', 2.9, 130],
    ['Tomatensauce Classica', 'Fruchtige Sauce für Pasta, Lasagne und Aufläufe.', 3.5, 88],
    ['Mandeln geröstet 250 g', 'Knackiger Snack für unterwegs oder als Topping.', 7.9, 54],
    ['Dunkle Schokolade 70%', 'Kräftige Schokolade für kleine Genussmomente.', 3.2, 102],
    ['Olivenöl Extra Vergine', 'Hochwertiges Öl für Salate und warme Küche.', 12.9, 40],
    ['Kräutertee Mischung', 'Milde Teemischung für entspannte Pausen.', 5.5, 63],
    ['Honig Blüten 500 g', 'Feincremiger Blütenhonig aus kontrollierter Herkunft.', 8.9, 47],
    ['Kaffee Bohnen 1 kg', 'Ausgewogene Röstung für Vollautomat und Siebträger.', 18.5, 39]
  ]
};

async function seed() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const schema = await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    if (!schema.rows.some((r) => r.table_name === 'users')) {
      throw new Error('Schema missing. Run backend/sql/schema.sql first.');
    }

    await client.query('TRUNCATE order_items, orders, cart_items, carts, addresses, products, categories, users RESTART IDENTITY CASCADE');

    for (const [name, description] of categories) {
      await client.query('INSERT INTO categories (name, description) VALUES ($1, $2)', [name, description]);
    }

    const categoryRows = await client.query('SELECT id, name FROM categories ORDER BY id ASC');

    for (const category of categoryRows.rows) {
      const products = productsByCategory[category.name] || [];

      for (const [name, description, price, stock] of products) {
        await client.query(
          `INSERT INTO products (name, description, price, stock, category_id, active)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [name, description, price.toFixed(2), stock, category.id, true]
        );
      }
    }

    const adminPassword = await bcrypt.hash('Admin1234!', env.bcryptRounds);
    const testPassword = await bcrypt.hash('Test1234!', env.bcryptRounds);

    const adminUser = await client.query(
      `INSERT INTO users (firstname, lastname, email, password_hash, role)
       VALUES ('Admin', 'User', 'admin@webshop.local', $1, 'ADMIN')
       RETURNING id`,
      [adminPassword]
    );

    const testUser = await client.query(
      `INSERT INTO users (firstname, lastname, email, password_hash, role)
       VALUES ('Test', 'User', 'test@webshop.local', $1, 'CUSTOMER')
       RETURNING id`,
      [testPassword]
    );

    await client.query('INSERT INTO carts (user_id) VALUES ($1), ($2)', [adminUser.rows[0].id, testUser.rows[0].id]);

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
    console.log('Admin login: admin@webshop.local / Admin1234!');
    console.log('Test login: test@webshop.local / Test1234!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
}

seed();
