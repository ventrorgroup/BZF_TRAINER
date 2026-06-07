import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BzfService } from '../../services/bzf.service';
import { animate, style, transition, trigger } from '@angular/animations';

declare const L: any;

interface Step {
  id: number;
  type: 'message' | 'instruction';
  role?: 'pilot' | 'tower';
  promptDe?: string;
  promptEn?: string;
  textDe?: string;
  textEn?: string;
  frequency?: string;
  squawk?: string;
  altitude?: number;
  phase?: 'ground' | 'departure' | 'cruise' | 'approach' | 'circuit' | 'landed';
  mapPosition?: {
    lat: number;
    lng: number;
    label: string;
  };
}

interface Simulation {
  id: string;
  title: string;
  steps: Step[];
}

const AIRPORT_METADATA: Record<string, {
  lat: number;
  lng: number;
  name: string;
  ctrRadiusNm: number;
  runways: { start: [number, number]; end: [number, number]; label: string }[];
  waypoints: { lat: number; lng: number; label: string }[];
}> = {
  "EDDK": {
    lat: 50.8659,
    lng: 7.1427,
    name: "Köln-Bonn (EDDK)",
    ctrRadiusNm: 8,
    runways: [
      { start: [50.8780, 7.1250], end: [50.8540, 7.1600], label: "14L/32R" }
    ],
    waypoints: [
      { lat: 50.9500, lng: 7.1000, label: "NOVEMBER 1" },
      { lat: 50.9100, lng: 7.1200, label: "NOVEMBER 2" },
      { lat: 50.7700, lng: 7.2500, label: "ECHO 1" },
      { lat: 50.8200, lng: 7.2000, label: "ECHO 2" }
    ]
  },
  "EDDH": {
    lat: 53.6304,
    lng: 9.9882,
    name: "Hamburg (EDDH)",
    ctrRadiusNm: 7,
    runways: [
      { start: [53.6210, 9.9720], end: [53.6390, 10.0040], label: "05/23" }
    ],
    waypoints: [
      { lat: 53.5300, lng: 10.0200, label: "SIERRA 1" },
      { lat: 53.5800, lng: 10.0000, label: "SIERRA 2" }
    ]
  },
  "EDDP": {
    lat: 51.4240,
    lng: 12.2361,
    name: "Leipzig/Halle (EDDP)",
    ctrRadiusNm: 8,
    runways: [
      { start: [51.4250, 12.2600], end: [51.4230, 12.2120], label: "08R/26L" }
    ],
    waypoints: [
      { lat: 51.3400, lng: 12.2800, label: "SIERRA 1" },
      { lat: 51.3800, lng: 12.2500, label: "SIERRA 2" }
    ]
  },
  "EDDN": {
    lat: 49.4987,
    lng: 11.0780,
    name: "Nuremberg (EDDN)",
    ctrRadiusNm: 7,
    runways: [
      { start: [49.5000, 11.1000], end: [49.4970, 11.0500], label: "10/28" }
    ],
    waypoints: [
      { lat: 49.5200, lng: 10.9500, label: "WHISKEY 1" },
      { lat: 49.5000, lng: 11.0200, label: "WHISKEY 2" }
    ]
  },
  "EDDV": {
    lat: 52.4602,
    lng: 9.6851,
    name: "Hannover (EDDV)",
    ctrRadiusNm: 8,
    runways: [
      { start: [52.4600, 9.6600], end: [52.4600, 9.7100], label: "09C/27C" },
      { start: [52.4650, 9.6600], end: [52.4650, 9.7100], label: "09L/27R" }
    ],
    waypoints: [
      { lat: 52.4800, lng: 9.5300, label: "WHISKEY 1" },
      { lat: 52.4700, lng: 9.6100, label: "WHISKEY 2" },
      { lat: 52.4450, lng: 10.0080, label: "Burgdorf" }
    ]
  },
  "EDVE": {
    lat: 52.3192,
    lng: 10.5558,
    name: "Braunschweig-Wolfsburg (EDVE)",
    ctrRadiusNm: 5,
    runways: [
      { start: [52.3192, 10.5698], end: [52.3192, 10.5418], label: "08/26" }
    ],
    waypoints: [
      { lat: 52.2600, lng: 10.5600, label: "SIERRA" },
      { lat: 52.3200, lng: 10.7000, label: "ECHO 1" },
      { lat: 52.3200, lng: 10.6200, label: "ECHO 2" }
    ]
  },
  "EDDS": {
    lat: 48.6899,
    lng: 9.2220,
    name: "Stuttgart (EDDS)",
    ctrRadiusNm: 7,
    runways: [
      { start: [48.6860, 9.2010], end: [48.6940, 9.2430], label: "07/25" }
    ],
    waypoints: [
      { lat: 48.6200, lng: 9.1500, label: "OSCAR" },
      { lat: 48.7100, lng: 9.4000, label: "ECHO" }
    ]
  },
  "EDDB": {
    lat: 52.3667,
    lng: 13.5033,
    name: "Berlin Brandenburg (EDDB)",
    ctrRadiusNm: 9,
    runways: [
      { start: [52.3780, 13.5350], end: [52.3680, 13.4800], label: "07L/25R" },
      { start: [52.3620, 13.5250], end: [52.3520, 13.4700], label: "07R/25L" }
    ],
    waypoints: [
      { lat: 52.4500, lng: 13.5200, label: "NOVEMBER" },
      { lat: 52.2800, lng: 13.4800, label: "MIKE" }
    ]
  }
};

