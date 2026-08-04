export const vehicleCategories = [
  "military-aircraft",
  "launch-vehicle",
] as const;

export type VehicleCategory = (typeof vehicleCategories)[number];

/** ISO 8601 calendar date in YYYY-MM-DD form. */
export type IsoDateString = `${number}-${number}-${number}`;

export interface CountryReference {
  readonly isoCode: string;
  readonly name: string;
}

export interface BaseVehicle<
  TCategory extends VehicleCategory = VehicleCategory,
> {
  readonly category: TCategory;
  readonly country: CountryReference;
  readonly description: string;
  readonly firstFlight: IsoDateString;
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
}
