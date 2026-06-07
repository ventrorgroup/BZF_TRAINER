const fs = require('fs');
const path = require('path');

// Read existing simulations
const simsFile = 'C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\backend\\data\\sprechfunk-simulationen.json';
let sims = [];
if (fs.existsSync(simsFile)) {
  sims = JSON.parse(fs.readFileSync(simsFile, 'utf8'));
}

// 1. Update Köln-Bonn (#1) with map coordinates and cockpit stats
const koeln = sims.find(s => s.id === 'koeln-bonn');
if (koeln) {
  koeln.steps.forEach((step, idx) => {
    // Frequencies
    if (idx < 7) step.frequency = "121.855"; // Delivery
    else if (idx < 16) step.frequency = "121.730"; // Ground
    else if (idx < 31) step.frequency = "124.980"; // Tower
    else if (idx < 39) step.frequency = "125.900"; // Langen Info
    else if (idx < 48) step.frequency = "131.330"; // Bremen Radar
    else if (idx < 68) step.frequency = "126.850"; // Hamburg Tower
    else step.frequency = "121.805"; // Hamburg Ground

    // Squawks
    if (idx < 20) step.squawk = "7000";
    else if (idx < 29) step.squawk = "2143"; // special VFR
    else if (idx < 35) step.squawk = "7000";
    else if (idx < 46) step.squawk = "7744";
    else step.squawk = "7000";

    // Altitudes
    if (idx < 20) step.altitude = 300; // EDDK elevation
    else if (idx < 25) step.altitude = 1200; // climbing
    else if (idx < 27) step.altitude = 1800; // ECHO 2
    else if (idx < 31) step.altitude = 2000; // ECHO 1
    else if (idx < 48) step.altitude = 5500; // FL55
    else if (idx < 57) step.altitude = 2000; // SIERRA 1 / SIERRA 2
    else if (idx < 60) step.altitude = 2000;
    else if (idx < 62) step.altitude = 1500; // downwind
    else if (idx < 65) step.altitude = 800; // final
    else step.altitude = 53; // EDDH elevation

    // Map positions
    if (idx < 8) step.mapPosition = { lat: 50.8700, lng: 7.1350, label: "Apron A (EDDK)" };
    else if (idx < 11) step.mapPosition = { lat: 50.8750, lng: 7.1280, label: "Taxiing to Rwy 14L" };
    else if (idx < 17) step.mapPosition = { lat: 50.8780, lng: 7.1250, label: "Holding Point A5" };
    else if (idx < 20) step.mapPosition = { lat: 50.8720, lng: 7.1320, label: "Runway 14L" };
    else if (idx < 25) step.mapPosition = { lat: 50.8400, lng: 7.1700, label: "Climbing VFR" };
    else if (idx < 28) step.mapPosition = { lat: 50.8200, lng: 7.2000, label: "ECHO 2 (2000 ft)" };
    else if (idx < 31) step.mapPosition = { lat: 50.7700, lng: 7.2500, label: "ECHO 1 (2000 ft)" };
    else if (idx < 37) step.mapPosition = { lat: 52.0300, lng: 8.6500, label: "Overhead Bielefeld (FL55)" };
    else if (idx < 41) step.mapPosition = { lat: 52.2400, lng: 8.9200, label: "Abeam Porta Westfalica (FL55)" };
    else if (idx < 47) step.mapPosition = { lat: 52.4200, lng: 9.6800, label: "Crossing CTR Hannover (FL55)" };
    else if (idx < 49) step.mapPosition = { lat: 52.9500, lng: 9.8500, label: "Cruising to Hamburg (FL55)" };
    else if (idx < 54) step.mapPosition = { lat: 53.4500, lng: 10.0300, label: "South of SIERRA 1" };
    else if (idx < 57) step.mapPosition = { lat: 53.5300, lng: 10.0200, label: "SIERRA 1 (2000 ft)" };
    else if (idx < 60) step.mapPosition = { lat: 53.5800, lng: 10.0000, label: "SIERRA 2 (2000 ft)" };
    else if (idx < 62) step.mapPosition = { lat: 53.6080, lng: 10.0100, label: "Right Downwind Runway 05" };
    else if (idx < 65) step.mapPosition = { lat: 53.6150, lng: 9.9850, label: "Right Base Runway 05" };
    else if (idx < 68) step.mapPosition = { lat: 53.6210, lng: 9.9720, label: "Final Runway 05" };
    else if (idx < 69) step.mapPosition = { lat: 53.6300, lng: 9.9880, label: "Runway Vacated via A6" };
    else if (idx < 73) step.mapPosition = { lat: 53.6330, lng: 9.9820, label: "Taxiing to GAT" };
    else step.mapPosition = { lat: 53.6330, lng: 9.9820, label: "Apron 4 GAT (EDDH)" };

    step.phase = idx < 20 ? "ground" : idx < 31 ? "departure" : idx < 49 ? "cruise" : idx < 68 ? "approach" : "ground";
  });
}

// 2. Update Leipzig-Nürnberg (#2)
const leipzig = sims.find(s => s.id === 'leipzig-nuernberg');
if (leipzig) {
  leipzig.steps.forEach((step, idx) => {
    // Frequencies
    if (idx < 7) step.frequency = "121.930"; // Leipzig Delivery
    else if (idx < 15) step.frequency = "121.805"; // Leipzig Ground
    else if (idx < 27) step.frequency = "121.105"; // Leipzig Tower
    else if (idx < 33) step.frequency = "120.650"; // München Info
    else if (idx < 63) step.frequency = "118.300"; // Nürnberg Tower
    else step.frequency = "118.100"; // Nürnberg Ground

    // Squawks
    if (idx < 21) step.squawk = "7000";
    else if (idx < 29) step.squawk = "7000";
    else if (idx < 39) step.squawk = "4452";
    else step.squawk = "7000";

    // Altitudes
    if (idx < 21) step.altitude = 470; // EDDP elevation
    else if (idx < 23) step.altitude = 1200; // climbing
    else if (idx < 25) step.altitude = 1900; // SIERRA 2
    else if (idx < 28) step.altitude = 2000; // SIERRA 1
    else if (idx < 42) step.altitude = 4500; // FL45 cruise
    else if (idx < 48) step.altitude = 3000; // approaching WHISKEY 1
    else if (idx < 51) step.altitude = 2500; // WHISKEY 2
    else if (idx < 54) step.altitude = 2000; // downwind
    else if (idx < 57) step.altitude = 1500; // base
    else if (idx < 60) step.altitude = 800; // final
    else step.altitude = 1040; // EDDN elevation

    // Map positions
    if (idx < 8) step.mapPosition = { lat: 51.4270, lng: 12.2400, label: "Apron 1 GAT (EDDP)" };
    else if (idx < 11) step.mapPosition = { lat: 51.4250, lng: 12.2450, label: "Taxiing via N, N5, S5, T" };
    else if (idx < 16) step.mapPosition = { lat: 51.4250, lng: 12.2500, label: "Holding Point H5 Rwy 26L" };
    else if (idx < 21) step.mapPosition = { lat: 51.4250, lng: 12.2600, label: "Lineup Runway 26L" };
    else if (idx < 23) step.mapPosition = { lat: 51.4230, lng: 12.2120, label: "Takeoff Runway 26L" };
    else if (idx < 25) step.mapPosition = { lat: 51.3800, lng: 12.2500, label: "SIERRA 2 (1900 ft)" };
    else if (idx < 28) step.mapPosition = { lat: 51.3400, lng: 12.2800, label: "SIERRA 1 (2000 ft)" };
    else if (idx < 33) step.mapPosition = { lat: 50.3100, lng: 11.9000, label: "Near Hof (4500 ft)" };
    else if (idx < 39) step.mapPosition = { lat: 49.6000, lng: 11.1000, label: "Crossing Airspace D Nürnberg" };
    else if (idx < 42) step.mapPosition = { lat: 49.5500, lng: 11.1000, label: "Approaching Nürnberg" };
    else if (idx < 45) step.mapPosition = { lat: 49.5500, lng: 10.9500, label: "North of WHISKEY 1" };
    else if (idx < 48) step.mapPosition = { lat: 49.5200, lng: 10.9500, label: "WHISKEY 1 (3000 ft)" };
    else if (idx < 51) step.mapPosition = { lat: 49.5000, lng: 11.0200, label: "WHISKEY 2 (2500 ft)" };
    else if (idx < 54) step.mapPosition = { lat: 49.5100, lng: 11.0500, label: "Left Downwind Runway 28" };
    else if (idx < 57) step.mapPosition = { lat: 49.5100, lng: 11.1000, label: "Left Base Runway 28" };
    else if (idx < 60) step.mapPosition = { lat: 49.5000, lng: 11.1000, label: "Final Runway 28" };
    else if (idx < 64) step.mapPosition = { lat: 49.4970, lng: 11.0500, label: "Runway Vacated via G" };
    else if (idx < 70) step.mapPosition = { lat: 49.4950, lng: 11.0600, label: "Taxiing to GAT" };
    else step.mapPosition = { lat: 49.4950, lng: 11.0600, label: "Apron GAT (EDDN)" };

    step.phase = idx < 21 ? "ground" : idx < 28 ? "departure" : idx < 42 ? "cruise" : idx < 60 ? "approach" : "ground";
  });
}

