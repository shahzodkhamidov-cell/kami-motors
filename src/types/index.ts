export interface Car {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  bodyType: string;
  mileage: number;
  price: number;
  cleanTitleValue: number;
  color?: string | null;
  engine?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  fuelType?: string | null;
  description?: string | null;
  numberOfOwners?: number | null;
  features: string[];
  images: string[];
  status: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancingApplication {
  id: string;
  carId: string;
  car?: Car;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  employmentStatus: string;
  employer?: string | null;
  monthlyIncome: number;
  creditScoreRange: string;
  downPayment: number;
  loanTerm: number;
  additionalNotes?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VinData {
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyType: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
}