@Component({
  selector: 'app-sprechfunk-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sprechfunk-simulation.html',
  styleUrl: './sprechfunk-simulation.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SprechfunkSimulationComponent implements OnInit, OnDestroy {
  @ViewChild('historyContainer') private historyContainer!: ElementRef;

  simulations: Simulation[] = [];
  selectedSimulation: Simulation | null = null;
  currentStepIndex: number = 0;
  revealedSteps: Step[] = [];
  isCurrentStepRevealed: boolean = false;
  language: 'de' | 'en' = 'de';
  loading: boolean = true;
  error: boolean = false;

  // Cockpit Instruments Telemetry
  activeFrequency: string = '';
  activeSquawk: string = '';
  activeAltitude: number = 0;
  activePhase: string = 'ground';
  activePhaseText: string = 'BODEN';

  // Leaflet Map variables
  private map: any = null;
  private planeMarker: any = null;
  private pathLine: any = null;
  private flightCoordinates: [number, number][] = [];

  constructor(private bzfService: BzfService) {}

  ngOnInit() {
    this.loadSimulations();
  }

  ngOnDestroy() {
    this.cleanupMap();
  }

  loadSimulations() {
    this.loading = true;
    this.error = false;
    this.bzfService.getSprechfunkSimulations().subscribe({
      next: (data) => {
        this.simulations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading simulations', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  selectSimulation(sim: Simulation) {
    this.selectedSimulation = sim;
    this.resetSimulation();
    
    // Initialize the Leaflet map after DOM rendering
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  resetSimulation() {
    this.currentStepIndex = 0;
    this.revealedSteps = [];
    this.isCurrentStepRevealed = false;
    this.flightCoordinates = [];
    
    this.advanceAutoSteps();
    this.scrollToBottom();
    
    if (this.map) {
      this.initMap();
    }
  }

  get currentStep(): Step | null {
    if (!this.selectedSimulation) return null;
    if (this.currentStepIndex >= this.selectedSimulation.steps.length) return null;
    return this.selectedSimulation.steps[this.currentStepIndex];
  }

  get isFinished(): boolean {
    if (!this.selectedSimulation) return false;
    return this.currentStepIndex >= this.selectedSimulation.steps.length;
  }

  get progressPercentage(): number {
    if (!this.selectedSimulation) return 0;
    return Math.round((this.currentStepIndex / this.selectedSimulation.steps.length) * 100);
  }

  revealPilotSolution() {
    this.isCurrentStepRevealed = true;
    this.scrollToBottom();
  }

  nextStep() {
    const step = this.currentStep;
    if (!step) return;

    if (step.type === 'message' && step.role === 'pilot') {
      this.revealedSteps.push(step);
      this.currentStepIndex++;
      this.isCurrentStepRevealed = false;
      
      this.advanceAutoSteps();
    } else if (step.type === 'instruction') {
      this.revealedSteps.push(step);
      this.currentStepIndex++;
      
      this.advanceAutoSteps();
    }
    this.scrollToBottom();
    this.updateMapAndCockpit();
  }

  advanceAutoSteps() {
    if (!this.selectedSimulation) return;
    
    while (this.currentStepIndex < this.selectedSimulation.steps.length) {
      const next = this.selectedSimulation.steps[this.currentStepIndex];
      if (next.type === 'message' && next.role === 'tower') {
        this.revealedSteps.push(next);
        this.currentStepIndex++;
      } else {
        break;
      }
    }
    this.scrollToBottom();
    this.updateMapAndCockpit();
  }

  toggleLanguage() {
    this.language = this.language === 'de' ? 'en' : 'de';
  }

  exitSimulation() {
    this.selectedSimulation = null;
    this.cleanupMap();
  }

  // --- LEAFLET MAP IMPLEMENTATION ---
  private initMap() {
    this.cleanupMap();

    const mapElement = document.getElementById('vfr-map-container');
    if (!mapElement || typeof L === 'undefined') return;

    // 1. Identify active airports for this scenario
    const activeAirportCodes: string[] = [];
    const simId = this.selectedSimulation?.id || '';
    
    if (simId === 'koeln-bonn') {
      activeAirportCodes.push('EDDK', 'EDDH');
    } else if (simId === 'leipzig-nuernberg') {
      activeAirportCodes.push('EDDP', 'EDDN');
    } else if (simId === 'hannover') {
      activeAirportCodes.push('EDDV');
    } else if (simId === 'braunschweig') {
      activeAirportCodes.push('EDVE');
    } else if (simId === 'stuttgart') {
      activeAirportCodes.push('EDDS');
    } else if (simId === 'berlin') {
      activeAirportCodes.push('EDDB');
    }

    // 2. Initialize map focusing on first airport
    const firstCode = activeAirportCodes[0] || 'EDDK';
    const center = AIRPORT_METADATA[firstCode] || { lat: 51.0, lng: 10.0 };

    this.map = L.map('vfr-map-container', {
      zoomControl: true,
      fadeAnimation: true
    }).setView([center.lat, center.lng], 12);

    // 3. Add OpenStreetMap Base Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // 4. Add OpenFlightMaps Aeronautical Overlay Cycle snapshot (2606 or live fallback)
    L.tileLayer('https://snapshots.openflightmaps.org/live/2606/tiles/world/noninteractive/epsg3857/aero/{z}/{x}/{y}.png', {
      maxZoom: 11,
      opacity: 0.7,
      attribution: '&copy; open flightmaps'
    }).addTo(this.map);

    // 5. Draw CTR Boundaries, runways and VFR waypoints for all active airports
    const mapBounds = L.latLngBounds([]);

    activeAirportCodes.forEach(code => {
      const meta = AIRPORT_METADATA[code];
      if (!meta) return;

      const airportLatLng = L.latLng(meta.lat, meta.lng);
      mapBounds.extend(airportLatLng);

      // Draw dashed red Control Zone (CTR)
      const ctrRadiusMeters = meta.ctrRadiusNm * 1852;
      L.circle([meta.lat, meta.lng], {
        radius: ctrRadiusMeters,
        color: '#ef4444',
        weight: 2,
        dashArray: '5, 8',
        fillColor: '#ef4444',
        fillOpacity: 0.05
      }).addTo(this.map).bindTooltip(`CTR ${meta.name} (Airspace D)`, { sticky: true });

      // Draw Runways (Blue lines)
      meta.runways.forEach(rwy => {
        const line = L.polyline([rwy.start, rwy.end], {
          color: '#1e40af',
          weight: 6,
          opacity: 0.8
        }).addTo(this.map).bindTooltip(`Rwy ${rwy.label}`, { permanent: false });
      });

      // Draw VFR Reporting Points (Filled orange circles with labels)
      meta.waypoints.forEach(wp => {
        const wpLatLng = L.latLng(wp.lat, wp.lng);
        mapBounds.extend(wpLatLng);

        L.circleMarker([wp.lat, wp.lng], {
          radius: 8,
          color: '#f59e0b',
          weight: 2,
          fillColor: '#ffffff',
          fillOpacity: 1
        }).addTo(this.map)
          .bindTooltip(wp.label, { permanent: true, direction: 'top', className: 'vfr-wp-label' });
      });
      
      // Draw Airport Marker
      L.circleMarker([meta.lat, meta.lng], {
        radius: 6,
        color: '#1e3a8a',
        fillColor: '#60a5fa',
        fillOpacity: 1
      }).addTo(this.map).bindTooltip(meta.name, { permanent: false });
    });

    // Fit map bounds to show active entities
    if (activeAirportCodes.length > 1) {
      this.map.fitBounds(mapBounds, { padding: [50, 50] });
    } else {
      this.map.setView([center.lat, center.lng], 12);
    }

    // 6. Draw Aircraft Marker (Pulsing blue icon)
    const pulsingPlaneIcon = L.divIcon({
      className: 'pulsing-plane-icon-container',
      html: '<div class="pulsing-core"></div><div class="pulsing-ring"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.planeMarker = L.marker([center.lat, center.lng], { icon: pulsingPlaneIcon }).addTo(this.map);

    // 7. Initialize flight path polyline
    this.pathLine = L.polyline([], {
      color: '#3b82f6',
      weight: 4,
      dashArray: '5, 5',
      opacity: 0.8
    }).addTo(this.map);
  }

  private cleanupMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.planeMarker = null;
    this.pathLine = null;
  }

  private updateMapAndCockpit() {
    // Determine the active step (last in revealed list)
    const activeStep = this.revealedSteps.length > 0 
      ? this.revealedSteps[this.revealedSteps.length - 1] 
      : null;

    if (!activeStep) {
      // Default initial states
      this.activeFrequency = this.selectedSimulation?.steps[0]?.frequency || '---.---';
      this.activeSquawk = this.selectedSimulation?.steps[0]?.squawk || '7000';
      this.activeAltitude = this.selectedSimulation?.steps[0]?.altitude || 0;
      this.activePhase = this.selectedSimulation?.steps[0]?.phase || 'ground';
      this.activePhaseText = this.getPhaseGermanLabel(this.activePhase);
      return;
    }

    // 1. Update Cockpit attributes
    if (activeStep.frequency) this.activeFrequency = activeStep.frequency;
    if (activeStep.squawk) this.activeSquawk = activeStep.squawk;
    if (activeStep.altitude !== undefined) this.activeAltitude = activeStep.altitude;
    if (activeStep.phase) {
      this.activePhase = activeStep.phase;
      this.activePhaseText = this.getPhaseGermanLabel(this.activePhase);
    }

    // 2. Update Map Position
    if (activeStep.mapPosition && this.map && this.planeMarker) {
      const pos = activeStep.mapPosition;
      
      // Move airplane marker
      this.planeMarker.setLatLng([pos.lat, pos.lng]);
      this.planeMarker.bindTooltip(`D-EPAH (${pos.label})`, { permanent: false });

      // Add coordinate to track if it's new
      const lastCoord = this.flightCoordinates[this.flightCoordinates.length - 1];
      if (!lastCoord || lastCoord[0] !== pos.lat || lastCoord[1] !== pos.lng) {
        this.flightCoordinates.push([pos.lat, pos.lng]);
        this.pathLine.setLatLngs(this.flightCoordinates);
      }

      // Dynamic Zooming based on flight phase
      let zoom = 12;
      if (this.activePhase === 'ground' || this.activePhase === 'circuit' || this.activePhase === 'landed') {
        zoom = 14; // Zoom close at airports
      } else if (this.activePhase === 'cruise') {
        zoom = 9;  // Zoom out during navigation segments
      }

      this.map.setView([pos.lat, pos.lng], zoom, { animate: true, duration: 1 });
    }
  }

  private getPhaseGermanLabel(phase: string): string {
    switch(phase) {
      case 'ground': return 'BODEN';
      case 'departure': return 'ABFLUG';
      case 'cruise': return 'REISEFLUG';
      case 'approach': return 'ANFLUG';
      case 'circuit': return 'PLATZRUNDE';
      case 'landed': return 'LANDUNG';
      default: return 'BODEN';
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.historyContainer) {
          const el = this.historyContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      } catch (err) {
        // Silent ignore
      }
    }, 100);
  }
}