// 3. Update Hannover (#3)
const hannover = sims.find(s => s.id === 'hannover');
if (hannover) {
  // Let's reset and structure it to 40 steps exactly as defined in JSON
  hannover.steps.forEach((step, idx) => {
    // Frequencies
    if (idx < 21) step.frequency = "121.955"; // Hannover Ground
    else step.frequency = "120.180"; // Hannover Tower

    // Squawks
    step.squawk = "7000";

    // Altitudes
    if (idx < 21) step.altitude = 183; // EDDV elevation
    else if (idx < 24) step.altitude = 1000; // climbing
    else if (idx < 27) step.altitude = 1700; // Autobahn A7
    else if (idx < 30) step.altitude = 2000; // Burgdorf
    else if (idx < 33) step.altitude = 2300; // approaching WHISKEY 1
    else if (idx < 36) step.altitude = 2300; // WHISKEY 1
    else if (idx < 38) step.altitude = 2300; // WHISKEY 2
    else step.altitude = 800; // final runway 09L

    // Map positions
    if (idx < 6) step.mapPosition = { lat: 52.4630, lng: 9.6800, label: "Apron 1 GAT (EDDV)" };
    else if (idx < 10) step.mapPosition = { lat: 52.4610, lng: 9.6700, label: "Taxiing via O, M, L" };
    else if (idx < 21) step.mapPosition = { lat: 52.4600, lng: 9.6600, label: "Holding Point Runway 09C" };
    else if (idx < 24) step.mapPosition = { lat: 52.4600, lng: 9.6850, label: "Takeoff Runway 09C" };
    else if (idx < 27) step.mapPosition = { lat: 52.4600, lng: 9.8500, label: "Climbing over Autobahn A7" };
    else if (idx < 30) step.mapPosition = { lat: 52.4450, lng: 10.0080, label: "Burgdorf (2000 ft)" };
    else if (idx < 33) step.mapPosition = { lat: 52.4800, lng: 9.4000, label: "VFR Cruise East of WHISKEY 1" };
    else if (idx < 36) step.mapPosition = { lat: 52.4800, lng: 9.5300, label: "WHISKEY 1 (2300 ft)" };
    else if (idx < 38) step.mapPosition = { lat: 52.4700, lng: 9.6100, label: "WHISKEY 2 (2300 ft)" };
    else step.mapPosition = { lat: 52.4650, lng: 9.6600, label: "Final Runway 09L" };

    step.phase = idx < 21 ? "ground" : idx < 30 ? "departure" : "approach";
  });
}

