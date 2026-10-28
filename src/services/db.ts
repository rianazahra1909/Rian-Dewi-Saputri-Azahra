import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Container,
  Vessel,
  YardBlock,
  ShippingLine,
  TariffItem,
  GateTransaction,
  StevedoringTransaction,
  YardMovementTransaction,
  Invoice,
  DatabaseConfig,
} from '../types/index.ts';

const STORAGE_KEYS = {
  CONTAINERS: 'portvessel_containers_v1',
  VESSELS: 'portvessel_vessels_v1',
  YARD_BLOCKS: 'portvessel_yard_blocks_v1',
  SHIPPING_LINES: 'portvessel_shipping_lines_v1',
  TARIFFS: 'portvessel_tariffs_v1',
  GATE_TX: 'portvessel_gate_tx_v1',
  STEVEDORING_TX: 'portvessel_stevedoring_tx_v1',
  YARD_MOVEMENTS: 'portvessel_yard_movements_v1',
  INVOICES: 'portvessel_invoices_v1',
  DB_CONFIG: 'portvessel_db_config_v1',
};

// Seed Data
const initialShippingLines: ShippingLine[] = [
  {
    id: 'sl-1',
    code: 'MSK',
    name: 'Maersk Line A/S',
    country: 'Denmark',
    contactPerson: 'Capt. Hendra Wijaya',
    phone: '+62 21 5299 8000',
    email: 'ops.jakarta@maersk.com',
    activeContracts: 14,
  },
  {
    id: 'sl-2',
    code: 'ONE',
    name: 'Ocean Network Express (ONE)',
    country: 'Japan / Singapore',
    contactPerson: 'Budi Santoso, ST',
    phone: '+62 21 2924 9900',
    email: 'id.ops@one-line.com',
    activeContracts: 10,
  },
  {
    id: 'sl-3',
    code: 'EMC',
    name: 'Evergreen Marine Corp',
    country: 'Taiwan',
    contactPerson: 'Lina Marlina',
    phone: '+62 21 5790 3388',
    email: 'agency@evergreen-marine.co.id',
    activeContracts: 8,
  },
  {
    id: 'sl-4',
    code: 'MRT',
    name: 'PT Meratus Line',
    country: 'Indonesia',
    contactPerson: 'Raden Surya',
    phone: '+62 31 329 1100',
    email: 'terminal.ops@meratusline.com',
    activeContracts: 22,
  },
  {
    id: 'sl-5',
    code: 'SPL',
    name: 'PT Salam Pacific Indonesia Lines (SPIL)',
    country: 'Indonesia',
    contactPerson: 'Dewi Anggraini',
    phone: '+62 31 355 7700',
    email: 'operations@spil.co.id',
    activeContracts: 18,
  },
];

const initialVessels: Vessel[] = [
  {
    id: 'ves-1',
    vesselName: 'MV NUSANTARA GLORY',
    callSign: 'YBYB9',
    imoNumber: '9421882',
    flag: 'Indonesia',
    capacityTEU: 2850,
    lengthOverall: 215,
    shippingLine: 'PT Meratus Line',
    status: 'BERTHED',
    berthLocation: 'Dermaga 01 (Quay Crane 01 & 02)',
    eta: '2026-10-25T08:00:00Z',
    etd: '2026-10-28T18:00:00Z',
    ata: '2026-10-25T07:45:00Z',
    totalDischargePlanned: 420,
    totalLoadingPlanned: 380,
    createdAt: '2026-10-24T12:00:00Z',
  },
  {
    id: 'ves-2',
    vesselName: 'MAERSK HONAM EXPRESS',
    callSign: 'OZHW2',
    imoNumber: '9784321',
    flag: 'Denmark',
    capacityTEU: 15200,
    lengthOverall: 353,
    shippingLine: 'Maersk Line A/S',
    status: 'BERTHED',
    berthLocation: 'Dermaga 02 (Quay Crane 03 & 04)',
    eta: '2026-10-26T14:00:00Z',
    etd: '2026-10-29T22:00:00Z',
    ata: '2026-10-26T13:30:00Z',
    totalDischargePlanned: 850,
    totalLoadingPlanned: 720,
    createdAt: '2026-10-25T09:00:00Z',
  },
  {
    id: 'ves-3',
    vesselName: 'ONE COMMITMENT',
    callSign: '3FYE4',
    imoNumber: '9628207',
    flag: 'Panama',
    capacityTEU: 8560,
    lengthOverall: 316,
    shippingLine: 'Ocean Network Express (ONE)',
    status: 'ANCHORAGE',
    berthLocation: 'Tunggu Labuh Kolam Pelabuhan',
    eta: '2026-10-28T04:00:00Z',
    etd: '2026-10-30T16:00:00Z',
    totalDischargePlanned: 560,
    totalLoadingPlanned: 490,
    createdAt: '2026-10-26T10:00:00Z',
  },
  {
    id: 'ves-4',
    vesselName: 'KM SPIL CITRA',
    callSign: 'YDAM3',
    imoNumber: '9352190',
    flag: 'Indonesia',
    capacityTEU: 1680,
    lengthOverall: 168,
    shippingLine: 'PT Salam Pacific Indonesia Lines (SPIL)',
    status: 'SCHEDULED',
    berthLocation: 'Dermaga 03 (Scheduled)',
    eta: '2026-10-29T10:00:00Z',
    etd: '2026-10-31T12:00:00Z',
    totalDischargePlanned: 310,
    totalLoadingPlanned: 290,
    createdAt: '2026-10-27T08:00:00Z',
  },
];

