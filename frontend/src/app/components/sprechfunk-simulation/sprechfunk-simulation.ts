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

  // Chart Selection Variables
  activeAirport: string = 'EDDK';
  activeChartType: 'vfr' | 'gnd' = 'gnd';
  availableAirports: string[] = ['EDDK', 'EDDH'];
  private chartOverlay: any = null;

  airportFrequencies: Record<string, { elev: string; name: string }> = {
    "EDDK": { elev: "302 FT", name: "Köln-Bonn" },
    "EDDH": { elev: "53 FT", name: "Hamburg" },
    "EDDP": { elev: "479 FT", name: "Leipzig/Halle" },
    "EDDN": { elev: "1046 FT", name: "Nürnberg" },
    "EDDV": { elev: "183 FT", name: "Hannover" },
    "EDVE": { elev: "295 FT", name: "Braunschweig" },
    "EDDS": { elev: "1181 FT", name: "Stuttgart" },
    "EDDB": { elev: "157 FT", name: "Berlin Brandenburg" }
  };

  // Leaflet Map variables
  private map: any = null;

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
    
    // Set available airports
    if (sim.id === 'koeln-bonn') {
      this.availableAirports = ['EDDK', 'EDDH'];
    } else if (sim.id === 'leipzig-nuernberg') {
      this.availableAirports = ['EDDP', 'EDDN'];
    } else if (sim.id === 'hannover') {
      this.availableAirports = ['EDDV'];
    } else if (sim.id === 'braunschweig') {
      this.availableAirports = ['EDVE'];
    } else if (sim.id === 'stuttgart') {
      this.availableAirports = ['EDDS'];
    } else if (sim.id === 'berlin') {
      this.availableAirports = ['EDDB'];
    } else {
      this.availableAirports = [sim.id.toUpperCase()];
    }
    
    this.activeAirport = this.availableAirports[0];
    this.activeChartType = 'gnd'; // Default to ground chart on start
    
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
    
    if (this.selectedSimulation && this.selectedSimulation.steps.length > 0) {
      const firstStep = this.selectedSimulation.steps[0];
      this.activeFrequency = firstStep.frequency || '---.---';
      this.activeSquawk = firstStep.squawk || '7000';
      this.activeAltitude = firstStep.altitude || 0;
      this.activePhase = firstStep.phase || 'ground';
      this.activePhaseText = this.getPhaseGermanLabel(this.activePhase);
      
      this.activeChartType = 'gnd';
      if (this.availableAirports.length > 0) {
        this.activeAirport = this.availableAirports[0];
      }
    }

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

    const center = AIRPORT_METADATA[this.activeAirport] || { lat: 51.0, lng: 10.0 };

    this.map = L.map('vfr-map-container', {
      zoomControl: true,
      fadeAnimation: true,
      attributionControl: false
    }).setView([center.lat, center.lng], 12);

    // Load active image chart overlay
    this.updateChart();
  }

  private cleanupMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.chartOverlay = null;
  }

  getChartUrl(airport: string, type: 'vfr' | 'gnd'): string {
    return `charts/${airport.toLowerCase()}_${type}.png`;
  }

  getChartBounds(airport: string, type: 'vfr' | 'gnd'): [[number, number], [number, number]] {
    const AIRPORT_BOUNDS: Record<string, { vfr: [[number, number], [number, number]]; gnd: [[number, number], [number, number]] }> = {
      "EDDK": {
        vfr: [[50.72, 6.90], [51.01, 7.38]],
        gnd: [[50.845, 7.10], [50.885, 7.185]]
      },
      "EDDH": {
        vfr: [[53.50, 9.75], [53.76, 10.22]],
        gnd: [[53.615, 9.96], [53.645, 10.015]]
      },
      "EDDP": {
        vfr: [[51.30, 12.00], [51.55, 12.48]],
        gnd: [[51.41, 12.20], [51.438, 12.272]]
      },
      "EDDN": {
        vfr: [[49.38, 10.88], [49.61, 11.28]],
        gnd: [[49.488, 11.055], [49.508, 11.100]]
      },
      "EDDV": {
        vfr: [[52.33, 9.45], [52.59, 9.92]],
        gnd: [[52.450, 9.655], [52.470, 9.715]]
      },
      "EDVE": {
        vfr: [[52.20, 10.35], [52.44, 10.76]],
        gnd: [[52.310, 10.535], [52.328, 10.575]]
      },
      "EDDS": {
        vfr: [[48.56, 9.00], [48.81, 9.44]],
        gnd: [[48.680, 9.195], [48.699, 9.248]]
      },
      "EDDB": {
        vfr: [[52.22, 13.25], [52.51, 13.76]],
        gnd: [[52.350, 13.480], [52.378, 13.528]]
      }
    };

    const data = AIRPORT_BOUNDS[airport];
    if (data) {
      return data[type];
    }
    return type === 'vfr' ? [[50.72, 6.90], [51.01, 7.38]] : [[50.84, 7.10], [50.89, 7.18]];
  }

  updateChart() {
    if (!this.map) return;

    if (this.chartOverlay) {
      this.map.removeLayer(this.chartOverlay);
      this.chartOverlay = null;
    }

    const bounds = this.getChartBounds(this.activeAirport, this.activeChartType);
    const imageUrl = this.getChartUrl(this.activeAirport, this.activeChartType);

    this.chartOverlay = L.imageOverlay(imageUrl, bounds, {
      opacity: 0.95,
      alt: `${this.activeAirport} ${this.activeChartType === 'vfr' ? 'Sichtanflugkarte' : 'Flugplatzkarte'}`
    }).addTo(this.map);

    const meta = AIRPORT_METADATA[this.activeAirport];
    if (meta) {
      if (this.activeChartType === 'gnd') {
        this.map.setView([meta.lat, meta.lng], 14.5, { animate: false });
      } else {
        this.map.fitBounds(bounds, { animate: false });
      }
    }
  }

  switchChartType(type: 'vfr' | 'gnd') {
    if (this.activeChartType === type) return;
    this.activeChartType = type;
    this.updateChart();
  }

  switchAirport(ap: string) {
    if (this.activeAirport === ap) return;
    this.activeAirport = ap;
    
    const center = AIRPORT_METADATA[ap];
    if (center && this.map) {
      this.map.setView([center.lat, center.lng], this.activeChartType === 'gnd' ? 14.5 : 12, { animate: false });
    }
    
    this.updateChart();
  }

  private updateMapAndCockpit() {
    // Determine the active step (last in revealed list)
    const activeStep = this.revealedSteps.length > 0 
      ? this.revealedSteps[this.revealedSteps.length - 1] 
      : null;

    if (!activeStep) {
      // Default initial states
      const firstStep = this.selectedSimulation?.steps[0];
      this.activeFrequency = firstStep?.frequency || '---.---';
      this.activeSquawk = firstStep?.squawk || '7000';
      this.activeAltitude = firstStep?.altitude || 0;
      this.activePhase = firstStep?.phase || 'ground';
      this.activePhaseText = this.getPhaseGermanLabel(this.activePhase);
      
      this.activeChartType = 'gnd';
      if (this.availableAirports.length > 0) {
        this.activeAirport = this.availableAirports[0];
      }
      this.updateChart();
      return;
    }

    // 1. Update Cockpit attributes
    if (activeStep.frequency) this.activeFrequency = activeStep.frequency;
    if (activeStep.squawk) this.activeSquawk = activeStep.squawk;
    if (activeStep.altitude !== undefined) this.activeAltitude = activeStep.altitude;
    
    let phaseChanged = false;
    if (activeStep.phase && activeStep.phase !== this.activePhase) {
      this.activePhase = activeStep.phase;
      this.activePhaseText = this.getPhaseGermanLabel(this.activePhase);
      phaseChanged = true;
    }

    // Auto-detect chart type based on phase
    let targetChartType: 'vfr' | 'gnd' = 'vfr';
    if (this.activePhase === 'ground' || this.activePhase === 'landed') {
      targetChartType = 'gnd';
    }
    
    let chartTypeChanged = false;
    if (targetChartType !== this.activeChartType) {
      this.activeChartType = targetChartType;
      chartTypeChanged = true;
    }

    // Auto-detect active airport based on step label
    let airportChanged = false;
    if (activeStep.mapPosition) {
      const labelUpper = activeStep.mapPosition.label.toUpperCase();
      const matchedAp = this.availableAirports.find(ap => labelUpper.includes(ap));
      if (matchedAp && matchedAp !== this.activeAirport) {
        this.activeAirport = matchedAp;
        airportChanged = true;
      }
    }

    // Update the map image overlay if airport or chart type changed
    if (airportChanged || chartTypeChanged) {
      this.updateChart();
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