// 4. Create Braunschweig (#4)
const braunschweig = {
  id: "braunschweig",
  title: "#4 Braunschweig",
  steps: [
    {
      id: 1,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Braunschweig Tower für den Erstkontakt (Einleitungsanruf).",
      promptEn: "Call Braunschweig Tower (initial call).",
      textEn: "Braunschweig Tower, D-EPAH.",
      textDe: "Braunschweig Turm, D-EPAH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3197, lng: 10.5562, label: "Apron GAT (EDVE)" },
      phase: "ground"
    },
    {
      id: 2,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Braunschweig Tower.",
      textDe: "D-EPAH, Braunschweig Turm.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3197, lng: 10.5562, label: "Apron GAT (EDVE)" },
      phase: "ground"
    },
    {
      id: 3,
      type: "message",
      role: "pilot",
      promptDe: "Melde deine Position am Terminal-Apron, dein Flugzeugmuster (P28A), deine Absicht (VFR über SIERRA) mit Info PAPA und erbitte Rollfreigabe.",
      promptEn: "Report your position (terminal apron), aircraft type (P28A), VFR via SIERRA with Information PAPA and request taxi.",
      textEn: "D-EPAH, P28A, at apron in front of the terminal, VFR via SIERRA, Information PAPA, request taxi.",
      textDe: "D-EPAH, P28A auf Abstellfläche vor Terminal, VFR über SIERRA, Information PAPA, erbitte rollen.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3197, lng: 10.5562, label: "Apron GAT (EDVE)" },
      phase: "ground"
    },
    {
      id: 4,
      type: "message",
      role: "tower",
      textEn: "D-AH, taxi to holding point runway 26 via C and A, QNH 1017.",
      textDe: "D-AH, rollen Sie zum Rollhalt Piste 26 über C und A, QNH 1017.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3197, lng: 10.5562, label: "Apron GAT (EDVE)" },
      phase: "ground"
    },
    {
      id: 5,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Rollanweisung zum Rollhalt Piste 26 über C und A sowie QNH 1017.",
      promptEn: "Acknowledge taxi routing to runway 26 via C and A, QNH 1017.",
      textEn: "Taxi to holding point runway 26 via C and A, QNH 1017, D-AH.",
      textDe: "Rolle zum Rollhalt Piste 26 über C und A, QNH 1017, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3196, lng: 10.5630, label: "Taxiing via C & A" },
      phase: "ground"
    },
    {
      id: 6,
      type: "message",
      role: "tower",
      textEn: "D-AH, report ready for departure.",
      textDe: "D-AH, melden Sie abflugbereit.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3196, lng: 10.5698, label: "Holding Point Runway 26" },
      phase: "ground"
    },
    {
      id: 7,
      type: "message",
      role: "pilot",
      promptDe: "Melde dich abflugbereit am Rollhalt.",
      promptEn: "Report ready for departure at the holding point.",
      textEn: "D-AH, ready for departure.",
      textDe: "D-AH, abflugbereit.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3196, lng: 10.5698, label: "Holding Point Runway 26" },
      phase: "ground"
    },
    {
      id: 8,
      type: "message",
      role: "tower",
      textEn: "D-AH, leave control zone via SIERRA, wind 230 degrees 4 knots, runway 26 cleared for takeoff.",
      textDe: "D-AH, verlassen Sie Kontrollzone über SIERRA, Wind 230 Grad 4 Knoten, Piste 26 Start frei.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3196, lng: 10.5698, label: "Holding Point Runway 26" },
      phase: "ground"
    },
    {
      id: 9,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Startfreigabe und die Abflugroute über SIERRA.",
      promptEn: "Acknowledge departure route via SIERRA and takeoff clearance on runway 26.",
      textEn: "Will leave control zone via SIERRA, runway 26 cleared for takeoff, D-AH.",
      textDe: "Werde Kontrollzone über SIERRA verlassen, Piste 26 Start frei, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 350,
      mapPosition: { lat: 52.3192, lng: 10.5600, label: "Rolling on Runway 26" },
      phase: "departure"
    },
    {
      id: 10,
      type: "message",
      role: "tower",
      textEn: "D-AH, hold position, cancel takeoff, I say again, cancel takeoff.",
      textDe: "D-AH, halten Sie Position, Startfreigabe aufgehoben, ich wiederhole, Startfreigabe aufgehoben.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3192, lng: 10.5500, label: "Aborted Takeoff, Holding" },
      phase: "ground"
    },
    {
      id: 11,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Halten der Position und den Abbruch des Starts.",
      promptEn: "Acknowledge holding position and cancelling takeoff.",
      textEn: "Holding, D-AH.",
      textDe: "Halte Position, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3192, lng: 10.5500, label: "Aborted Takeoff, Holding" },
      phase: "ground"
    },
    {
      id: 12,
      type: "message",
      role: "tower",
      textEn: "D-AH, when airborne climb straight ahead, standby for left turn, wind 230 degrees 4 knots, runway 26 cleared for takeoff.",
      textDe: "D-AH, nach dem Abheben steigen Sie geradeaus, warten Sie auf Linkskurve, Wind 230 Grad 4 Knoten, Piste 26 Start frei.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3192, lng: 10.5500, label: "Runway 26 Lineup" },
      phase: "ground"
    },
    {
      id: 13,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du geradeaus steigen wirst, auf Linkskurve wartest und die Startfreigabe für Piste 26.",
      promptEn: "Acknowledge climbing straight ahead, standing by for left turn and takeoff clearance on runway 26.",
      textEn: "When airborne I will climb straight ahead, standby for left turn, runway 26 cleared for takeoff, D-AH.",
      textDe: "Steige nach Abheben geradeaus, warte auf Linkskurve, Piste 26 Start frei, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 600,
      mapPosition: { lat: 52.3192, lng: 10.5350, label: "Climbing Straight Ahead" },
      phase: "departure"
    },
    {
      id: 14,
      type: "message",
      role: "tower",
      textEn: "D-AH, turn left direct SIERRA, report SIERRA.",
      textDe: "D-AH, drehen Sie links direkt SIERRA, melden Sie SIERRA.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1200,
      mapPosition: { lat: 52.3100, lng: 10.5300, label: "Turning Left to SIERRA" },
      phase: "departure"
    },
    {
      id: 15,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Linkskurve direkt nach SIERRA und die Meldung an SIERRA.",
      promptEn: "Acknowledge left turn direct SIERRA and reporting SIERRA.",
      textEn: "Will turn left direct SIERRA, wilco, D-AH.",
      textDe: "Drehe links direkt SIERRA, wilco, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1800,
      mapPosition: { lat: 52.2850, lng: 10.5500, label: "Flying direct SIERRA" },
      phase: "departure"
    },
    {
      id: 16,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen von SIERRA in deiner aktuellen Höhe (2000 Fuß).",
      promptEn: "Report passing SIERRA at 2000 feet.",
      textEn: "D-AH, SIERRA at 2000 feet.",
      textDe: "D-AH, SIERRA in 2000 Fuß.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2600, lng: 10.5600, label: "SIERRA (2000 ft)" },
      phase: "departure"
    },
    {
      id: 17,
      type: "message",
      role: "tower",
      textEn: "D-AH, approved to leave frequency.",
      textDe: "D-AH, verlassen der Frequenz genehmigt.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2600, lng: 10.5600, label: "SIERRA (2000 ft)" },
      phase: "departure"
    },
    {
      id: 18,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Erlaubnis, die Frequenz zu verlassen.",
      promptEn: "Acknowledge approval to leave frequency.",
      textEn: "Approved to leave frequency, D-AH.",
      textDe: "Verlassen der Frequenz genehmigt, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2400, lng: 10.5600, label: "VFR Cruise (Outside CTR)" },
      phase: "cruise"
    },
    {
      id: 19,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Braunschweig Tower für den Einflugsruf der Landung.",
      promptEn: "Call Braunschweig Tower for landing entry (initial call).",
      textEn: "Braunschweig Tower, D-EPAH.",
      textDe: "Braunschweig Turm, D-EPAH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.3200, lng: 10.9000, label: "10 NM East of ECHO 1" },
      phase: "approach"
    },
    {
      id: 20,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Braunschweig Tower.",
      textDe: "D-EPAH, Braunschweig Turm.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.3200, lng: 10.9000, label: "10 NM East of ECHO 1" },
      phase: "approach"
    },
    {
      id: 21,
      type: "message",
      role: "pilot",
      promptDe: "Melde deinen Typ (P28A), Position (10 Meilen östlich von ECHO 1) in 2000 Fuß mit Info ZULU und bitte um Landefreigabe.",
      promptEn: "Report type (P28A), position (10 miles east of ECHO 1) at 2000 feet with Information ZULU and request landing.",
      textEn: "D-EPAH, P28A, VFR, 10 miles east of ECHO 1 at 2000 feet, information ZULU, for landing.",
      textDe: "D-EPAH, P28A, VFR, 10 Meilen östlich von ECHO 1 in 2000 Fuß, Information ZULU, zur Landung.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.3200, lng: 10.9000, label: "10 NM East of ECHO 1" },
      phase: "approach"
    },
    {
      id: 22,
      type: "message",
      role: "tower",
      textEn: "D-AH, enter control zone via ECHO 1 and ECHO 2, runway 26 in use, QNH 1017.",
      textDe: "D-AH, fliegen Sie in Kontrollzone über ECHO 1 und ECHO 2, Piste 26, QNH 1017.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.3200, lng: 10.9000, label: "10 NM East of ECHO 1" },
      phase: "approach"
    },
    {
      id: 23,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Einflug über ECHO 1 und ECHO 2, die Piste 26 und das QNH 1017.",
      promptEn: "Acknowledge entering control zone via ECHO 1 and ECHO 2 for runway 26, QNH 1017.",
      textEn: "Will enter control zone via ECHO 1 and ECHO 2, runway 26, QNH 1017, D-AH.",
      textDe: "Fliege in Kontrollzone über ECHO 1 und ECHO 2, Piste 26, QNH 1017, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1900,
      mapPosition: { lat: 52.3200, lng: 10.7800, label: "Flying direct ECHO 1" },
      phase: "approach"
    },
    {
      id: 24,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen von ECHO 1 in 1800 Fuß.",
      promptEn: "Report passing ECHO 1 at 1800 feet.",
      textEn: "D-AH, ECHO 1 at 1800 feet.",
      textDe: "D-AH, ECHO 1 in 1800 Fuß.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1800,
      mapPosition: { lat: 52.3200, lng: 10.7000, label: "ECHO 1 (1800 ft)" },
      phase: "approach"
    },
    {
      id: 25,
      type: "message",
      role: "tower",
      textEn: "D-AH, roger, report ECHO 2.",
      textDe: "D-AH, verstanden, melden Sie ECHO 2.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1800,
      mapPosition: { lat: 52.3200, lng: 10.7000, label: "ECHO 1 (1800 ft)" },
      phase: "approach"
    },
    {
      id: 26,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du dich an ECHO 2 melden wirst.",
      promptEn: "Acknowledge instruction to report passing ECHO 2.",
      textEn: "Wilco, D-AH.",
      textDe: "Melde ECHO 2, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1500,
      mapPosition: { lat: 52.3200, lng: 10.6600, label: "Flying direct ECHO 2" },
      phase: "approach"
    },
    {
      id: 27,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen von ECHO 2 in 1300 Fuß.",
      promptEn: "Report passing ECHO 2 at 1300 feet.",
      textEn: "D-AH, ECHO 2 at 1300 feet.",
      textDe: "D-AH, ECHO 2 in 1300 Fuß.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1300,
      mapPosition: { lat: 52.3200, lng: 10.6200, label: "ECHO 2 (1300 ft)" },
      phase: "approach"
    },
    {
      id: 28,
      type: "message",
      role: "tower",
      textEn: "D-AH, proceed direct final runway 26, wind 230 degrees 4 knots.",
      textDe: "D-AH, fliegen Sie direkt in den Endanflug Piste 26, Wind 230 Grad 4 Knoten.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1300,
      mapPosition: { lat: 52.3200, lng: 10.6200, label: "ECHO 2 (1300 ft)" },
      phase: "approach"
    },
    {
      id: 29,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Direktflug in den Endanflug der Piste 26.",
      promptEn: "Acknowledge flying direct final runway 26.",
      textEn: "Proceeding direct final runway 26, D-AH.",
      textDe: "Fliege direkt in den Endanflug Piste 26, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1000,
      mapPosition: { lat: 52.3190, lng: 10.5700, label: "Turning to Final" },
      phase: "approach"
    },
    {
      id: 30,
      type: "message",
      role: "tower",
      textEn: "D-AH, wind 230 degrees 4 knots, runway 26 cleared to land.",
      textDe: "D-AH, Wind 230 Grad 4 Knoten, Piste 26 Landung frei.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 500,
      mapPosition: { lat: 52.3192, lng: 10.5698, label: "Final Runway 26" },
      phase: "approach"
    },
    {
      id: 31,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Landefreigabe für Piste 26.",
      promptEn: "Acknowledge landing clearance for runway 26.",
      textEn: "Runway 26 cleared to land, D-AH.",
      textDe: "Piste 26 Landung frei, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 350,
      mapPosition: { lat: 52.3192, lng: 10.5698, label: "Final Runway 26" },
      phase: "approach"
    },
    {
      id: 32,
      type: "message",
      role: "tower",
      textEn: "D-AH, go around and turn left heading 200.",
      textDe: "D-AH, starten Sie durch und drehen Sie links Kurs 200.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 400,
      mapPosition: { lat: 52.3192, lng: 10.5500, label: "Go-Around Runway 26" },
      phase: "circuit"
    },
    {
      id: 33,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Durchstarten und die Linkskurve auf Steuerkurs 200.",
      promptEn: "Acknowledge going around and turning left heading 200.",
      textEn: "Going around and turning left heading 200, D-AH.",
      textDe: "Starte durch und drehe links auf Kurs 200, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1000,
      mapPosition: { lat: 52.3000, lng: 10.5350, label: "Climbing Heading 200" },
      phase: "circuit"
    },
    {
      id: 34,
      type: "message",
      role: "tower",
      textEn: "D-AH, join traffic circuit runway 26, report downwind.",
      textDe: "D-AH, fliegen Sie in die Platzrunde Piste 26, melden Sie Gegenanflug.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1200,
      mapPosition: { lat: 52.3100, lng: 10.5100, label: "Joining Traffic Circuit" },
      phase: "circuit"
    },
    {
      id: 35,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Einfliegen in die Platzrunde und die Anweisung, den Gegenanflug zu melden.",
      promptEn: "Acknowledge joining traffic circuit for runway 26 and reporting downwind.",
      textEn: "Joining traffic circuit runway 26, wilco, D-AH.",
      textDe: "Fliege in die Platzrunde Piste 26, wilco, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1300,
      mapPosition: { lat: 52.3320, lng: 10.5100, label: "Turning to Downwind" },
      phase: "circuit"
    },
    {
      id: 36,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Gegenanflugs der Piste 26.",
      promptEn: "Report passing downwind leg of runway 26.",
      textEn: "D-AH, downwind runway 26.",
      textDe: "D-AH, Gegenanflug Piste 26.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1300,
      mapPosition: { lat: 52.3320, lng: 10.5560, label: "Gegenanflug Rwy 26" },
      phase: "circuit"
    },
    {
      id: 37,
      type: "message",
      role: "tower",
      textEn: "D-AH, number 2, follow Cessna 172 in base, report traffic in sight.",
      textDe: "D-AH, Nummer 2, Folgen Sie Cessna 172 im Queranflug Piste 26, Melden Sie Verkehr in Sicht.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1300,
      mapPosition: { lat: 52.3320, lng: 10.5560, label: "Gegenanflug Rwy 26" },
      phase: "circuit"
    },
    {
      id: 38,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du die Nummer 2 bist, der Cessna 172 folgst und du den Verkehr in Sicht hast.",
      promptEn: "Acknowledge being number 2, following Cessna 172 and reporting traffic in sight.",
      textEn: "Number 2, following Cessna 172, traffic in sight, D-AH.",
      textDe: "Nummer 2, werde Cessna 172 folgen, Verkehr in Sicht, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 1200,
      mapPosition: { lat: 52.3320, lng: 10.5700, label: "Turning to Base, Traffic in Sight" },
      phase: "circuit"
    },
    {
      id: 39,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Endanflugs der Piste 26.",
      promptEn: "Report final leg for runway 26.",
      textEn: "D-AH, final runway 26.",
      textDe: "D-AH, Endanflug Piste 26.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 800,
      mapPosition: { lat: 52.3190, lng: 10.5700, label: "Final Runway 26" },
      phase: "circuit"
    },
    {
      id: 40,
      type: "message",
      role: "tower",
      textEn: "D-AH, wind 230 degrees 4 knots, runway 26 cleared to land.",
      textDe: "D-AH, Wind 230 Grad 4 Knoten, Piste 26 Landung frei.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 400,
      mapPosition: { lat: 52.3192, lng: 10.5698, label: "Final Runway 26" },
      phase: "circuit"
    },
    {
      id: 41,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Landefreigabe für Piste 26.",
      promptEn: "Acknowledge landing clearance for runway 26.",
      textEn: "Runway 26 cleared to land, D-AH.",
      textDe: "Piste 26 Landung frei, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 200,
      mapPosition: { lat: 52.3192, lng: 10.5698, label: "Touchdown Runway 26" },
      phase: "circuit"
    },
    {
      id: 42,
      type: "message",
      role: "tower",
      textEn: "D-AH, vacate runway via D, taxi to apron in front of the terminal via D and C.",
      textDe: "D-AH, verlassen Sie Piste über D, rollen Sie zur Abstellfläche vor dem Terminal über D und C.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3192, lng: 10.5420, label: "Landed, Rolling out" },
      phase: "ground"
    },
    {
      id: 43,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Verlassen über D und den Rollweg via D und C zum Terminal-Apron.",
      promptEn: "Acknowledge vacating runway via D and taxiing to apron via D and C.",
      textEn: "Vacate runway via D, taxi to apron in front of terminal via D and C, D-AH.",
      textDe: "Verlasse Piste über D, rolle zur Abstellfläche vor dem Terminal über D und C, D-AH.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3196, lng: 10.5500, label: "Taxiing via D & C" },
      phase: "ground"
    },
    {
      id: 44,
      type: "message",
      role: "pilot",
      promptDe: "Melde dich von der Frequenz ab, nachdem du die Parkposition erreicht hast.",
      promptEn: "Report leaving the frequency after parking.",
      textEn: "D-AH, leaving frequency.",
      textDe: "D-AH, verlasse die Frequenz.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3197, lng: 10.5562, label: "GAT Parked" },
      phase: "ground"
    },
    {
      id: 45,
      type: "message",
      role: "tower",
      textEn: "D-AH, roger.",
      textDe: "D-AH, verstanden.",
      frequency: "125.265",
      squawk: "7000",
      altitude: 276,
      mapPosition: { lat: 52.3197, lng: 10.5562, label: "GAT Parked" },
      phase: "ground"
    }
  ]
};

