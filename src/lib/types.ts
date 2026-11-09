export type CagarBudayaStatus = "Nasional" | "Provinsi" | "Kota" | "Kabupaten";

export interface FotoBangunan {
  id?: string;
  src: string;
  cap?: string;
  isMain?: boolean;
}

export interface CagarBudayaItem {
  id: string; // e.g. "b1" or uuid
  no: number;
  nama: string;
  didirikan: string;
  tahunDidirikan?: number | null;
  status: CagarBudayaStatus;
  sk: string;
  tglSK: string;
  ket: string;
  alamat: string;
  narasi: string;
  lat: number | null;
  lng: number | null;
  fotos: FotoBangunan[];
  mainIdx?: number;
  fit?: "contain" | "cover";
  createdAt?: string;
  updatedAt?: string;
}

export interface CagarBudayaFormData {
  nama: string;
  no: number;
  didirikan: string;
  status: CagarBudayaStatus;
  sk: string;
  tglSK: string;
  ket: string;
  alamat: string;
  narasi: string;
  lat: number | null;
  lng: number | null;
  fit: "contain" | "cover";
}

