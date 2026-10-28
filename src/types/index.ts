export type ContainerSize = '20ft' | '40ft' | '40ft_HC' | '45ft';
export type ContainerType = 'DRY' | 'REEFER' | 'OPEN_TOP' | 'FLAT_RACK' | 'TANK';
export type ContainerStatus = 'FCL' | 'LCL' | 'EMPTY';
export type OperationalStatus = 'ANNOUNCED' | 'DISCHARGED' | 'IN_YARD' | 'STAGED' | 'LOADED' | 'GATED_OUT' | 'CUSTOMS_HOLD';

export interface Container {
  id: string;
  containerNumber: string; // ISO 6346 format e.g. MSKU1234567
  size: ContainerSize;
  type: ContainerType;
  status: ContainerStatus; // FCL, LCL, EMPTY
  operationalStatus: OperationalStatus;
  tareWeight: number; // in kg
  grossWeight: number; // in kg
  maxPayload: number; // in kg
  ownerShippingLine: string; // e.g. Maersk, ONE, Evergreen
  isoCode: string; // e.g. 22G1, 42G1, 45R1
  yardBlockId?: string; // Block A, B, C, D
  yardBay?: number; // 01 to 30
  yardRow?: number; // 01 to 06
  yardTier?: number; // 01 to 05
  vesselId?: string;
  sealNumber?: string;
  temperature?: number; // For Reefer, in Celsius
  dangerousGoodsClass?: string; // e.g. "IMO Class 3 - Flammable" or empty
  entryDate: string; // ISO string
  exitDate?: string;
  consignee?: string;
  shipper?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vessel {
  id: string;
  vesselName: string;
  callSign: string;
  imoNumber: string;
  flag: string;
  capacityTEU: number;
  lengthOverall: number; // in meters (LOA)
  shippingLine: string;
  status: 'SCHEDULED' | 'ANCHORAGE' | 'BERTHED' | 'DEPARTED';
  berthLocation?: string; // Dermaga 01, Dermaga 02
  eta: string; // Estimated Time of Arrival
  etd: string; // Estimated Time of Departure
  ata?: string; // Actual Time of Arrival
  atd?: string; // Actual Time of Departure
  totalDischargePlanned: number; // in TEU
  totalLoadingPlanned: number; // in TEU
  createdAt: string;
}

export interface YardBlock {
  id: string;
  blockCode: string; // "A", "B", "C", "D", "REEFER-1"
  name: string;
  category: 'IMPORT' | 'EXPORT' | 'REEFER' | 'EMPTY' | 'DANGEROUS_GOODS';
  maxBays: number;
  maxRows: number;
  maxTiers: number;
  totalCapacityTEU: number;
  currentOccupancyTEU: number;
  reeferPlugsAvailable?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'FULL';
}

export interface ShippingLine {
  id: string;
  code: string; // "MSK", "ONE", "EMC", "MRT", "SPL"
  name: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  activeContracts: number;
}

export interface TariffItem {
  id: string;
  code: string;
  description: string;
  category: 'LIFT_ON_OFF' | 'STORAGE' | 'REEFER_MONITORING' | 'GATE_ADMIN' | 'HAZARDOUS';
  size: '20ft' | '40ft' | 'ALL';
  ratePerUnit: number; // IDR Rupiah
  unitOfMeasure: 'PER_BOX' | 'PER_DAY' | 'PER_SHIFT' | 'PER_DOCUMENT';
}

export interface GateTransaction {
  id: string;
  transactionNumber: string; // e.g. GT-2025-00192
  type: 'GATE_IN' | 'GATE_OUT';
  containerId: string;
  containerNumber: string;
  truckLicensePlate: string; // e.g. B 9421 UEK
  driverName: string;
  driverIdCard: string;
  truckingCompany: string;
  sealNumber: string;
  conditionStatus: 'GOOD' | 'DAMAGED' | 'SEAL_BROKEN';
  allocatedYardSlot?: string; // e.g. A-04-02-03
  destinationOrOrigin: string; // e.g. Kawasan Industri MM2100 Cikarang
  eirNumber: string; // Equipment Interchange Receipt Number
  operatorUsername: string;
  timestamp: string;
  notes?: string;
}

export interface StevedoringTransaction {
  id: string;
  transactionNumber: string; // e.g. ST-2025-00412
  type: 'DISCHARGE' | 'LOADING';
  vesselId: string;
  vesselName: string;
  containerId: string;
  containerNumber: string;
  quayCraneId: string; // QC-01, QC-02
  terminalTractorId: string; // TT-14, TT-08
  rtgCraneId: string; // RTG-03
  yardSlot: string; // A-05-01-02
  bayLocationVessel?: string; // Bay-04-02-82
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  operatorUsername: string;
  timestamp: string;
}

export interface YardMovementTransaction {
  id: string;
  transactionNumber: string; // e.g. YM-2025-00891
  containerId: string;
  containerNumber: string;
  fromSlot: string;
  toSlot: string;
  reason: 'OPTIMIZATION' | 'EXPORT_STAGING' | 'REEFER_CONNECTION' | 'INSPECTION' | 'CUSTOMS_HOLD';
  equipmentUsed: string; // RTG-01, Reach Stacker-02
  operatorUsername: string;
  timestamp: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2025-0104
  consigneeOrShipper: string;
  containerNumber: string;
  vesselName?: string;
  entryDate: string;
  exitDate: string;
  dwellingDays: number;
  storageFee: number;
  liftOnOffFee: number;
  reeferFee: number;
  adminFee: number;
  taxPpn: number; // 11%
  totalAmount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'PENDING';
  paymentDate?: string;
  createdAt: string;
}

export type UserRole = 'SUPER_ADMIN' | 'YARD_PLANNER' | 'GATE_OPERATOR' | 'FINANCE_OFFICER';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
}

export type DatabaseType = 'LOCAL_PERSISTENT' | 'SUPABASE' | 'NEON' | 'FIREBASE';

export interface DatabaseConfig {
  type: DatabaseType;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  neonHost?: string;
  neonDatabase?: string;
  neonApiKey?: string;
  firebaseProjectId?: string;
  lastConnected?: string;
  isConnected: boolean;
}