// 5. Create Stuttgart (#5)
const stuttgart = {
  id: "stuttgart",
  title: "#5 Stuttgart",
  steps: [
    {
      id: 1,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Stuttgart Delivery für Anlassfreigabe (Erstkontakt).",
      promptEn: "Call Stuttgart Delivery for startup (initial call).",
      textEn: "Stuttgart Delivery, D-EPAH.",
      textDe: "Stuttgart Delivery, D-EPAH.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 2,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Stuttgart Delivery.",
      textDe: "D-EPAH, Stuttgart Delivery.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 3,
      type: "message",
      role: "pilot",
      promptDe: "Nenne deine Position (GA Apron 3), dein Flugzeugmuster (P28A), deine Absicht (VFR über OSCAR) mit Info PAPA und erbitte Anlassfreigabe.",
      promptEn: "Report position (GA Apron 3), type (P28A), VFR via OSCAR with Info PAPA and request startup.",
      textEn: "D-EPAH, P28A, general aviation apron 3, VFR via OSCAR, information PAPA, request start up.",
      textDe: "D-EPAH, P28A, Abstellfläche allgemeine Luftfahrt 3, VFR über OSCAR, Information PAPA, erbitte anlassen.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 4,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, start up approved.",
      textDe: "D-EPAH, anlassen genehmigt.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 5,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Anlassfreigabe.",
      promptEn: "Acknowledge startup approved.",
      textEn: "Startup approved, D-EPAH.",
      textDe: "Anlassen genehmigt, D-EPAH.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 6,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, after start up contact Stuttgart Ground 118.605.",
      textDe: "D-EPAH, rufen Sie nach Anlassen Stuttgart Rollkontrolle auf 118.605.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 7,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Frequenzwechsel nach dem Anlassen zu Ground auf 118.605.",
      promptEn: "Acknowledge frequency change to Ground 118.605 after startup.",
      textEn: "After start up 118.605, D-EPAH.",
      textDe: "Nach anlassen 118.605, D-EPAH.",
      frequency: "126.125",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 (EDDS)" },
      phase: "ground"
    },
    {
      id: 8,
      type: "instruction",
      textEn: "Tune in new frequency on the radio (Stuttgart Ground 118.605)",
      textDe: "neue Frequenz einrasten (Stuttgart Ground 118.605)"
    },
    {
      id: 9,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Stuttgart Ground (Rollkontrolle) und erbitte Rollfreigabe (request taxi).",
      promptEn: "Call Stuttgart Ground and request taxi.",
      textEn: "Stuttgart Ground, D-EPAH, request taxi.",
      textDe: "Stuttgart Rollkontrolle, D-EPAH, erbitte rollen.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3" },
      phase: "ground"
    },
    {
      id: 10,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Stuttgart Ground, taxi to holding point runway 07 via EXIT 3, N and K.",
      textDe: "D-EPAH, Stuttgart Rollkontrolle, rollen Sie zum Rollhalt Piste 07 über EXIT 3, N und K.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3" },
      phase: "ground"
    },
    {
      id: 11,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Rollanweisung zum Rollhalt der Piste 07 über EXIT 3, N und K.",
      promptEn: "Acknowledge taxi instructions to holding point runway 07 via EXIT 3, N and K.",
      textEn: "Taxi to holding point runway 07 via EXIT 3, N and K, D-EPAH.",
      textDe: "Rolle zum Rollhalt Piste 07 über EXIT 3, N und K, D-EPAH.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6910, lng: 9.2210, label: "Taxiing via EXIT 3" },
      phase: "ground"
    },
    {
      id: 12,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, hold position, Boeing 757 crossing ahead.",
      textDe: "D-EPAH, halten Sie Position, Boeing 757 kreuzt vor Ihnen.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6890, lng: 9.2150, label: "Hold Position on N" },
      phase: "ground"
    },
    {
      id: 13,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Halten der Position.",
      promptEn: "Acknowledge holding position.",
      textEn: "Holding position, D-EPAH.",
      textDe: "Halte Position, D-EPAH.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6890, lng: 9.2150, label: "Hold Position on N" },
      phase: "ground"
    },
    {
      id: 14,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, advise able to depart from runway 07 intersection H?",
      textDe: "D-EPAH, ist Abflug von Piste 07 Rollbahneinmündung H möglich?",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6890, lng: 9.2150, label: "Holding on N" },
      phase: "ground"
    },
    {
      id: 15,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du bereit/fähig bist für einen Abflug von Einmündung H.",
      promptEn: "Confirm you are able for departure from intersection H.",
      textEn: "Affirm, D-EPAH.",
      textDe: "Positiv, D-EPAH.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6890, lng: 9.2150, label: "Holding on N" },
      phase: "ground"
    },
    {
      id: 16,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, turn left into S, taxi to holding point runway 07 intersection H via S and H, when ready for departure contact Stuttgart Tower 119.055.",
      textDe: "D-EPAH, drehen Sie links auf S, rollen Sie zum Rollhalt Piste 07 Rollbahneinmündung H über S und H, wenn Abflugbereit rufen Sie Stuttgart Turm 119.055.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6890, lng: 9.2150, label: "Holding on N" },
      phase: "ground"
    },
    {
      id: 17,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Linksabbiegung in S, das Rollen zur Kreuzung H via S und H sowie den Frequenzwechsel bei Abflugbereitschaft auf 119.055.",
      promptEn: "Acknowledge turning left into S, taxi to holding point intersection H via S and H, and contacting Tower on 119.055 when ready.",
      textEn: "Turning left into S, taxi to holding point runway 07 intersection H via S and H, when ready for departure 119.055, D-EPAH.",
      textDe: "Drehe links auf S, rolle zum Rollhalt Piste 07 Rollbahneinmündung H über S und H, wenn abflugbereit 119.055, D-EPAH.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6875, lng: 9.2100, label: "Holding Point Intersection H" },
      phase: "ground"
    },
    {
      id: 18,
      type: "instruction",
      textEn: "Tune in Stuttgart Tower on the radio (119.055)",
      textDe: "auf Stuttgart Turm verbinden (119.055)"
    },
    {
      id: 19,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Stuttgart Tower abflugbereit am Rollhalt.",
      promptEn: "Call Stuttgart Tower and report ready for departure at the holding point.",
      textEn: "Stuttgart Tower, D-EPAH, holding point runway 07, ready for departure.",
      textDe: "Stuttgart Turm, D-EPAH, Rollhalt Piste 07, abflugbereit.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6875, lng: 9.2100, label: "Holding Point Intersection H" },
      phase: "ground"
    },
    {
      id: 20,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Stuttgart Tower, are you ready for immediate departure?",
      textDe: "D-EPAH, Stuttgart Turm, sind Sie bereit zum Sofortabflug?",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6875, lng: 9.2100, label: "Holding Point Intersection H" },
      phase: "ground"
    },
    {
      id: 21,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Bereitschaft für einen sofortigen Abflug.",
      promptEn: "Confirm ready for immediate departure.",
      textEn: "Affirm, ready for immediate departure, D-EPAH.",
      textDe: "Positiv, bereit zum Sofortabflug, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6875, lng: 9.2100, label: "Holding Point Intersection H" },
      phase: "ground"
    },
    {
      id: 22,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, leave control zone via OSCAR, right turn approved, wind 050 degrees 6 knots, runway 07 cleared for takeoff.",
      textDe: "D-EPAH, verlassen Sie Kontrollzone über OSCAR, Rechtskurve genehmigt, Wind 050 Grad 6 Knoten, Piste 07 start frei.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6875, lng: 9.2100, label: "Holding Point Intersection H" },
      phase: "ground"
    },
    {
      id: 23,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Abflugroute über OSCAR, die Rechtskurve und die Startfreigabe für Piste 07.",
      promptEn: "Acknowledge leaving via OSCAR, right turn approved and takeoff clearance runway 07.",
      textEn: "Will leave control zone via OSCAR, right turn approved, runway 07 cleared for takeoff, D-EPAH.",
      textDe: "Werde Kontrollzone über OSCAR verlassen, Rechtskurve genehmigt, Piste 07 start frei, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1400,
      mapPosition: { lat: 48.6890, lng: 9.2180, label: "Takeoff Runway 07" },
      phase: "departure"
    },
    {
      id: 24,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Meldepunkts OSCAR in deiner aktuellen Höhe (3000 Fuß).",
      promptEn: "Report passing OSCAR at 3000 feet.",
      textEn: "D-EPAH, OSCAR at 3000 feet.",
      textDe: "D-EPAH, OSCAR in 3000 Fuß.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3000,
      mapPosition: { lat: 48.6200, lng: 9.1500, label: "OSCAR (3000 ft)" },
      phase: "departure"
    },
    {
      id: 25,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, approved to leave frequency.",
      textDe: "D-EPAH, verlassen der Frequenz genehmigt.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3000,
      mapPosition: { lat: 48.6200, lng: 9.1500, label: "OSCAR (3000 ft)" },
      phase: "departure"
    },
    {
      id: 26,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Freigabe zum Verlassen der Frequenz.",
      promptEn: "Acknowledge frequency release.",
      textEn: "Approved to leave frequency, D-EPAH.",
      textDe: "Verlassen der Frequenz genehmigt, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3000,
      mapPosition: { lat: 48.6000, lng: 9.1000, label: "VFR Cruise (Outside CTR)" },
      phase: "cruise"
    },
    {
      id: 27,
      type: "instruction",
      textEn: "Prepare for arrival at Stuttgart, tune back to Tower frequency (119.055)",
      textDe: "neuer Anflug auf Stuttgart vorbereiten, zurück auf Tower Frequenz (119.055)"
    },
    {
      id: 28,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Stuttgart Tower für den Einflugsruf der Landung.",
      promptEn: "Call Stuttgart Tower for landing entry (initial call).",
      textEn: "Stuttgart Tower, D-EPAH.",
      textDe: "Stuttgart Turm, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7600, lng: 9.4000, label: "5 NM North of ECHO" },
      phase: "approach"
    },
    {
      id: 29,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Stuttgart Tower.",
      textDe: "D-EPAH, Stuttgart Turm.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7600, lng: 9.4000, label: "5 NM North of ECHO" },
      phase: "approach"
    },
    {
      id: 30,
      type: "message",
      role: "pilot",
      promptDe: "Melde deinen Typ (P28A), Position (5 Minuten nördlich von ECHO) in 3400 Fuß mit Info SIERRA und bitte um touch-and-go.",
      promptEn: "Report type (P28A), position (5 minutes north of ECHO) at 3400 feet with Info SIERRA and request touch-and-go.",
      textEn: "D-EPAH, P28A, VFR, 5 minutes north of ECHO at 3400 feet, information SIERRA, for touch and go.",
      textDe: "D-EPAH, P28A, VFR 5 Minuten nördlich von ECHO in 3400 Fuß, Information SIERRA, zum Aufsetzen und Durchstarten.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7600, lng: 9.4000, label: "5 NM North of ECHO" },
      phase: "approach"
    },
    {
      id: 31,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, enter control zone via ECHO, runway 07, QNH 1005.",
      textDe: "D-EPAH, fliegen Sie in Kontrollzone über ECHO, Piste 07, QNH 1005.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7600, lng: 9.4000, label: "5 NM North of ECHO" },
      phase: "approach"
    },
    {
      id: 32,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Einflug über ECHO, die Piste 07 und QNH 1005.",
      promptEn: "Acknowledge entering control zone via ECHO for runway 07, QNH 1005.",
      textEn: "Will enter control zone via ECHO, runway 07, QNH 1005, D-EPAH.",
      textDe: "Werde in Kontrollzone über ECHO fliegen, Piste 07, QNH 1005, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7300, lng: 9.4000, label: "Flying direct ECHO" },
      phase: "approach"
    },
    {
      id: 33,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen von ECHO in 3400 Fuß.",
      promptEn: "Report passing ECHO at 3400 feet.",
      textEn: "D-EPAH, ECHO at 3400 feet.",
      textDe: "D-EPAH, ECHO in 3400 Fuß.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7100, lng: 9.4000, label: "ECHO (3400 ft)" },
      phase: "approach"
    },
    {
      id: 34,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, join base runway 07, report base.",
      textDe: "D-EPAH, fliegen Sie direkt in den Queranflug Piste 07, melden Sie Queranflug.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 3400,
      mapPosition: { lat: 48.7100, lng: 9.4000, label: "ECHO (3400 ft)" },
      phase: "approach"
    },
    {
      id: 35,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Einflug in den Queranflug der Piste 07 und die Anweisung, den Queranflug zu melden.",
      promptEn: "Acknowledge joining base runway 07 and reporting base leg.",
      textEn: "Will join base runway 07, wilco, D-EPAH.",
      textDe: "Fliege direkt in den Queranflug Piste 07, wilco, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 48.6970, lng: 9.2010, label: "Left Base Runway 07" },
      phase: "approach"
    },
    {
      id: 36,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Queranflugs.",
      promptEn: "Report on base leg for runway 07.",
      textEn: "D-EPAH, base runway 07.",
      textDe: "D-EPAH, Queranflug Piste 07.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1500,
      mapPosition: { lat: 48.6970, lng: 9.2010, label: "Left Base Runway 07" },
      phase: "approach"
    },
    {
      id: 37,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, after touch and go join traffic circuit runway 07, report downwind, wind 050 degrees 6 knots, runway 07 cleared for touch and go.",
      textDe: "D-EPAH, nach Aufsetzen und Durchstarten fliegen Sie in die Platzrunde Piste 07, melden Sie Gegenanflug, Wind 050 Grad 6 Knoten, Piste 07 frei für Aufsetzen und Durchstarten.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1000,
      mapPosition: { lat: 48.6860, lng: 9.2010, label: "Final Runway 07" },
      phase: "approach"
    },
    {
      id: 38,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du nach dem touch-and-go in die Platzrunde einfliegen und den Gegenanflug melden wirst, sowie die touch-and-go Freigabe für Piste 07.",
      promptEn: "Acknowledge joining traffic circuit after touch-and-go, reporting downwind and touch-and-go clearance runway 07.",
      textEn: "After touch and go will join traffic circuit runway 07, wilco, runway 07 cleared for touch and go, D-EPAH.",
      textDe: "Werde nach Aufsetzen und Durchstarten in Platzrunde Piste 07 fliegen, wilco, Piste 07 frei für Aufsetzen und Durchstarten, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6910, lng: 9.2270, label: "Touch & Go Runway 07" },
      phase: "circuit"
    },
    {
      id: 39,
      type: "message",
      role: "pilot",
      promptDe: "Melde dich im Gegenanflug der Piste 07 zur Abschlusslandung (full stop).",
      promptEn: "Report on downwind runway 07 for a full stop landing.",
      textEn: "D-EPAH, downwind runway 07, for full stop landing.",
      textDe: "D-EPAH, Gegenanflug Piste 07, zur Abschlusslandung.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 48.7010, lng: 9.2220, label: "Downwind Runway 07" },
      phase: "circuit"
    },
    {
      id: 40,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, number 2, follow Eurowings Airbus 320 on final runway 07, report traffic in sight, caution wake turbulence.",
      textDe: "D-EPAH, Nummer 2, folgen Sie Eurowings Airbus 320 im Endanflug Piste 07, melden Sie Verkehr in Sicht, Achtung Wirbelschleppen.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 48.7010, lng: 9.2220, label: "Downwind Runway 07" },
      phase: "circuit"
    },
    {
      id: 41,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du dem Eurowings Airbus A320 folgst und du den Verkehr in Sicht hast.",
      promptEn: "Acknowledge following Eurowings Airbus A320, traffic in sight.",
      textEn: "Roger, will follow Eurowings Airbus 320, traffic in sight, D-EPAH.",
      textDe: "Verstanden, Folge Eurowings Airbus A320, Verkehr in Sicht, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1800,
      mapPosition: { lat: 48.6970, lng: 9.2010, label: "Base Turn behind A320" },
      phase: "circuit"
    },
    {
      id: 42,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, wind 050 degrees 6 knots, runway 07 cleared to land.",
      textDe: "D-EPAH, Wind 050 Grad 6 Knoten, Piste 07 Landung frei.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 800,
      mapPosition: { lat: 48.6860, lng: 9.2010, label: "Final Runway 07 behind A320" },
      phase: "circuit"
    },
    {
      id: 43,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Landefreigabe für Piste 07.",
      promptEn: "Acknowledge landing clearance runway 07.",
      textEn: "Runway 07 cleared to land, D-EPAH.",
      textDe: "Piste 07 Landung frei, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 500,
      mapPosition: { lat: 48.6860, lng: 9.2010, label: "Final Runway 07" },
      phase: "circuit"
    },
    {
      id: 44,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, vacate runway via E and contact Stuttgart Ground on 118.605.",
      textDe: "D-EPAH, verlassen Sie Piste über ECHO und rufen Sie Stuttgart Rollkontrolle 118.605.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2300, label: "Landed, Runway Vacated via E" },
      phase: "ground"
    },
    {
      id: 45,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Verlassen der Landebahn über ECHO und den Frequenzwechsel zu Ground auf 118.605.",
      promptEn: "Acknowledge runway vacated via ECHO and frequency change to Ground 118.605.",
      textEn: "118.605, D-EPAH.",
      textDe: "118.605, D-EPAH.",
      frequency: "119.055",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2300, label: "Landed, Runway Vacated via E" },
      phase: "ground"
    },
    {
      id: 46,
      type: "instruction",
      textEn: "Tune in Ground frequency on the radio (Stuttgart Ground 118.605)",
      textDe: "Stuttgart Ground einrasten (Stuttgart Ground 118.605)"
    },
    {
      id: 47,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Stuttgart Ground. Melde das Verlassen der Landebahn und erbitte Rollfreigabe zum GAT.",
      promptEn: "Call Stuttgart Ground. Report runway vacated and request taxi to GAT.",
      textEn: "Stuttgart Ground, D-EPAH, request taxi to GAT.",
      textDe: "Stuttgart Rollkontrolle, D-EPAH, erbitte rollen zum GAT.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2300, label: "Vacated at ECHO" },
      phase: "ground"
    },
    {
      id: 48,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Stuttgart Ground, taxi to general aviation apron 3 via E, N and EXIT 3, report leaving frequency.",
      textDe: "D-EPAH, Stuttgart Rollkontrolle, rollen Sie zur Abstellfläche allgemeine Luftfahrt 3 über E, N und EXIT 3, melden Sie verlassen der Frequenz.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2300, label: "Vacated at ECHO" },
      phase: "ground"
    },
    {
      id: 49,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Rollanweisung zur Abstellfläche GA Apron 3 über E, N und EXIT 3.",
      promptEn: "Acknowledge taxi routing to GA apron 3 via E, N and EXIT 3.",
      textEn: "Will taxi to general aviation apron 3 via E, N and EXIT 3, wilco, D-EPAH.",
      textDe: "Rolle zur Abstellfläche allgemeine Luftfahrt 3 über E, N und EXIT 3, wilco, D-EPAH.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6910, lng: 9.2210, label: "Taxiing via E, N & EXIT 3" },
      phase: "ground"
    },
    {
      id: 50,
      type: "message",
      role: "pilot",
      promptDe: "Melde dich von der Frequenz ab, nachdem du die Parkposition erreicht hast.",
      promptEn: "Report leaving the frequency after parking.",
      textEn: "D-EPAH, leaving frequency.",
      textDe: "D-EPAH, verlasse die Frequenz.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 Parked" },
      phase: "ground"
    },
    {
      id: 51,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, roger.",
      textDe: "D-EPAH, verstanden.",
      frequency: "118.605",
      squawk: "7000",
      altitude: 1276,
      mapPosition: { lat: 48.6920, lng: 9.2200, label: "GA Apron 3 Parked" },
      phase: "ground"
    }
  ]
};

