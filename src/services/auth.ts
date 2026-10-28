import { User, UserRole } from '../types/index.ts';

const AUTH_STORAGE_KEY = 'portvessel_auth_session_v1';

export const PRESET_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Ir. Danang Prasetyo, M.T.',
    email: 'admin@terminal.id',
    role: 'SUPER_ADMIN',
    department: 'Direktorat Operasi & Sistem Informasi Terminal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    passwordHash: 'admin123',
  },
  {
    id: 'usr-planner',
    username: 'planner',
    name: 'Bima Satria, S.T.',
    email: 'planner@terminal.id',
    role: 'YARD_PLANNER',
    department: 'Divisi Yard Planning & Berth Control',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    passwordHash: 'planner123',
  },
  {
    id: 'usr-gate',
    username: 'gate_op',
    name: 'Ahmad Fauzi',
    email: 'gate@terminal.id',
    role: 'GATE_OPERATOR',
    department: 'Divisi Gate Automation & In-Out Inspection',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    passwordHash: 'gate123',
  },
  {
    id: 'usr-finance',
    username: 'finance',
    name: 'Siti Rahmawati, S.E.',
    email: 'finance@terminal.id',
    role: 'FINANCE_OFFICER',
    department: 'Divisi Penagihan Jasa Kepelabuhanan (Billing)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    passwordHash: 'finance123',
  },
];

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      } else {
        // By default on initial visit, auto-login as Admin or prompt
        // Let's seed admin by default so app is ready, but user can log out or test login form anytime
        this.currentUser = PRESET_USERS[0];
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      }
    } catch {
      this.currentUser = PRESET_USERS[0];
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  public login(identifier: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = PRESET_USERS.find(
      u => (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) && u.passwordHash === cleanPass
    );

    if (matched) {
      const { passwordHash: _, ...safeUser } = matched;
      this.currentUser = safeUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return { success: true, user: safeUser };
    }

    // Allow custom admin username fallback for convenience
    if ((cleanId === 'admin' || cleanId === 'admin@terminal.id') && (cleanPass === 'admin' || cleanPass === 'admin123')) {
      const safeUser = PRESET_USERS[0];
      this.currentUser = safeUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
      return { success: true, user: safeUser };
    }

    return {
      success: false,
      error: 'Username / Email atau Password salah! Gunakan akun default: admin / admin123',
    };
  }

  public quickLoginAs(role: UserRole): User {
    const matched = PRESET_USERS.find(u => u.role === role) || PRESET_USERS[0];
    const { passwordHash: _, ...safeUser } = matched;
    this.currentUser = safeUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return safeUser;
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }
}

export const authService = new AuthService();