const initialYardBlocks: YardBlock[] = [
  {
    id: 'blk-a',
    blockCode: 'A',
    name: 'Blok A - Lapangan Impor FCL Umum',
    category: 'IMPORT',
    maxBays: 16,
    maxRows: 6,
    maxTiers: 5,
    totalCapacityTEU: 480,
    currentOccupancyTEU: 326,
    status: 'ACTIVE',
  },
  {
    id: 'blk-b',
    blockCode: 'B',
    name: 'Blok B - Lapangan Ekspor Staging',
    category: 'EXPORT',
    maxBays: 16,
    maxRows: 6,
    maxTiers: 5,
    totalCapacityTEU: 480,
    currentOccupancyTEU: 298,
    status: 'ACTIVE',
  },
  {
    id: 'blk-c',
    blockCode: 'C',
    name: 'Blok C - Reefer Yard Dedicated',
    category: 'REEFER',
    maxBays: 8,
    maxRows: 4,
    maxTiers: 3,
    totalCapacityTEU: 96,
    currentOccupancyTEU: 68,
    reeferPlugsAvailable: 120,
    status: 'ACTIVE',
  },
  {
    id: 'blk-d',
    blockCode: 'D',
    name: 'Blok D - Empty Depot & Transhipment',
    category: 'EMPTY',
    maxBays: 14,
    maxRows: 6,
    maxTiers: 6,
    totalCapacityTEU: 504,
    currentOccupancyTEU: 312,
    status: 'ACTIVE',
  },
];

const initialContainers: Container[] = [
  {
    id: 'cnt-1',
    containerNumber: 'MSKU8492014',
    size: '40ft_HC',
    type: 'DRY',
    status: 'FCL',
    operationalStatus: 'IN_YARD',
    tareWeight: 3950,
    grossWeight: 26800,
    maxPayload: 28550,
    ownerShippingLine: 'Maersk Line A/S',
    isoCode: '45G1',
    yardBlockId: 'blk-a',
    yardBay: 4,
    yardRow: 2,
    yardTier: 3,
    vesselId: 'ves-2',
    sealNumber: 'ML-9920182',
    entryDate: '2026-10-26T16:20:00Z',
    consignee: 'PT Mayora Indah Tbk',
    shipper: 'Dongguan Global Electronics Co.',
    createdAt: '2026-10-26T16:20:00Z',
    updatedAt: '2026-10-26T17:00:00Z',
  },
  {
    id: 'cnt-2',
    containerNumber: 'ONEU2049182',
    size: '20ft',
    type: 'REEFER',
    status: 'FCL',
    operationalStatus: 'IN_YARD',
    tareWeight: 2850,
    grossWeight: 21400,
    maxPayload: 21150,
    ownerShippingLine: 'Ocean Network Express (ONE)',
    isoCode: '22R1',
    yardBlockId: 'blk-c',
    yardBay: 2,
    yardRow: 1,
    yardTier: 2,
    vesselId: 'ves-1',
    sealNumber: 'ONE-SEAL-4481',
    temperature: -18.5,
    entryDate: '2026-10-25T11:40:00Z',
    consignee: 'PT Japfa Comfeed Indonesia',
    shipper: 'Hokkaido Fishery Export Ltd',
    createdAt: '2026-10-25T11:40:00Z',
    updatedAt: '2026-10-25T13:00:00Z',
  },
  {
    id: 'cnt-3',
    containerNumber: 'MRTU5519208',
    size: '40ft',
    type: 'DRY',
    status: 'FCL',
    operationalStatus: 'STAGED',
    tareWeight: 3720,
    grossWeight: 24500,
    maxPayload: 26760,
    ownerShippingLine: 'PT Meratus Line',
    isoCode: '42G1',
    yardBlockId: 'blk-b',
    yardBay: 8,
    yardRow: 3,
    yardTier: 1,
    vesselId: 'ves-1',
    sealNumber: 'MRT-883011',
    entryDate: '2026-10-27T07:15:00Z',
    consignee: 'Sinarmas Pulp & Paper Makassar',
    shipper: 'PT Indah Kiat Pulp & Paper',
    createdAt: '2026-10-27T07:15:00Z',
    updatedAt: '2026-10-27T09:00:00Z',
  },
  {
    id: 'cnt-4',
    containerNumber: 'EMCU3902184',
    size: '20ft',
    type: 'DRY',
    status: 'EMPTY',
    operationalStatus: 'IN_YARD',
    tareWeight: 2200,
    grossWeight: 2200,
    maxPayload: 21800,
    ownerShippingLine: 'Evergreen Marine Corp',
    isoCode: '22G1',
    yardBlockId: 'blk-d',
    yardBay: 6,
    yardRow: 4,
    yardTier: 4,
    entryDate: '2026-10-24T14:30:00Z',
    consignee: 'Depo Evergreen Tanjung Priok',
    createdAt: '2026-10-24T14:30:00Z',
    updatedAt: '2026-10-24T15:00:00Z',
  },
  {
    id: 'cnt-5',
    containerNumber: 'TGHU6784319',
    size: '40ft_HC',
    type: 'TANK',
    status: 'FCL',
    operationalStatus: 'CUSTOMS_HOLD',
    tareWeight: 4100,
    grossWeight: 28900,
    maxPayload: 29900,
    ownerShippingLine: 'PT Meratus Line',
    isoCode: '42T1',
    yardBlockId: 'blk-a',
    yardBay: 12,
    yardRow: 1,
    yardTier: 1,
    vesselId: 'ves-1',
    sealNumber: 'BC-CUSTOMS-911',
    dangerousGoodsClass: 'IMO Class 3 - Cairan Mudah Terbakar',
    entryDate: '2026-10-23T09:10:00Z',
    consignee: 'PT Chandra Asri Petrochemical',
    shipper: 'SABIC Petrochemicals Asia',
    createdAt: '2026-10-23T09:10:00Z',
    updatedAt: '2026-10-27T08:30:00Z',
  },
  {
    id: 'cnt-6',
    containerNumber: 'SPLU1108422',
    size: '20ft',
    type: 'DRY',
    status: 'FCL',
    operationalStatus: 'GATED_OUT',
    tareWeight: 2240,
    grossWeight: 18450,
    maxPayload: 21760,
    ownerShippingLine: 'PT Salam Pacific Indonesia Lines (SPIL)',
    isoCode: '22G1',
    entryDate: '2026-10-22T10:00:00Z',
    exitDate: '2026-10-27T14:15:00Z',
    consignee: 'PT Unilever Indonesia Tbk',
    shipper: 'PT Wings Surya',
    createdAt: '2026-10-22T10:00:00Z',
    updatedAt: '2026-10-27T14:15:00Z',
  },
];

