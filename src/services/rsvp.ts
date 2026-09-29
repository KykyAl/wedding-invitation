import { weddingData, type Attendance } from "../data/wedding";

/**
 * RSVP & wishes data layer. The UI only talks to `rsvpService`: the HTTP
 * backend when `VITE_API_URL` is set, otherwise the localStorage mock.
 */
export interface RsvpInput {
  name: string;
  attendance: Attendance;
  guests: number;
  message: string;
}

export interface RsvpRecord extends RsvpInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Wish {
  id: string;
  name: string;
  attendance: Attendance;
  message: string;
  createdAt?: string;
}

export interface RsvpService {
  submit(input: RsvpInput): Promise<RsvpRecord>;
  /** The RSVP this device submitted last, if any. */
  getOwn(): Promise<RsvpRecord | null>;
  listWishes(): Promise<Wish[]>;
}

const RSVP_KEY = "wedding:rsvp";
const WISHES_KEY = "wedding:wishes";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / private mode — submission still succeeds for this session */
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function validateRsvp(input: RsvpInput): string | null {
  if (input.name.trim().length < 2) return "Mohon isi nama Anda.";
  if (input.name.trim().length > 60) return "Nama terlalu panjang.";
  if (input.attendance === "attend" && (input.guests < 1 || input.guests > weddingData.rsvp.maxGuests)) {
    return `Jumlah tamu 1–${weddingData.rsvp.maxGuests} orang.`;
  }
  if (input.message.length > 280) return "Ucapan maksimal 280 karakter.";
  return null;
}

export function createLocalRsvpService(): RsvpService {
  let own: RsvpRecord | null = read<RsvpRecord | null>(RSVP_KEY, null);

  return {
    async submit(input) {
      const error = validateRsvp(input);
      if (error) throw new Error(error);
      await delay(650); // feels like a network round-trip; keeps UI states honest
      const record: RsvpRecord = {
        ...input,
        name: input.name.trim(),
        message: input.message.trim(),
        guests: input.attendance === "attend" ? input.guests : 0,
        id: own?.id ?? crypto.randomUUID?.() ?? String(Date.now()),
        createdAt: new Date().toISOString(),
      };
      own = record;
      write(RSVP_KEY, record);

      const wishes = read<Wish[]>(WISHES_KEY, []).filter((w) => w.id !== record.id);
      if (record.message) {
        wishes.unshift({
          id: record.id,
          name: record.name,
          attendance: record.attendance,
          message: record.message,
          createdAt: record.createdAt,
        });
      }
      write(WISHES_KEY, wishes);
      return record;
    },
    async getOwn() {
      return own;
    },
    async listWishes() {
      const seeded: Wish[] = weddingData.wishes.map((w, i) => ({
        id: `seed-${i}`,
        name: w.name,
        attendance: w.attendance as Attendance,
        message: w.message,
      }));
      return [...read<Wish[]>(WISHES_KEY, []), ...seeded];
    },
  };
}

const GUEST_TOKEN_KEY = "wedding:guestToken";

/** Random per-device id sent as X-Guest-Token; one token owns at most one RSVP. */
function guestToken(): string {
  let token = read<string | null>(GUEST_TOKEN_KEY, null);
  if (!token) {
    token =
      crypto.randomUUID?.() ??
      Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
    write(GUEST_TOKEN_KEY, token);
  }
  return token;
}

class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function createHttpRsvpService(baseUrl: string): RsvpService {
  const base = baseUrl.replace(/\/$/, "") + "/api/v1";

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let res: Response;
    try {
      res = await fetch(base + path, {
        ...init,
        headers: { "Content-Type": "application/json", "X-Guest-Token": guestToken(), ...init.headers },
      });
    } catch {
      throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.");
    }
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(res.status, body?.error?.message ?? "Terjadi kesalahan, coba lagi.");
    }
    return body as T;
  }

  return {
    submit(input) {
      return request<RsvpRecord>("/rsvp", { method: "PUT", body: JSON.stringify(input) });
    },
    async getOwn() {
      try {
        return await request<RsvpRecord>("/rsvp/me");
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    async listWishes() {
      const wishes: Wish[] = [];
      let cursor: string | null = null;
      // Follow pages up to a sane cap; the wall shows everything in one scroll list.
      for (let page = 0; page < 10; page++) {
        const query: string = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
        const res: { items: Wish[]; nextCursor: string | null } = await request(`/wishes?limit=50${query}`);
        wishes.push(...res.items);
        cursor = res.nextCursor;
        if (!cursor) break;
      }
      return wishes;
    },
  };
}

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

export const rsvpService: RsvpService = apiUrl ? createHttpRsvpService(apiUrl) : createLocalRsvpService();