// 6. Create Berlin (#6)
const berlin = {
  id: "berlin",
  title: "#6 Berlin",
  steps: [
    {
      id: 1,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Berlin Delivery für die Abfluginformationen (Erstkontakt).",
      promptEn: "Call Berlin Delivery (initial call).",
      textEn: "Berlin Delivery, D-EPAH.",
      textDe: "Berlin Delivery, D-EPAH.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 2,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Berlin Delivery.",
      textDe: "D-EPAH, Berlin Delivery.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 3,
      type: "message",
      role: "pilot",
      promptDe: "Nenne deine Position (Apron 4 GAT), dein Flugzeugmuster (P28A), deine Absicht (VFR über NOVEMBER) und erbitte Abfluginformationen.",
      promptEn: "Report position (Apron 4 GAT), type (P28A), VFR via NOVEMBER and request departure information.",
      textEn: "D-EPAH, P28A, on Apron 4 GAT, VFR via NOVEMBER, request departure information.",
      textDe: "D-EPAH, P28A, auf Apron 4 GAT, VFR über NOVEMBER, erbitte Abfluginformation.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 4,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, runway 25R, wind 260 degrees 5 knots, temperature 8, dew point 5, QNH 1015.",
      textDe: "D-EPAH, Piste 25R, Wind 260 Grad 5 Knoten, Temperatur 8, Taupunkt 5, QNH 1015.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 5,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Piste (25R) und das QNH (1015).",
      promptEn: "Acknowledge runway (25R) and QNH (1015).",
      textEn: "Roger, Runway 25R, QNH 1015, D-EPAH.",
      textDe: "Verstanden, Piste 25R, QNH 1015, D-EPAH.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 6,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, contact Berlin Ground 129.505.",
      textDe: "D-EPAH, rufen Sie Berlin Rollkontrolle 129.505.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 7,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Frequenzwechsel zu Ground auf 129.505.",
      promptEn: "Acknowledge frequency change to Berlin Ground 129.505.",
      textEn: "129.505, D-EPAH.",
      textDe: "129.505, D-EPAH.",
      frequency: "121.600",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 (EDDB)" },
      phase: "ground"
    },
    {
      id: 8,
      type: "instruction",
      textEn: "Call Berlin Ground now on the radio (129.505)",
      textDe: "nun bei Berlin Ground melden (129.505)"
    },
    {
      id: 9,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Berlin Ground (Rollkontrolle) und erbitte Rollfreigabe.",
      promptEn: "Call Berlin Ground and request taxi.",
      textEn: "Berlin Ground, D-EPAH, request taxi.",
      textDe: "Berlin Rollkontrolle, D-EPAH, erbitte rollen.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4" },
      phase: "ground"
    },
    {
      id: 10,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Berlin Ground, taxi to holding point runway 25R via C and L7, follow the follow me car.",
      textDe: "D-EPAH, Berlin Rollkontrolle, rollen Sie zum Rollhalt Piste 25R über C und L7, folgen Sie dem “follow me” Auto.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4" },
      phase: "ground"
    },
    {
      id: 11,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Rollanweisung zum Rollhalt der Piste 25R via C und L7 sowie das Folgen des Follow-me-Cars.",
      promptEn: "Acknowledge taxi routing to runway 25R via C and L7, following follow-me car.",
      textEn: "Taxi to holding point runway 25R via C and L7, will follow the follow me car, D-EPAH.",
      textDe: "Rolle zum Rollhalt Piste 25R über C und L7, werde dem Follow Me folgen, D-EPAH.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3800, lng: 13.5300, label: "Taxiing via C and L7" },
      phase: "ground"
    },
    {
      id: 12,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, when ready for departure contact Berlin Tower 120.030.",
      textDe: "D-EPAH, wenn abflugbereit rufen Sie Berlin Turm 120.030.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Holding Point Runway 25R" },
      phase: "ground"
    },
    {
      id: 13,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige, dass du dich bei Abflugbereitschaft bei Tower auf 120.030 meldest.",
      promptEn: "Acknowledge contacting Tower on 120.030 when ready.",
      textEn: "When ready for departure, 120.030, D-EPAH.",
      textDe: "Wenn abflugbereit, 120.030, D-EPAH.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Holding Point Runway 25R" },
      phase: "ground"
    },
    {
      id: 14,
      type: "instruction",
      textEn: "Tune in Tower frequency on the radio (Berlin Tower 120.030)",
      textDe: "auf Berlin Tower 120.030 schalten"
    },
    {
      id: 15,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Berlin Tower und melde dich abflugbereit am Rollhalt.",
      promptEn: "Call Berlin Tower and report ready for departure at the holding point.",
      textEn: "Berlin Tower, D-EPAH, holding point runway 25R, ready for departure.",
      textDe: "Berlin Turm, D-EPAH, Rollhalt Piste 25R, abflugbereit.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Holding Point Runway 25R" },
      phase: "ground"
    },
    {
      id: 16,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Berlin Tower, report landing Boeing 737 800 in sight.",
      textDe: "D-EPAH, Berlin Turm, melden Sie Landung Boeing 737 800 in Sicht.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Holding Point Runway 25R" },
      phase: "ground"
    },
    {
      id: 17,
      type: "message",
      role: "pilot",
      promptDe: "Melde, dass du die landende Boeing 737-800 in Sicht hast.",
      promptEn: "Report landing Boeing 737-800 in sight.",
      textEn: "Landing Boeing 737 800 in sight, D-EPAH.",
      textDe: "Landung Boeing 737 800 in Sicht, D-EPAH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Holding Point, B737 in Sight" },
      phase: "ground"
    },
    {
      id: 18,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, behind landing Boeing 737 800 line up runway 25R behind.",
      textDe: "D-EPAH, hinter landender Boeing 737 800 rollen Sie zum Abflugpunkt Piste 25R dahinter.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Holding Point, B737 in Sight" },
      phase: "ground"
    },
    {
      id: 19,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Aufrollen auf Piste 25R hinter der landenden Boeing.",
      promptEn: "Acknowledge lining up runway 25R behind landing Boeing.",
      textEn: "Behind Boeing 737 800 line up runway 25R behind, D-EPAH.",
      textDe: "Rolle hinter landender Boeing 737 800 zum Abflugpunkt Piste 25R, D-EPAH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5350, label: "Lining Up behind B737" },
      phase: "ground"
    },
    {
      id: 20,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, leave control zone via NOVEMBER, right turn approved, wind 260 degrees 5 knots, runway 25R cleared for take off.",
      textDe: "D-EPAH, verlassen Sie Kontrollzone über NOVEMBER, Rechtskurve genehmigt, Wind 260 Grad 5 Knoten, Piste 25R start frei.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3780, lng: 13.5300, label: "Runway 25R Lineup" },
      phase: "ground"
    },
    {
      id: 21,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Route über NOVEMBER, die Rechtskurve und die Startfreigabe für Piste 25R.",
      promptEn: "Acknowledge leaving via NOVEMBER, right turn approved and takeoff clearance runway 25R.",
      textEn: "Will leave control zone via NOVEMBER, right turn approved, runway 25R cleared for take off, D-EPAH.",
      textDe: "Werde Kontrollzone über NOVEMBER verlassen, Rechtskurve genehmigt, Piste 25R Start frei, D-EPAH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 400,
      mapPosition: { lat: 52.3750, lng: 13.5150, label: "Takeoff Runway 25R" },
      phase: "departure"
    },
    {
      id: 22,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen von NOVEMBER in deiner aktuellen Höhe (2200 Fuß).",
      promptEn: "Report passing NOVEMBER at 2200 feet.",
      textEn: "D-EPAH, NOVEMBER at 2200 feet.",
      textDe: "D-EPAH, NOVEMBER in 2200 Fuß.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.4500, lng: 13.5200, label: "NOVEMBER (2200 ft)" },
      phase: "departure"
    },
    {
      id: 23,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, approved to leave frequency.",
      textDe: "D-EPAH, verlassen der Frequenz genehmigt.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.4500, lng: 13.5200, label: "NOVEMBER (2200 ft)" },
      phase: "departure"
    },
    {
      id: 24,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Verlassen der Frequenz.",
      promptEn: "Acknowledge leaving frequency.",
      textEn: "Approved to leave frequency, D-EPAH.",
      textDe: "Verlassen der Frequenz genehmigt, D-EPAH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.4600, lng: 13.5200, label: "VFR Cruise (Outside CTR)" },
      phase: "cruise"
    },
    {
      id: 25,
      type: "instruction",
      textEn: "Contact Langen Information now on the radio (125.900)",
      textDe: "jetzt Langen-Information anrufen (125.900)"
    },
    {
      id: 26,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Langen Information (Einleitungsanruf).",
      promptEn: "Call Langen Information (initial call).",
      textEn: "Langen Information, D-EPAH.",
      textDe: "Langen Information, D-EPAH.",
      frequency: "125.900",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.4600, lng: 13.5200, label: "VFR Cruise" },
      phase: "cruise"
    },
    {
      id: 27,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Langen Information.",
      textDe: "D-EPAH, Langen Information.",
      frequency: "125.900",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.4600, lng: 13.5200, label: "VFR Cruise" },
      phase: "cruise"
    },
    {
      id: 28,
      type: "message",
      role: "pilot",
      promptDe: "Melde deinen Typ (P28A), Position (über Berlin) in 2200 Fuß und erbitte Verkehrsinformationen.",
      promptEn: "Report type (P28A), position (overhead Berlin) at 2200 feet and request traffic information.",
      textEn: "D-EPAH, P28A, VFR, overhead Berlin at 2200 feet, request traffic information.",
      textDe: "D-EPAH, P28A, VFR über Berlin in 2200 Fuß, erbitte Verkehrsinformation.",
      frequency: "125.900",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.5200, lng: 13.4000, label: "Overhead Berlin (2200 ft)" },
      phase: "cruise"
    },
    {
      id: 29,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, squawk 7741, QNH 1015.",
      textDe: "D-EPAH, squawk 7741, QNH 1015.",
      frequency: "125.900",
      squawk: "7000",
      altitude: 2200,
      mapPosition: { lat: 52.5200, lng: 13.4000, label: "Overhead Berlin (2200 ft)" },
      phase: "cruise"
    },
    {
      id: 30,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Squawk 7741 und QNH 1015.",
      promptEn: "Acknowledge squawk 7741 and QNH 1015.",
      textEn: "Squawk 7741, QNH 1015, D-EPAH.",
      textDe: "Squawk 7741, QNH 1015, D-EPAH.",
      frequency: "125.900",
      squawk: "7741",
      altitude: 2200,
      mapPosition: { lat: 52.5200, lng: 13.4000, label: "Overhead Berlin (2200 ft)" },
      phase: "cruise"
    },
    {
      id: 31,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, traffic 3 o'clock, 2 miles, Cessna 172, crossing right to left.",
      textDe: "D-EPAH, Verkehr auf 3 Uhr, 2 Meilen, Cessna 172, kreuzt von rechts.",
      frequency: "125.900",
      squawk: "7741",
      altitude: 2200,
      mapPosition: { lat: 52.5200, lng: 13.4000, label: "Overhead Berlin, Traffic reported" },
      phase: "cruise"
    },
    {
      id: 32,
      type: "message",
      role: "pilot",
      promptDe: "Melde, dass du den gemeldeten Verkehr in Sicht hast.",
      promptEn: "Report traffic in sight.",
      textEn: "Traffic in sight, D-EPAH.",
      textDe: "Verkehr in Sicht, D-EPAH.",
      frequency: "125.900",
      squawk: "7741",
      altitude: 2200,
      mapPosition: { lat: 52.5200, lng: 13.4000, label: "Overhead Berlin, Traffic in Sight" },
      phase: "cruise"
    },
    {
      id: 33,
      type: "instruction",
      textEn: "Prepare for arrival at Berlin South, tune back to Berlin Tower (120.030)",
      textDe: "Wieder Berlin anfliegen (Berlin Süd Frequenz 120.030)"
    },
    {
      id: 34,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Berlin Tower für den Einflugsruf der Landung.",
      promptEn: "Call Berlin Tower (initial call).",
      textEn: "Berlin Tower, D-EPAH.",
      textDe: "Berlin Turm, D-EPAH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2200, lng: 13.4800, label: "5 NM South of MIKE" },
      phase: "approach"
    },
    {
      id: 35,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Berlin Tower.",
      textDe: "D-EPAH, Berlin Turm.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2200, lng: 13.4800, label: "5 NM South of MIKE" },
      phase: "approach"
    },
    {
      id: 36,
      type: "message",
      role: "pilot",
      promptDe: "Melde deinen Typ (P28A), Position (5 Minuten südlich von MIKE) in 2000 Fuß mit Info ZULU und bitte um Landefreigabe.",
      promptEn: "Report type (P28A), position (5 minutes south of MIKE) at 2000 feet, Info ZULU and request landing.",
      textEn: "D-EPAH, P28A, VFR, 5 minutes south of MIKE at 2000 feet, Information ZULU, for landing.",
      textDe: "D-EPAH, P28A, VFR 5 Minuten südlich von MIKE in 2000 Fuß, Information Zulu, zur Landung.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2200, lng: 13.4800, label: "5 NM South of MIKE" },
      phase: "approach"
    },
    {
      id: 37,
      type: "message",
      role: "tower",
      textEn: "D-AH, enter control zone via MIKE, runway 25L, QNH 1015.",
      textDe: "D-AH, fliegen Sie in Kontrollzone über MIKE, Piste 25L QNH 1015.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2200, lng: 13.4800, label: "5 NM South of MIKE" },
      phase: "approach"
    },
    {
      id: 38,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Einflug über MIKE, die Piste 25L und QNH 1015.",
      promptEn: "Acknowledge entering control zone via MIKE for runway 25L, QNH 1015.",
      textEn: "Will enter control zone via MIKE, runway 25L, QNH 1015, D-AH.",
      textDe: "Werde in Kontrollzone über MIKE einfliegen, Piste 25L, QNH 1015, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2500, lng: 13.4800, label: "Flying direct MIKE" },
      phase: "approach"
    },
    {
      id: 39,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen von MIKE in 2000 Fuß.",
      promptEn: "Report passing MIKE at 2000 feet.",
      textEn: "D-AH, MIKE at 2000 feet.",
      textDe: "D-AH, MIKE in 2000 Fuß.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2800, lng: 13.4800, label: "MIKE (2000 ft)" },
      phase: "approach"
    },
    {
      id: 40,
      type: "message",
      role: "tower",
      textEn: "D-AH, roger, join traffic circuit runway 25L, report downwind.",
      textDe: "D-AH, verstanden, fliegen Sie in Platzrunde Piste 25L, melden Sie Gegenanflug.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.2800, lng: 13.4800, label: "MIKE (2000 ft)" },
      phase: "approach"
    },
    {
      id: 41,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige den Einflug in die Platzrunde der Piste 25L und dass du den Gegenanflug melden wirst.",
      promptEn: "Acknowledge joining traffic circuit runway 25L and reporting downwind leg.",
      textEn: "Will join traffic circuit runway 25L, wilco, D-AH.",
      textDe: "Werde in Platzrunde Piste 25L einfliegen, wilco, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 2000,
      mapPosition: { lat: 52.3200, lng: 13.4800, label: "Turning to Downwind 25L" },
      phase: "approach"
    },
    {
      id: 42,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Gegenanflugs der Piste 25L.",
      promptEn: "Report passing downwind leg of runway 25L.",
      textEn: "D-AH, downwind runway 25L.",
      textDe: "D-AH, Gegenanflug Piste 25L.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 1500,
      mapPosition: { lat: 52.3450, lng: 13.4950, label: "Downwind Runway 25L" },
      phase: "approach"
    },
    {
      id: 43,
      type: "message",
      role: "tower",
      textEn: "D-AH, shorten downwind, wind 260 degrees 5 knots, runway 25L cleared to land.",
      textDe: "D-AH, verkürzen Sie Gegenanflug, Wind 260 Grad 5 Knoten, Piste 25L Landung frei.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 1200,
      mapPosition: { lat: 52.3450, lng: 13.4950, label: "Downwind Runway 25L" },
      phase: "approach"
    },
    {
      id: 44,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Verkürzen des Gegenanflugs und die Landefreigabe für Piste 25L.",
      promptEn: "Acknowledge shortening downwind leg and landing clearance runway 25L.",
      textEn: "Shortening downwind, runway 25L cleared to land, D-AH.",
      textDe: "Verkürze Gegenanflug, Piste 25L Landung frei, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 800,
      mapPosition: { lat: 52.3520, lng: 13.5200, label: "Short Base Runway 25L" },
      phase: "approach"
    },
    {
      id: 45,
      type: "message",
      role: "pilot",
      promptDe: "Melde, dass du durchstartest (go-around).",
      promptEn: "Report going around.",
      textEn: "D-AH, going around.",
      textDe: "D-AH, starte durch.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 500,
      mapPosition: { lat: 52.3550, lng: 13.5100, label: "Go-Around on Final" },
      phase: "circuit"
    },
    {
      id: 46,
      type: "message",
      role: "tower",
      textEn: "D-AH, roger, make another traffic circuit, report downwind.",
      textDe: "D-AH, verstanden, fliegen Sie eine weitere Platzrunde, melden Sie Gegenanflug.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 800,
      mapPosition: { lat: 52.3550, lng: 13.4800, label: "Climbing on Circuit" },
      phase: "circuit"
    },
    {
      id: 47,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige eine weitere Platzrunde und die Anweisung, den Gegenanflug zu melden.",
      promptEn: "Acknowledge making another traffic circuit and reporting downwind leg.",
      textEn: "Will make another traffic circuit, wilco, D-AH.",
      textDe: "Fliege eine weitere Platzrunde, wilco, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 1500,
      mapPosition: { lat: 52.3450, lng: 13.4950, label: "Downwind Runway 25L (2nd)" },
      phase: "circuit"
    },
    {
      id: 48,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Gegenanflugs der Piste 25L.",
      promptEn: "Report downwind leg runway 25L.",
      textEn: "D-AH, downwind runway 25L.",
      textDe: "D-AH, Gegenanflug Piste 25L.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 1500,
      mapPosition: { lat: 52.3450, lng: 13.4950, label: "Downwind Runway 25L (2nd)" },
      phase: "circuit"
    },
    {
      id: 49,
      type: "message",
      role: "tower",
      textEn: "D-AH, continue approach, report final.",
      textDe: "D-AH, Anflug fortsetzen, melden Sie Endanflug.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 1500,
      mapPosition: { lat: 52.3450, lng: 13.4950, label: "Downwind Runway 25L (2nd)" },
      phase: "circuit"
    },
    {
      id: 50,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Fortsetzen des Anflugs und die Meldung im Endanflug.",
      promptEn: "Acknowledge continuing approach and reporting final leg.",
      textEn: "Will continue approach, wilco, D-AH.",
      textDe: "Setze Anflug fort, wilco, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 1200,
      mapPosition: { lat: 52.3500, lng: 13.5250, label: "Base Runway 25L (2nd)" },
      phase: "circuit"
    },
    {
      id: 51,
      type: "message",
      role: "pilot",
      promptDe: "Melde das Erreichen des Endanflugs der Piste 25L.",
      promptEn: "Report final leg runway 25L.",
      textEn: "D-AH, final runway 25L.",
      textDe: "D-AH, Endanflug Piste 25L.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 800,
      mapPosition: { lat: 52.3620, lng: 13.5250, label: "Final Runway 25L (2nd)" },
      phase: "circuit"
    },
    {
      id: 52,
      type: "message",
      role: "tower",
      textEn: "D-AH, wind 260 degrees 5 knots, runway 25L cleared to land.",
      textDe: "D-AH, Wind 260 Grad 5 Knoten, Piste 25L Landung frei.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 400,
      mapPosition: { lat: 52.3620, lng: 13.5250, label: "Final Runway 25L (2nd)" },
      phase: "circuit"
    },
    {
      id: 53,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Landefreigabe für Piste 25L.",
      promptEn: "Acknowledge landing clearance runway 25L.",
      textEn: "Runway 25L cleared to land, D-AH.",
      textDe: "Piste 25L, Landung frei, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 200,
      mapPosition: { lat: 52.3620, lng: 13.5250, label: "Touchdown Runway 25L" },
      phase: "circuit"
    },
    {
      id: 54,
      type: "message",
      role: "tower",
      textEn: "D-AH, vacate runway via M5, contact Berlin Ground 129.505.",
      textDe: "D-AH, verlassen Sie Piste über M5, rufen Sie Berlin Rollkontrolle 129.505.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3550, lng: 13.4850, label: "Runway Vacated via M5" },
      phase: "ground"
    },
    {
      id: 55,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige das Verlassen der Landebahn über M5 und den Frequenzwechsel zu Ground auf 129.505.",
      promptEn: "Acknowledge vacating runway via M5 and frequency change to Ground 129.505.",
      textEn: "Will vacate runway via M5, 129.505, D-AH.",
      textDe: "Werde Piste über M5 verlassen, 129.505, D-AH.",
      frequency: "120.030",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3550, lng: 13.4850, label: "Runway Vacated via M5" },
      phase: "ground"
    },
    {
      id: 56,
      type: "instruction",
      textEn: "Call Berlin Ground now on the radio (129.505)",
      textDe: "Berlin Ground anfunken (129.505)"
    },
    {
      id: 57,
      type: "message",
      role: "pilot",
      promptDe: "Rufe Berlin Ground. Melde das Verlassen der Piste und erbitte Rollfreigabe zum Apron 4 GAT.",
      promptEn: "Call Berlin Ground. Report runway vacated and request taxi to Apron 4 GAT.",
      textEn: "Berlin Ground, D-EPAH, request taxi to Apron 4 GAT.",
      textDe: "Berlin Rollkontrolle, D-EPAH, erbitte rollen zum Apron 4 GAT.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3550, lng: 13.4850, label: "Vacated via M5" },
      phase: "ground"
    },
    {
      id: 58,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, Berlin Ground, taxi to Apron 4 GAT via M5, T and C, report leaving frequency.",
      textDe: "D-EPAH, Berlin Rollkontrolle, rollen Sie zum Apron 4 GAT über M5, T und C, melden Sie verlassen der Frequenz.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3550, lng: 13.4850, label: "Vacated via M5" },
      phase: "ground"
    },
    {
      id: 59,
      type: "message",
      role: "pilot",
      promptDe: "Bestätige die Rollanweisung zum Apron 4 GAT über M5, T und C.",
      promptEn: "Acknowledge taxi routing to Apron 4 GAT via M5, T and C.",
      textEn: "Will taxi to Apron 4 GAT via M5, T and C, wilco, D-EPAH.",
      textDe: "Werde zum Apron 4 GAT über M5, T und C rollen, wilco, D-EPAH.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3700, lng: 13.5000, label: "Taxiing via M5, T & C" },
      phase: "ground"
    },
    {
      id: 60,
      type: "message",
      role: "pilot",
      promptDe: "Melde dich von der Frequenz ab, nachdem du das GAT erreicht hast.",
      promptEn: "Report leaving the frequency after parking at GAT.",
      textEn: "D-EPAH, leaving frequency.",
      textDe: "D-EPAH, verlasse die Frequenz.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 Parked" },
      phase: "ground"
    },
    {
      id: 61,
      type: "message",
      role: "tower",
      textEn: "D-EPAH, roger.",
      textDe: "D-EPAH, verstanden.",
      frequency: "129.505",
      squawk: "7000",
      altitude: 154,
      mapPosition: { lat: 52.3820, lng: 13.5150, label: "GAT Apron 4 Parked" },
      phase: "ground"
    }
  ]
};

// Add the new simulations if they don't already exist
const index4 = sims.findIndex(s => s.id === 'braunschweig');
if (index4 >= 0) sims[index4] = braunschweig; else sims.push(braunschweig);

const index5 = sims.findIndex(s => s.id === 'stuttgart');
if (index5 >= 0) sims[index5] = stuttgart; else sims.push(stuttgart);

const index6 = sims.findIndex(s => s.id === 'berlin');
if (index6 >= 0) sims[index6] = berlin; else sims.push(berlin);

// Save to JSON file
fs.writeFileSync(simsFile, JSON.stringify(sims, null, 2), 'utf8');
console.log('Successfully updated Sprechfunk Simulations JSON file with all 6 scenarios and coordinates!');