const initialTariffs: TariffItem[] = [
  {
    id: 'trf-1',
    code: 'LOLO-20',
    description: 'Lift-On / Lift-Off Container 20ft (Full / Empty)',
    category: 'LIFT_ON_OFF',
    size: '20ft',
    ratePerUnit: 285000,
    unitOfMeasure: 'PER_BOX',
  },
  {
    id: 'trf-2',
    code: 'LOLO-40',
    description: 'Lift-On / Lift-Off Container 40ft & 40ft HC',
    category: 'LIFT_ON_OFF',
    size: '40ft',
    ratePerUnit: 425000,
    unitOfMeasure: 'PER_BOX',
  },
  {
    id: 'trf-3',
    code: 'STRG-M1-20',
    description: 'Penumpukan Lapangan Masa I (Hari 1-5) 20ft',
    category: 'STORAGE',
    size: '20ft',
    ratePerUnit: 27500,
    unitOfMeasure: 'PER_DAY',
  },
  {
    id: 'trf-4',
    code: 'STRG-M1-40',
    description: 'Penumpukan Lapangan Masa I (Hari 1-5) 40ft',
    category: 'STORAGE',
    size: '40ft',
    ratePerUnit: 55000,
    unitOfMeasure: 'PER_DAY',
  },
  {
    id: 'trf-5',
    code: 'RF-MON',
    description: 'Monitoring Listrik & Plugging Reefer per 8 Jam',
    category: 'REEFER_MONITORING',
    size: 'ALL',
    ratePerUnit: 180000,
    unitOfMeasure: 'PER_SHIFT',
  },
  {
    id: 'trf-6',
    code: 'ADM-GATE',
    description: 'Biaya Administrasi & Pencetakan EIR Gate In/Out',
    category: 'GATE_ADMIN',
    size: 'ALL',
    ratePerUnit: 35000,
    unitOfMeasure: 'PER_DOCUMENT',
  },
];

const initialGateTransactions: GateTransaction[] = [
  {
    id: 'gt-1',
    transactionNumber: 'GT-2026-10-0018',
    type: 'GATE_IN',
    containerId: 'cnt-3',
    containerNumber: 'MRTU5519208',
    truckLicensePlate: 'B 9182 UEK',
    driverName: 'Sutrisno Hidayat',
    driverIdCard: '3275041982001',
    truckingCompany: 'PT Puninar Logistics',
    sealNumber: 'MRT-883011',
    conditionStatus: 'GOOD',
    allocatedYardSlot: 'B-08-03-01',
    destinationOrOrigin: 'Pabrik Karawang International Industrial City',
    eirNumber: 'EIR-GI-99201',
    operatorUsername: 'gate_op',
    timestamp: '2026-10-27T07:15:00Z',
    notes: 'Peti kemas ekspor kondisi mulus, segel utuh terverifikasi',
  },
  {
    id: 'gt-2',
    transactionNumber: 'GT-2026-10-0019',
    type: 'GATE_OUT',
    containerId: 'cnt-6',
    containerNumber: 'SPLU1108422',
    truckLicensePlate: 'B 9840 UYX',
    driverName: 'Agus Salim',
    driverIdCard: '3174091985002',
    truckingCompany: 'PT Samudera Logistik Indonesia',
    sealNumber: 'SPL-SEAL-1102',
    conditionStatus: 'GOOD',
    destinationOrOrigin: 'Gudang Rungkut Industri Surabaya',
    eirNumber: 'EIR-GO-48192',
    operatorUsername: 'gate_op',
    timestamp: '2026-10-27T14:15:00Z',
    notes: 'D/O dan SPPB Bea Cukai valid, gate pass lunas',
  },
];

const initialStevedoringTransactions: StevedoringTransaction[] = [
  {
    id: 'stv-1',
    transactionNumber: 'STV-2026-10-091',
    type: 'DISCHARGE',
    vesselId: 'ves-2',
    vesselName: 'MAERSK HONAM EXPRESS',
    containerId: 'cnt-1',
    containerNumber: 'MSKU8492014',
    quayCraneId: 'QC-03',
    terminalTractorId: 'TT-08',
    rtgCraneId: 'RTG-02',
    yardSlot: 'A-04-02-03',
    bayLocationVessel: 'Bay-18-04-82',
    status: 'COMPLETED',
    operatorUsername: 'planner',
    timestamp: '2026-10-26T16:20:00Z',
  },
  {
    id: 'stv-2',
    transactionNumber: 'STV-2026-10-092',
    type: 'DISCHARGE',
    vesselId: 'ves-1',
    vesselName: 'MV NUSANTARA GLORY',
    containerId: 'cnt-2',
    containerNumber: 'ONEU2049182',
    quayCraneId: 'QC-01',
    terminalTractorId: 'TT-03',
    rtgCraneId: 'RTG-04',
    yardSlot: 'C-02-01-02',
    bayLocationVessel: 'Bay-06-02-14',
    status: 'COMPLETED',
    operatorUsername: 'planner',
    timestamp: '2026-10-25T11:40:00Z',
  },
];

const initialYardMovements: YardMovementTransaction[] = [
  {
    id: 'ym-1',
    transactionNumber: 'YM-2026-10-041',
    containerId: 'cnt-3',
    containerNumber: 'MRTU5519208',
    fromSlot: 'B-04-01-01',
    toSlot: 'B-08-03-01',
    reason: 'EXPORT_STAGING',
    equipmentUsed: 'RTG-03',
    operatorUsername: 'planner',
    timestamp: '2026-10-27T09:00:00Z',
  },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-10-0081',
    consigneeOrShipper: 'PT Unilever Indonesia Tbk',
    containerNumber: 'SPLU1108422',
    vesselName: 'KM SPIL CITRA',
    entryDate: '2026-10-22T10:00:00Z',
    exitDate: '2026-10-27T14:15:00Z',
    dwellingDays: 5,
    storageFee: 137500,
    liftOnOffFee: 285000,
    reeferFee: 0,
    adminFee: 35000,
    taxPpn: 50325,
    totalAmount: 507825,
    paymentStatus: 'PAID',
    paymentDate: '2026-10-27T13:45:00Z',
    createdAt: '2026-10-27T13:00:00Z',
  },
];

class DatabaseService {
  private config: DatabaseConfig = {
    type: 'LOCAL_PERSISTENT',
    isConnected: true,
    lastConnected: new Date().toISOString(),
  };

  private supabaseClient: SupabaseClient | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Load config from localStorage
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.DB_CONFIG);
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        if (this.config.type === 'SUPABASE' && this.config.supabaseUrl && this.config.supabaseAnonKey) {
          this.supabaseClient = createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
        }
      }

      // Seed initial data if absent
      if (!localStorage.getItem(STORAGE_KEYS.CONTAINERS)) {
        localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(initialContainers));
      }
      if (!localStorage.getItem(STORAGE_KEYS.VESSELS)) {
        localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(initialVessels));
      }
      if (!localStorage.getItem(STORAGE_KEYS.YARD_BLOCKS)) {
        localStorage.setItem(STORAGE_KEYS.YARD_BLOCKS, JSON.stringify(initialYardBlocks));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SHIPPING_LINES)) {
        localStorage.setItem(STORAGE_KEYS.SHIPPING_LINES, JSON.stringify(initialShippingLines));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TARIFFS)) {
        localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(initialTariffs));
      }
      if (!localStorage.getItem(STORAGE_KEYS.GATE_TX)) {
        localStorage.setItem(STORAGE_KEYS.GATE_TX, JSON.stringify(initialGateTransactions));
      }
      if (!localStorage.getItem(STORAGE_KEYS.STEVEDORING_TX)) {
        localStorage.setItem(STORAGE_KEYS.STEVEDORING_TX, JSON.stringify(initialStevedoringTransactions));
      }
      if (!localStorage.getItem(STORAGE_KEYS.YARD_MOVEMENTS)) {
        localStorage.setItem(STORAGE_KEYS.YARD_MOVEMENTS, JSON.stringify(initialYardMovements));
      }
      if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initialInvoices));
      }
    } catch (e) {
      console.warn('LocalStorage initialization notice:', e);
    }
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  public async setConfig(newConfig: Partial<DatabaseConfig>): Promise<{ success: boolean; message: string }> {
    this.config = { ...this.config, ...newConfig, lastConnected: new Date().toISOString() };
    
    if (this.config.type === 'SUPABASE' && this.config.supabaseUrl && this.config.supabaseAnonKey) {
      try {
        const client = createClient(this.config.supabaseUrl, this.config.supabaseAnonKey);
        // Test query
        const { error } = await client.from('containers').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116' && !error.message.includes('relation "containers" does not exist')) {
          this.config.isConnected = false;
          return { success: false, message: `Koneksi Supabase gagal: ${error.message}` };
        }
        this.supabaseClient = client;
        this.config.isConnected = true;
      } catch (err: unknown) {
        this.config.isConnected = false;
        return { success: false, message: `Error inisialisasi Supabase: ${err instanceof Error ? err.message : String(err)}` };
      }
    } else if (this.config.type === 'NEON') {
      this.config.isConnected = Boolean(this.config.neonHost);
    } else if (this.config.type === 'FIREBASE') {
      this.config.isConnected = Boolean(this.config.firebaseProjectId);
    } else {
      this.config.isConnected = true;
    }

    localStorage.setItem(STORAGE_KEYS.DB_CONFIG, JSON.stringify(this.config));
    return { success: true, message: `Koneksi berhasil disetel ke ${this.config.type}` };
  }

  // --- CRUD: CONTAINERS ---
  public getContainers(): Container[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTAINERS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveContainer(container: Omit<Container, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Container {
    const list = this.getContainers();
    const now = new Date().toISOString();
    let saved: Container;

    if (container.id) {
      const idx = list.findIndex(c => c.id === container.id);
      if (idx !== -1) {
        saved = {
          ...list[idx],
          ...container,
          updatedAt: now,
        };
        list[idx] = saved;
      } else {
        saved = {
          ...container,
          id: container.id,
          createdAt: now,
          updatedAt: now,
        } as Container;
        list.unshift(saved);
      }
    } else {
      saved = {
        ...container,
        id: `cnt-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      } as Container;
      list.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(list));
    this.syncContainerToRemote(saved);
    return saved;
  }

  public deleteContainer(id: string): boolean {
    const list = this.getContainers();
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(filtered));
      this.deleteFromRemote('containers', id);
      return true;
    }
    return false;
  }

  // --- CRUD: VESSELS ---
  public getVessels(): Vessel[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VESSELS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveVessel(vessel: Omit<Vessel, 'id' | 'createdAt'> & { id?: string }): Vessel {
    const list = this.getVessels();
    const now = new Date().toISOString();
    let saved: Vessel;

    if (vessel.id) {
      const idx = list.findIndex(v => v.id === vessel.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...vessel };
        list[idx] = saved;
      } else {
        saved = { ...vessel, id: vessel.id, createdAt: now } as Vessel;
        list.unshift(saved);
      }
    } else {
      saved = { ...vessel, id: `ves-${Date.now()}`, createdAt: now } as Vessel;
      list.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(list));
    this.syncToRemote('vessels', saved);
    return saved;
  }

  public deleteVessel(id: string): boolean {
    const list = this.getVessels();
    const filtered = list.filter(v => v.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(filtered));
      this.deleteFromRemote('vessels', id);
      return true;
    }
    return false;
  }

  // --- CRUD: YARD BLOCKS ---
  public getYardBlocks(): YardBlock[] {
    const raw = localStorage.getItem(STORAGE_KEYS.YARD_BLOCKS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveYardBlock(block: YardBlock): YardBlock {
    const list = this.getYardBlocks();
    const idx = list.findIndex(b => b.id === block.id);
    if (idx !== -1) {
      list[idx] = block;
    } else {
      list.push(block);
    }
    localStorage.setItem(STORAGE_KEYS.YARD_BLOCKS, JSON.stringify(list));
    this.syncToRemote('yard_blocks', block);
    return block;
  }

  // --- CRUD: SHIPPING LINES ---
  public getShippingLines(): ShippingLine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIPPING_LINES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveShippingLine(line: Omit<ShippingLine, 'id'> & { id?: string }): ShippingLine {
    const list = this.getShippingLines();
    let saved: ShippingLine;
    if (line.id) {
      const idx = list.findIndex(l => l.id === line.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...line };
        list[idx] = saved;
      } else {
        saved = { ...line, id: line.id } as ShippingLine;
        list.unshift(saved);
      }
    } else {
      saved = { ...line, id: `sl-${Date.now()}` } as ShippingLine;
      list.unshift(saved);
    }
    localStorage.setItem(STORAGE_KEYS.SHIPPING_LINES, JSON.stringify(list));
    this.syncToRemote('shipping_lines', saved);
    return saved;
  }

  public deleteShippingLine(id: string): boolean {
    const list = this.getShippingLines();
    const filtered = list.filter(l => l.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEYS.SHIPPING_LINES, JSON.stringify(filtered));
      this.deleteFromRemote('shipping_lines', id);
      return true;
    }
    return false;
  }

  // --- CRUD: TARIFFS ---
  public getTariffs(): TariffItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TARIFFS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveTariff(tariff: TariffItem): TariffItem {
    const list = this.getTariffs();
    const idx = list.findIndex(t => t.id === tariff.id);
    if (idx !== -1) {
      list[idx] = tariff;
    } else {
      list.push(tariff);
    }
    localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(list));
    return tariff;
  }

  // --- TRANSAKSI: GATE IN / GATE OUT ---
  public getGateTransactions(): GateTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GATE_TX);
    return raw ? JSON.parse(raw) : [];
  }

  public addGateTransaction(tx: Omit<GateTransaction, 'id' | 'transactionNumber' | 'timestamp'> & { timestamp?: string }): GateTransaction {
    const list = this.getGateTransactions();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(list.length + 1).padStart(4, '0');
    const newTx: GateTransaction = {
      ...tx,
      id: `gt-${Date.now()}`,
      transactionNumber: `GT-${dateStr}-${randomSeq}`,
      timestamp: tx.timestamp || new Date().toISOString(),
    };
    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.GATE_TX, JSON.stringify(list));

    // Update container operational status accordingly
    const containers = this.getContainers();
    const targetIdx = containers.findIndex(c => c.id === tx.containerId || c.containerNumber === tx.containerNumber);
    if (targetIdx !== -1) {
      const container = containers[targetIdx];
      if (tx.type === 'GATE_IN') {
        container.operationalStatus = 'IN_YARD';
        container.entryDate = newTx.timestamp;
        if (tx.allocatedYardSlot) {
          const parts = tx.allocatedYardSlot.split('-');
          container.yardBlockId = `blk-${parts[0].toLowerCase()}`;
          container.yardBay = parseInt(parts[1]) || 1;
          container.yardRow = parseInt(parts[2]) || 1;
          container.yardTier = parseInt(parts[3]) || 1;
        }
      } else {
        container.operationalStatus = 'GATED_OUT';
        container.exitDate = newTx.timestamp;
      }
      localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
    }

    this.syncToRemote('gate_transactions', newTx);
    return newTx;
  }

  // --- TRANSAKSI: BONGKAR & MUAT (STEVEDORING) ---
  public getStevedoringTransactions(): StevedoringTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STEVEDORING_TX);
    return raw ? JSON.parse(raw) : [];
  }

  public addStevedoringTransaction(tx: Omit<StevedoringTransaction, 'id' | 'transactionNumber' | 'timestamp'>): StevedoringTransaction {
    const list = this.getStevedoringTransactions();
    const newTx: StevedoringTransaction = {
      ...tx,
      id: `stv-${Date.now()}`,
      transactionNumber: `STV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(list.length + 1).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.STEVEDORING_TX, JSON.stringify(list));

    // Update Container Status
    const containers = this.getContainers();
    const cIdx = containers.findIndex(c => c.id === tx.containerId || c.containerNumber === tx.containerNumber);
    if (cIdx !== -1) {
      if (tx.type === 'DISCHARGE') {
        containers[cIdx].operationalStatus = 'DISCHARGED';
        containers[cIdx].vesselId = tx.vesselId;
        const parts = tx.yardSlot.split('-');
        containers[cIdx].yardBlockId = `blk-${parts[0].toLowerCase()}`;
        containers[cIdx].yardBay = parseInt(parts[1]) || 1;
        containers[cIdx].yardRow = parseInt(parts[2]) || 1;
        containers[cIdx].yardTier = parseInt(parts[3]) || 1;
      } else if (tx.type === 'LOADING') {
        containers[cIdx].operationalStatus = 'LOADED';
        containers[cIdx].vesselId = tx.vesselId;
      }
      localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
    }

    this.syncToRemote('stevedoring_transactions', newTx);
    return newTx;
  }

  // --- TRANSAKSI: YARD MOVEMENTS (SHIFTING) ---
  public getYardMovements(): YardMovementTransaction[] {
    const raw = localStorage.getItem(STORAGE_KEYS.YARD_MOVEMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public addYardMovement(movement: Omit<YardMovementTransaction, 'id' | 'transactionNumber' | 'timestamp'>): YardMovementTransaction {
    const list = this.getYardMovements();
    const newMovement: YardMovementTransaction = {
      ...movement,
      id: `ym-${Date.now()}`,
      transactionNumber: `YM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(list.length + 1).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newMovement);
    localStorage.setItem(STORAGE_KEYS.YARD_MOVEMENTS, JSON.stringify(list));

    // Update container slot
    const containers = this.getContainers();
    const cIdx = containers.findIndex(c => c.id === movement.containerId || c.containerNumber === movement.containerNumber);
    if (cIdx !== -1) {
      const parts = movement.toSlot.split('-');
      containers[cIdx].yardBlockId = `blk-${parts[0].toLowerCase()}`;
      containers[cIdx].yardBay = parseInt(parts[1]) || 1;
      containers[cIdx].yardRow = parseInt(parts[2]) || 1;
      containers[cIdx].yardTier = parseInt(parts[3]) || 1;
      localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(containers));
    }

    this.syncToRemote('yard_movements', newMovement);
    return newMovement;
  }

  // --- TRANSAKSI: INVOICES & BILLING ---
  public getInvoices(): Invoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'> & { id?: string; invoiceNumber?: string }): Invoice {
    const list = this.getInvoices();
    const now = new Date().toISOString();
    let saved: Invoice;

    if (invoice.id) {
      const idx = list.findIndex(i => i.id === invoice.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...invoice };
        list[idx] = saved;
      } else {
        saved = {
          ...invoice,
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber || `INV-${now.slice(0, 10).replace(/-/g, '')}-${String(list.length + 1).padStart(4, '0')}`,
          createdAt: now,
        } as Invoice;
        list.unshift(saved);
      }
    } else {
      saved = {
        ...invoice,
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-${now.slice(0, 10).replace(/-/g, '')}-${String(list.length + 1).padStart(4, '0')}`,
        createdAt: now,
      } as Invoice;
      list.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(list));
    this.syncToRemote('invoices', saved);
    return saved;
  }

  // --- REMOTE SYNC HELPERS (Supabase / Neon / REST) ---
  private async syncContainerToRemote(container: Container) {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('containers').upsert(container);
      } catch (e) {
        console.warn('Supabase sync container error:', e);
      }
    }
  }

  private async syncToRemote(tableName: string, data: any) {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from(tableName).upsert(data);
      } catch (e) {
        console.warn(`Supabase sync ${tableName} error:`, e);
      }
    }
  }

  private async deleteFromRemote(tableName: string, id: string) {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from(tableName).delete().eq('id', id);
      } catch (e) {
        console.warn(`Supabase delete ${tableName} error:`, e);
      }
    }
  }

  // --- SQL SCHEMA GENERATOR FOR SUPABASE & NEON DB ---
  public generatePostgresSchema(): string {
    return `-- ==========================================================
-- PORTVESSEL TERMINAL PETI KEMAS TOS - DATABASE SCHEMA
-- Compatible with: Supabase SQL Editor, Neon DB, and PostgreSQL
-- ==========================================================

-- 1. Table: Shipping Lines & Shipping Agents
CREATE TABLE IF NOT EXISTS shipping_lines (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    active_contracts INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: Vessels (Kapal Peti Kemas)
CREATE TABLE IF NOT EXISTS vessels (
    id VARCHAR(64) PRIMARY KEY,
    vessel_name VARCHAR(255) NOT NULL,
    call_sign VARCHAR(20) NOT NULL,
    imo_number VARCHAR(20) NOT NULL UNIQUE,
    flag VARCHAR(100) NOT NULL,
    capacity_teu INT NOT NULL,
    length_overall NUMERIC(8,2),
    shipping_line VARCHAR(255),
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    berth_location VARCHAR(100),
    eta TIMESTAMP WITH TIME ZONE,
    etd TIMESTAMP WITH TIME ZONE,
    ata TIMESTAMP WITH TIME ZONE,
    atd TIMESTAMP WITH TIME ZONE,
    total_discharge_planned INT DEFAULT 0,
    total_loading_planned INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: Yard Blocks (Blok Lapangan Penumpukan)
CREATE TABLE IF NOT EXISTS yard_blocks (
    id VARCHAR(64) PRIMARY KEY,
    block_code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    max_bays INT NOT NULL,
    max_rows INT NOT NULL,
    max_tiers INT NOT NULL,
    total_capacity_teu INT NOT NULL,
    current_occupancy_teu INT DEFAULT 0,
    reefer_plugs_available INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 4. Table: Containers (Peti Kemas Master & Tracking)
CREATE TABLE IF NOT EXISTS containers (
    id VARCHAR(64) PRIMARY KEY,
    container_number VARCHAR(11) NOT NULL UNIQUE,
    size VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    operational_status VARCHAR(50) NOT NULL,
    tare_weight NUMERIC(10,2) NOT NULL,
    gross_weight NUMERIC(10,2) NOT NULL,
    max_payload NUMERIC(10,2) NOT NULL,
    owner_shipping_line VARCHAR(150),
    iso_code VARCHAR(10),
    yard_block_id VARCHAR(64) REFERENCES yard_blocks(id),
    yard_bay INT,
    yard_row INT,
    yard_tier INT,
    vessel_id VARCHAR(64) REFERENCES vessels(id),
    seal_number VARCHAR(50),
    temperature NUMERIC(5,2),
    dangerous_goods_class VARCHAR(100),
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exit_date TIMESTAMP WITH TIME ZONE,
    consignee VARCHAR(255),
    shipper VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table: Gate Transactions (Gate In / Gate Out)
CREATE TABLE IF NOT EXISTS gate_transactions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_number VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    container_id VARCHAR(64) REFERENCES containers(id),
    container_number VARCHAR(20) NOT NULL,
    truck_license_plate VARCHAR(20) NOT NULL,
    driver_name VARCHAR(150) NOT NULL,
    driver_id_card VARCHAR(50),
    trucking_company VARCHAR(200),
    seal_number VARCHAR(50),
    condition_status VARCHAR(50) DEFAULT 'GOOD',
    allocated_yard_slot VARCHAR(50),
    destination_or_origin VARCHAR(255),
    eir_number VARCHAR(50) NOT NULL,
    operator_username VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 6. Table: Stevedoring Transactions (Bongkar & Muat Kapal)
CREATE TABLE IF NOT EXISTS stevedoring_transactions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_number VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    vessel_id VARCHAR(64) REFERENCES vessels(id),
    vessel_name VARCHAR(255),
    container_id VARCHAR(64) REFERENCES containers(id),
    container_number VARCHAR(20) NOT NULL,
    quay_crane_id VARCHAR(50),
    terminal_tractor_id VARCHAR(50),
    rtg_crane_id VARCHAR(50),
    yard_slot VARCHAR(50),
    bay_location_vessel VARCHAR(50),
    status VARCHAR(50) DEFAULT 'COMPLETED',
    operator_username VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table: Invoices & Port Charges
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    consignee_or_shipper VARCHAR(255) NOT NULL,
    container_number VARCHAR(20) NOT NULL,
    vessel_name VARCHAR(255),
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    dwelling_days INT NOT NULL,
    storage_fee NUMERIC(12,2) NOT NULL,
    lift_on_off_fee NUMERIC(12,2) NOT NULL,
    reefer_fee NUMERIC(12,2) DEFAULT 0,
    admin_fee NUMERIC(12,2) NOT NULL,
    tax_ppn NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample Data Inserts
INSERT INTO yard_blocks (id, block_code, name, category, max_bays, max_rows, max_tiers, total_capacity_teu, current_occupancy_teu)
VALUES 
('blk-a', 'A', 'Blok A - Lapangan Impor FCL Umum', 'IMPORT', 16, 6, 5, 480, 326),
('blk-b', 'B', 'Blok B - Lapangan Ekspor Staging', 'EXPORT', 16, 6, 5, 480, 298),
('blk-c', 'C', 'Blok C - Reefer Yard Dedicated', 'REEFER', 8, 4, 3, 96, 68),
('blk-d', 'D', 'Blok D - Empty Depot & Transhipment', 'EMPTY', 14, 6, 6, 504, 312)
ON CONFLICT (id) DO NOTHING;
`;
  }

  // Reset database back to fresh default demo data
  public resetToDefaultSeed() {
    localStorage.setItem(STORAGE_KEYS.CONTAINERS, JSON.stringify(initialContainers));
    localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(initialVessels));
    localStorage.setItem(STORAGE_KEYS.YARD_BLOCKS, JSON.stringify(initialYardBlocks));
    localStorage.setItem(STORAGE_KEYS.SHIPPING_LINES, JSON.stringify(initialShippingLines));
    localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(initialTariffs));
    localStorage.setItem(STORAGE_KEYS.GATE_TX, JSON.stringify(initialGateTransactions));
    localStorage.setItem(STORAGE_KEYS.STEVEDORING_TX, JSON.stringify(initialStevedoringTransactions));
    localStorage.setItem(STORAGE_KEYS.YARD_MOVEMENTS, JSON.stringify(initialYardMovements));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(initialInvoices));
  }
}

export const dbService = new DatabaseService();
