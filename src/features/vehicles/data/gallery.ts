/**
 * Every vehicle photograph on ORBIX, one record per file, and the slot each
 * file fills. A file fills one slot only (v4 plan section 7): the registry
 * card and the vehicle's own profile hero share the vehicle's identity
 * photograph, and the Credits page shows thumbnails of the files a page
 * renders (`PHOTO_SLOTS_IN_USE`); nothing else repeats. A changed photograph
 * always gets a new file name, so no image cache serves an old rendition.
 *
 * Page code reads photographs through the functions at the bottom:
 * `getVehiclePhoto(id, slot)`, `getVehicleGallery(id)`, `getSitePhoto(slot)`
 * and `listPhotos()`.
 *
 * Sizes: every file was exported from the full-resolution original on
 * Wikimedia Commons, never enlarged. A file is sharp wherever its displayed
 * CSS width is at most `width / 2` (and CSS height at most `height / 2`) at
 * device pixel ratio 2; `maxSharpCssSize` returns both limits. Plates and
 * heroes were exported at up to 2880 px on the long edge, gallery views at
 * up to 2400 px.
 */

import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";

import { aircraftVehicles } from "./aircraft";
import { rocketVehicles } from "./rockets";

export interface VehiclePhoto {
  /** Plain description of what the photograph shows. */
  readonly alt: string;
  /**
   * Catalogue caption body, one sentence, without the figure number or the
   * credit (spec v3 section 6: "Fig. 3  <caption> <credit>, <licence>.
   * Source.").
   */
  readonly caption: string;
  /** Photographer or agency, as the licence asks to be credited. */
  readonly credit: string;
  /** Intrinsic height of the file in pixels. */
  readonly height: number;
  /** Stable id: the file name without extension. */
  readonly id: string;
  /** Licence name, for example "Public domain (U.S. government work)" or "CC BY 2.0". */
  readonly license: string;
  /** Page that states the licence terms. */
  readonly licenseUrl: string;
  /** What was changed from the original file. */
  readonly modifications: string;
  /**
   * `object-position` that keeps the vehicle in frame when the plate crops
   * the photograph; the subject's centre, measured on the file.
   */
  readonly objectPosition: string;
  /** Human-readable file page for the original, not the raw image URL. */
  readonly sourceUrl: string;
  readonly src: string;
  readonly vehicleId: string;
  /** What kind of view it is, so a gallery can order or label views. */
  readonly view: PhotoView;
  /**
   * Short label that tells this photograph apart from the vehicle's others,
   * taken from the caption ("Apollo 12 leaving the VAB"). For credits rows.
   */
  readonly title: string;
  /** Intrinsic width of the file in pixels. */
  readonly width: number;
}

export type PhotoView =
  "flight" | "launch" | "ground" | "detail" | "landing" | "museum";

/**
 * Per-vehicle slots. `card` and `profile` are the vehicle's identity
 * photograph (the registry card and its own profile hero) except where the
 * profile has its own file (B-2). `featured` is the registry hero on
 * `/aircraft` (B-2) or `/rockets` (Saturn V); other vehicles have none.
 */
export type VehiclePhotoSlot = "card" | "featured" | "profile";

/** Photographs used once, outside the vehicle pages. */
export type SitePhotoSlot =
  /** Home vehicles section: the one photo plate (v4 plan section 4; the home hero has no photo). */
  | "home-vehicles"
  /** Learn, aerodynamics pathway figure (vapour over the wing). */
  | "learn-aerodynamics"
  /** Learn, propulsion pathway figure (five F-1 engines). */
  | "learn-propulsion"
  /** Learn, compressible flow pathway figure (shock diamonds). */
  | "learn-compressible-flow"
  /** About page plate. */
  | "about"
  /** 404 page plate. */
  | "not-found"
  /** Open Graph and Twitter card image (rendered at 1200 x 630). */
  | "og";

const PD = "Public domain (U.S. government work)" as const;
const T = "https://commons.wikimedia.org/wiki/Template:" as const;
const FILE = "https://commons.wikimedia.org/wiki/File:" as const;
const RESIZED = "Resized and converted to WebP" as const;
const CROPPED = "Cropped, resized and converted to WebP" as const;

const PD_USAF = { license: PD, licenseUrl: `${T}PD-USAF` } as const;
const PD_AIR_FORCE = {
  license: PD,
  licenseUrl: `${T}PD-USGov-Military-Air_Force`,
} as const;
const PD_MILITARY = {
  license: PD,
  licenseUrl: `${T}PD-USGov-Military`,
} as const;
const PD_NAVY = {
  license: PD,
  licenseUrl: `${T}PD-USGov-Military-Navy`,
} as const;
const PD_USNAVY = { license: PD, licenseUrl: `${T}PD-USNavy` } as const;
const PD_MARINES = {
  license: PD,
  licenseUrl: `${T}PD-USGov-Military-Marines`,
} as const;
const PD_NASA = { license: PD, licenseUrl: `${T}PD-USGov-NASA` } as const;
const CC0 = {
  license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
} as const;

type PhotoInput = Omit<VehiclePhoto, "modifications" | "src"> & {
  readonly group: "aircraft" | "rockets";
  readonly modifications?: string;
};

function photo(input: PhotoInput): VehiclePhoto {
  const { group, ...rest } = input;
  return {
    ...rest,
    modifications: input.modifications ?? RESIZED,
    src: `/images/${group}/${input.id}.webp`,
  };
}

/* ------------------------------------------------------------------------ */
/* Additional photographs (every file except the ten identity photographs). */
/* ------------------------------------------------------------------------ */

const additionalPhotos = {
  // F-22 Raptor
  "f-22-raptor-twilight": photo({
    alt: "F-22 Raptor in silhouette against towering orange clouds at dusk",
    caption:
      "F-22 Raptor demonstration team flying at twilight over EAA AirVenture, Oshkosh, July 2019.",
    credit: "U.S. Air Force photo by 2nd Lt. Samuel Eckholm",
    group: "aircraft",
    height: 1920,
    id: "f-22-raptor-twilight",
    ...PD_USAF,
    objectPosition: "48% 45%",
    sourceUrl: `${FILE}F-22_Raptor_flying_at_twilight_190728-F-VA182-1014.jpg`,
    title: "Twilight display, Oshkosh",
    vehicleId: "f-22-raptor",
    view: "flight",
    width: 2880,
  }),
  "f-22-raptor-vapor": photo({
    alt: "F-22 Raptor banking left with a sheet of condensed vapour streaming off its upper surface",
    caption:
      "F-22 Raptor banking during a display at the Avalon airshow, Australia, March 2017. Condensed vapour marks the low-pressure air over the wing.",
    credit: "U.S. Air Force photo by Master Sgt. John Gordinier",
    group: "aircraft",
    height: 1922,
    id: "f-22-raptor-vapor",
    ...PD_AIR_FORCE,
    objectPosition: "72% 55%",
    sourceUrl: `${FILE}A_U.S._Air_Force_F-22_Raptor_banks_left_causing_vapor_contrails_(32517126414).jpg`,
    title: "Vapour over the wing, Avalon",
    vehicleId: "f-22-raptor",
    view: "flight",
    width: 2880,
  }),
  "f-22-raptor-taxi": photo({
    alt: "Two F-22 Raptors taxiing toward the camera on a flightline lined with dense trees",
    caption:
      "F-22 Raptors of the 3rd Air Expeditionary Wing taxiing on Tinian, Northern Mariana Islands, July 2025.",
    credit: "U.S. Air Force photo by Airman 1st Class Tala Hunt",
    group: "aircraft",
    height: 1602,
    id: "f-22-raptor-taxi",
    ...PD_AIR_FORCE,
    objectPosition: "55% 65%",
    sourceUrl: `${FILE}3rd_Air_Expeditionary_Wing_F-22_Raptors_taxi_on_Tinian_during_exercise_Resolute_Force_Pacific_2025.jpg`,
    title: "Taxiing on Tinian",
    vehicleId: "f-22-raptor",
    view: "ground",
    width: 2400,
  }),
  "f-22-raptor-weapons-bay": photo({
    alt: "Underside of an F-22 Raptor in flight with its main weapons bay doors open",
    caption:
      "F-22 Raptor cycling its weapons bay doors in flight at the Naval Air Station Oceana air show, September 2008.",
    credit: "U.S. Navy photo by Edward I. Fagg",
    group: "aircraft",
    height: 1607,
    id: "f-22-raptor-weapons-bay",
    ...PD_NAVY,
    objectPosition: "55% 50%",
    sourceUrl: `${FILE}F-22_Raptor_shows_its_weapon_bay.jpg`,
    title: "Weapons bay open in flight",
    vehicleId: "f-22-raptor",
    view: "detail",
    width: 2400,
  }),
  "f-22-raptor-hangar": photo({
    alt: "Crew chief signalling an F-22 Raptor as it rolls out of a hangar",
    caption:
      "A crew chief releases an F-22 Raptor from its hangar at Holloman Air Force Base, New Mexico, September 2011.",
    credit: "U.S. Air Force photo by DeAndre Curtiss",
    group: "aircraft",
    height: 1880,
    id: "f-22-raptor-hangar",
    ...PD_USAF,
    objectPosition: "45% 45%",
    sourceUrl: `${FILE}F-22_Raptor_emerging_from_hibernation_at_hangar.jpg`,
    title: "Leaving the hangar, Holloman",
    vehicleId: "f-22-raptor",
    view: "ground",
    width: 2880,
  }),

  // F-35 Lightning II
  "f-35-lightning-ii-hangar": photo({
    alt: "F-35A Lightning II parked nose-on in a hangar under a large American flag",
    caption:
      "F-35A Lightning II in a hangar at Lakeland Linder International Airport, Florida, December 2020.",
    credit: "U.S. Air Force photo by Staff Sgt. Codie Trimble",
    group: "aircraft",
    height: 1350,
    id: "f-35-lightning-ii-hangar",
    ...PD_USAF,
    objectPosition: "50% 60%",
    sourceUrl: `${FILE}An_F-35A_Lightning_ll_sits_in_a_hangar_at_Lakeland_Linder_International_Airport,_Lakeland,_Fla.,_following_an_aerobatic_routine_by_the_F-35A_Lightning_ll_demonstration_team_at_the_Sun_'n_Fun_Holiday_Flying_Festival,_Dec._4,_2020.jpg`,
    title: "In a hangar, Lakeland",
    vehicleId: "f-35-lightning-ii",
    view: "ground",
    width: 2400,
  }),
  "f-35-lightning-ii-weapons-bay": photo({
    alt: "Underside of an F-35C in flight with both internal weapons bays open and missiles inside",
    caption:
      "F-35C, the carrier variant, flying with its internal weapons bays open during testing at Patuxent River, Maryland, January 2013.",
    credit: "U.S. Navy photo",
    group: "aircraft",
    height: 1886,
    id: "f-35-lightning-ii-weapons-bay",
    ...PD_USNAVY,
    objectPosition: "55% 50%",
    sourceUrl: `${FILE}An_F-35C_Lightning_II_displays_its_internal_weapons_bay._(8390303370).jpg`,
    title: "F-35C weapons bays open",
    vehicleId: "f-35-lightning-ii",
    view: "detail",
    width: 2400,
  }),
  "f-35-lightning-ii-hover": photo({
    alt: "F-35B seen from below while hovering, with its lift fan doors and landing gear open",
    caption:
      "F-35B, the short take-off and vertical landing variant, hovering before a vertical landing at Marine Corps Air Station Iwakuni, Japan, February 2017.",
    credit: "U.S. Marine Corps photo by Lance Cpl. Joseph Abrego",
    group: "aircraft",
    height: 1600,
    id: "f-35-lightning-ii-hover",
    ...PD_MARINES,
    objectPosition: "48% 50%",
    sourceUrl: `${FILE}F-35B_Lighting_II_training_flights_170203-M-ON157-0436.jpg`,
    title: "F-35B hovering, Iwakuni",
    vehicleId: "f-35-lightning-ii",
    view: "flight",
    width: 2400,
  }),

  // F-15 Eagle
  "f-15-eagle-owens": photo({
    alt: "F-15C Eagle of the California Air National Guard flying over snow-dusted mountains",
    caption:
      "F-15C Eagle of the 144th Fighter Wing over the Owens military operations area, California, November 2013.",
    credit: "U.S. Air Force photo by Master Sgt. Roy Santana",
    group: "aircraft",
    height: 1920,
    id: "f-15-eagle-owens",
    ...PD_MILITARY,
    objectPosition: "55% 45%",
    sourceUrl: `${FILE}144th_FW_F-15_Eagle.JPG`,
    title: "Over the Owens operations area",
    vehicleId: "f-15-eagle",
    view: "flight",
    width: 2880,
  }),
  "f-15-eagle-iceland": photo({
    alt: "F-15C Eagle flying low over snow-covered Icelandic terrain",
    caption:
      "F-15C Eagle over Iceland during Icelandic Air Surveillance and Policing, April 2015.",
    credit: "U.S. Air Force photo by 2nd Lt. Meredith Mulvihill",
    group: "aircraft",
    height: 1578,
    id: "f-15-eagle-iceland",
    ...PD_MILITARY,
    objectPosition: "65% 45%",
    sourceUrl: `${FILE}An_F-15C_Eagle_flies_over_Iceland_during_Icelandic_Air_Surveillance_and_Policing_April_22,_2015.jpg`,
    title: "Over Iceland",
    vehicleId: "f-15-eagle",
    view: "flight",
    width: 2400,
  }),
  "f-15-eagle-takeoff": photo({
    alt: "F-15C Eagle climbing away after take-off against a grey sky, afterburners lit",
    caption:
      "F-15C Eagle of the 67th Fighter Squadron taking off from Kadena Air Base, Japan, September 2020.",
    credit: "U.S. Air Force photo by Staff Sgt. Peter Reft",
    group: "aircraft",
    height: 1350,
    id: "f-15-eagle-takeoff",
    ...PD_USAF,
    objectPosition: "45% 40%",
    sourceUrl: `${FILE}A_U.S._Air_Force_F-15C_Eagle_from_the_67th_Fighter_Squadron_takes_off_for_a_training_mission,_Sept._14,_2020,_at_Kadena_Air_Base,_Japan.jpg`,
    title: "Taking off, Kadena",
    vehicleId: "f-15-eagle",
    view: "launch",
    width: 2400,
  }),
  "f-15-eagle-taxi": photo({
    alt: "F-15C Eagle taxiing on a runway with desert mountains behind it",
    caption:
      "F-15C Eagle of the 173rd Fighter Wing taxiing at Holloman Air Force Base, New Mexico, March 2023.",
    credit: "U.S. Air Force photo by Tech. Sgt. Victor J. Caputo",
    group: "aircraft",
    height: 1600,
    id: "f-15-eagle-taxi",
    ...PD_AIR_FORCE,
    objectPosition: "55% 70%",
    sourceUrl: `${FILE}An_F-15C_Eagle_from_the_173rd_Fighter_Wing_taxis_before_taking_off_for_a_large_force_exercise_as_part_of_the_19th_Air_Force_Commander’s_Call_and_Fly-In_at_Holloman_Air_Force_Base,_New_Mexico,_March_3,_2023.jpg`,
    title: "Taxiing, Holloman",
    vehicleId: "f-15-eagle",
    view: "ground",
    width: 2400,
  }),

  // B-2 Spirit
  "b-2-spirit-diego-garcia": photo({
    alt: "B-2 Spirit seen from below against a clear blue sky, showing its flying-wing planform",
    caption:
      "B-2 Spirit overhead on approach to Diego Garcia, British Indian Ocean Territory, April 2025.",
    credit: "U.S. Air Force photo by Tech. Sgt. Anthony Hetlage",
    group: "aircraft",
    height: 1236,
    id: "b-2-spirit-diego-garcia",
    ...PD_AIR_FORCE,
    modifications: CROPPED,
    objectPosition: "50% 50%",
    sourceUrl: `${FILE}B-2_Spirit_conducts_missions_at_Diego_Garcia_(9433860).jpg`,
    title: "On approach, Diego Garcia",
    vehicleId: "b-2-spirit",
    view: "flight",
    width: 2880,
  }),
  "b-2-spirit-takeoff": photo({
    alt: "B-2 Spirit just after take-off with its landing gear still down, under an overcast sky",
    caption:
      "B-2 Spirit taking off from Whiteman Air Force Base, Missouri, April 2025.",
    credit: "U.S. Air Force photo by Senior Airman Joshua Hastings",
    group: "aircraft",
    height: 1920,
    id: "b-2-spirit-takeoff",
    ...PD_USAF,
    objectPosition: "55% 45%",
    sourceUrl: `${FILE}A_B-2_Spirit_takes_off_from_Whiteman_Air_Force_Base.jpg`,
    title: "Taking off, Whiteman",
    vehicleId: "b-2-spirit",
    view: "launch",
    width: 2880,
  }),
  "b-2-spirit-refuel": photo({
    alt: "B-2 Spirit seen from the tanker's boom window, with the refuelling boom connected above the cockpit",
    caption:
      "B-2 Spirit receiving fuel from a tanker over the Indian Ocean, April 2025.",
    credit: "U.S. Air Force photo by Tech. Sgt. Anthony Hetlage",
    group: "aircraft",
    height: 1600,
    id: "b-2-spirit-refuel",
    ...PD_AIR_FORCE,
    objectPosition: "50% 55%",
    sourceUrl: `${FILE}B-2_Spirit_stealth_bombers_refuel_during_combat_mission_(9255554).jpg`,
    title: "Refuelling over the Indian Ocean",
    vehicleId: "b-2-spirit",
    view: "flight",
    width: 2400,
  }),
  "b-2-spirit-iceland": photo({
    alt: "B-2 Spirit parked on a wet ramp beside a fuel truck during refuelling",
    caption:
      "Hot-pit refuelling of a B-2 Spirit at Keflavik Air Base, Iceland, August 2019.",
    credit: "U.S. Air Force photo by Senior Airman Thomas Barley",
    group: "aircraft",
    height: 1441,
    id: "b-2-spirit-iceland",
    ...PD_AIR_FORCE,
    objectPosition: "40% 45%",
    sourceUrl: `${FILE}The_B-2_Spirit_Stealth_Bomber_lands_in_Iceland_for_the_first_time_ever_to_perform_hot-pit_refueling_(5708631).jpg`,
    title: "Hot-pit refuelling, Keflavik",
    vehicleId: "b-2-spirit",
    view: "ground",
    width: 2400,
  }),

  // SR-71 Blackbird
  "sr-71-blackbird-shock-diamonds": photo({
    alt: "NASA SR-71B lifting off the runway with bright shock diamonds in both engine exhausts",
    caption:
      "NASA SR-71B taking off from the Ames-Dryden Flight Research Facility in 1992. The bright bands in the exhaust are shock diamonds.",
    credit: "NASA",
    group: "aircraft",
    height: 2296,
    id: "sr-71-blackbird-shock-diamonds",
    ...PD_NASA,
    objectPosition: "55% 50%",
    sourceUrl: `${FILE}SR-71_Takeoff_with_Afterburner_Showing_Shock_Diamonds_in_Exhaust.jpg`,
    title: "Shock diamonds on take-off",
    vehicleId: "sr-71-blackbird",
    view: "launch",
    width: 2880,
  }),
  "sr-71-blackbird-overhead": photo({
    alt: "SR-71A seen from above and ahead, flying over farmland",
    caption: "SR-71A seen from above in flight.",
    credit: "U.S. Air Force photo by Tech. Sgt. Michael Haggerty",
    group: "aircraft",
    height: 1623,
    id: "sr-71-blackbird-overhead",
    ...PD_MILITARY,
    objectPosition: "50% 45%",
    sourceUrl: `${FILE}An_air-to-air_overhead_front_view_of_an_SR-71A_strategic_reconnaissance_aircraft._The_SR-71_is_unofficially_known_as_the_"Blackbird."_DF-ST-89-06288.jpg`,
    title: "Seen from above in flight",
    vehicleId: "sr-71-blackbird",
    view: "flight",
    width: 2400,
  }),
  "sr-71-blackbird-refuel": photo({
    alt: "SR-71 flying below and behind a KC-135Q tanker, moving toward its refuelling boom",
    caption:
      "SR-71 (61-7974) moving toward a KC-135Q Stratotanker for in-flight refuelling, 1983.",
    credit: "U.S. Air Force photo by Ken Hackman",
    group: "aircraft",
    height: 1580,
    id: "sr-71-blackbird-refuel",
    ...PD_AIR_FORCE,
    objectPosition: "50% 60%",
    sourceUrl: `${FILE}Boeing_KC-135Q_refueling_SR-71.JPEG`,
    title: "Moving toward a KC-135Q tanker",
    vehicleId: "sr-71-blackbird",
    view: "flight",
    width: 2400,
  }),
  "sr-71-blackbird-top-down": photo({
    alt: "SR-71 Blackbird on display in a large museum hangar, seen from a high walkway",
    caption:
      "SR-71 Blackbird seen from above at the Steven F. Udvar-Hazy Center, Virginia.",
    credit: "Northern-Virginia-Photographer",
    group: "aircraft",
    height: 1600,
    id: "sr-71-blackbird-top-down",
    ...CC0,
    objectPosition: "55% 55%",
    sourceUrl: `${FILE}Sr-71_Blackbird_top-down_view.jpg`,
    title: "From above, Udvar-Hazy Center",
    vehicleId: "sr-71-blackbird",
    view: "museum",
    width: 2400,
  }),
  "sr-71-blackbird-nose": photo({
    alt: "SR-71 Blackbird seen nose-on in a museum hangar, its engine nacelles either side of the fuselage",
    caption:
      "SR-71 Blackbird seen nose-on at the Steven F. Udvar-Hazy Center, Virginia.",
    credit: "Northern-Virginia-Photographer",
    group: "aircraft",
    height: 1600,
    id: "sr-71-blackbird-nose",
    ...CC0,
    objectPosition: "50% 60%",
    sourceUrl: `${FILE}SR-71_Blackbird_Nosedown_View.jpg`,
    title: "Nose-on, Udvar-Hazy Center",
    vehicleId: "sr-71-blackbird",
    view: "museum",
    width: 2400,
  }),

  // Saturn V
  "saturn-v-rollout": photo({
    alt: "Saturn V and its red launch umbilical tower on the crawler-transporter, climbing the pad incline",
    caption:
      "The Apollo 11 Saturn V arriving at Launch Complex 39A on the crawler-transporter, May 1969.",
    credit: "NASA (Project Apollo Archive)",
    group: "rockets",
    height: 2880,
    id: "saturn-v-rollout",
    ...PD_NASA,
    objectPosition: "55% 50%",
    sourceUrl: `${FILE}Apollo_11_Saturn_V_climbs_the_pad_39-A_incline_during_rollout_(48276168412).jpg`,
    title: "Apollo 11 rollout",
    vehicleId: "saturn-v",
    view: "ground",
    width: 2334,
  }),
  "saturn-v-f-1-engines": photo({
    alt: "Black-and-white photograph of Wernher von Braun standing beside the five huge F-1 engine nozzles of a Saturn V first stage",
    caption:
      "Wernher von Braun beside the five F-1 engines of the Saturn V dynamic test vehicle at the U.S. Space and Rocket Center, Huntsville.",
    credit: "NASA",
    group: "rockets",
    height: 2880,
    id: "saturn-v-f-1-engines",
    ...PD_NASA,
    objectPosition: "40% 50%",
    sourceUrl: `${FILE}S-IC_engines_and_Von_Braun.jpg`,
    title: "Five F-1 engines",
    vehicleId: "saturn-v",
    view: "detail",
    width: 2318,
  }),
  "saturn-v-vab": photo({
    alt: "High view of a Saturn V on its launch tower emerging from the Vehicle Assembly Building",
    caption:
      "The Apollo 12 Saturn V leaving the Vehicle Assembly Building, September 1969.",
    credit: "NASA",
    group: "rockets",
    height: 2400,
    id: "saturn-v-vab",
    ...PD_NASA,
    objectPosition: "50% 45%",
    sourceUrl: `${FILE}Apollo_12_space_vehicle_leaving_the_Vehicle_Assembly_Building_(VAB).jpg`,
    title: "Apollo 12 leaving the VAB",
    vehicleId: "saturn-v",
    view: "ground",
    width: 1896,
  }),
  "saturn-v-pad-aerial": photo({
    alt: "Aerial view of a Saturn V standing on its pad, with the crawlerway and the Atlantic coast behind",
    caption:
      "The Apollo 8 Saturn V on Pad A, Launch Complex 39, December 1968.",
    credit: "NASA",
    group: "rockets",
    height: 1909,
    id: "saturn-v-pad-aerial",
    ...PD_NASA,
    objectPosition: "50% 45%",
    sourceUrl: `${FILE}Aerial_view_of_the_Apollo_8_Saturn-V.jpg`,
    title: "Apollo 8 on the pad",
    vehicleId: "saturn-v",
    view: "ground",
    width: 2400,
  }),

  // Falcon 9
  "falcon-9-crew-10": photo({
    alt: "Falcon 9 climbing over the launch pad, with its exhaust reflected in still water in the foreground",
    caption:
      "Falcon 9 launching NASA's SpaceX Crew-10 mission to the International Space Station, March 2025.",
    credit: "NASA/Aubrey Gemignani",
    group: "rockets",
    height: 1600,
    id: "falcon-9-crew-10",
    ...PD_NASA,
    objectPosition: "50% 45%",
    sourceUrl: `${FILE}A_Falcon_9_rocket_carrying_the_Dragon_spacecraft_is_launched_on_NASA’s_SpaceX_Crew-10_mission_to_the_International_Space_Station.jpg`,
    title: "Crew-10 launch",
    vehicleId: "falcon-9",
    view: "launch",
    width: 2400,
  }),
  "falcon-9-rollout": photo({
    alt: "Falcon 9 with a Dragon capsule being raised to vertical beside its launch tower",
    caption:
      "Falcon 9 and Dragon being raised to vertical at Space Launch Complex 40 before the Crew-9 mission, September 2024.",
    credit: "NASA/Keegan Barber",
    group: "rockets",
    height: 2400,
    id: "falcon-9-rollout",
    ...PD_NASA,
    objectPosition: "45% 50%",
    sourceUrl: `${FILE}NASA’s_SpaceX_Crew-9_Falcon_9-Dragon_Rollout_at_Space_Launch_C_(NHQ202409270002).jpg`,
    title: "Raised to vertical for Crew-9",
    vehicleId: "falcon-9",
    view: "ground",
    width: 1600,
  }),
  "falcon-9-landing": photo({
    alt: "Falcon 9 first stage touching down on a drone ship at sea, engine still firing",
    caption:
      "Falcon 9 first stage landing on a drone ship after launching CRS-8, April 2016.",
    credit: "SpaceX",
    group: "rockets",
    height: 1600,
    id: "falcon-9-landing",
    ...CC0,
    objectPosition: "50% 60%",
    sourceUrl: `${FILE}Falcon_9_first_stage_landing_on_Droneship.jpg`,
    title: "First stage landing after CRS-8",
    vehicleId: "falcon-9",
    view: "landing",
    width: 2400,
  }),

  // Falcon Heavy
  "falcon-heavy-pad": photo({
    alt: "Upper part of a Falcon Heavy on the pad, the payload fairing and two side booster nose cones beside the launch tower",
    caption:
      "Falcon Heavy with the Psyche spacecraft at Launch Complex 39A, October 2023.",
    credit: "NASA/Aubrey Gemignani",
    group: "rockets",
    height: 1600,
    id: "falcon-heavy-pad",
    ...PD_NASA,
    objectPosition: "40% 50%",
    sourceUrl: `${FILE}Psyche_on_the_Launch_Pad_(NHQ202310110004).jpg`,
    title: "Psyche on the pad",
    vehicleId: "falcon-heavy",
    view: "ground",
    width: 2400,
  }),
  "falcon-heavy-psyche-launch": photo({
    alt: "Falcon Heavy lifting off beside its launch tower, steam clouds spreading across the pad",
    caption:
      "Falcon Heavy launching the Psyche mission from Launch Complex 39A, October 2023.",
    credit: "NASA/Aubrey Gemignani",
    group: "rockets",
    height: 1600,
    id: "falcon-heavy-psyche-launch",
    ...PD_NASA,
    objectPosition: "60% 45%",
    sourceUrl: `${FILE}Psyche_Launch_(NHQ202310130003).jpg`,
    title: "Psyche launch",
    vehicleId: "falcon-heavy",
    view: "launch",
    width: 2400,
  }),

  // Space Launch System
  "space-launch-system-pad": photo({
    alt: "Space Launch System with Orion on top, standing beside its mobile launcher tower on the pad against a bright hazy sky",
    caption:
      "The Artemis I Space Launch System and Orion on the mobile launcher at Launch Complex 39B, April 2022.",
    credit: "NASA/Aubrey Gemignani",
    group: "rockets",
    height: 2400,
    id: "space-launch-system-pad",
    ...PD_NASA,
    objectPosition: "40% 45%",
    sourceUrl: `${FILE}Artemis_1_on_Launch_Pad_39B_(NHQ202204210007).jpg`,
    title: "Artemis I on the pad",
    vehicleId: "space-launch-system",
    view: "ground",
    width: 1600,
  }),
  "space-launch-system-hot-fire": photo({
    alt: "SLS core stage firing its engines in a test stand, a wall of steam billowing to the left",
    caption:
      "Hot fire test of the first SLS core stage in the B-2 Test Stand at Stennis Space Center, January 2021.",
    credit: "NASA/Robert Markowitz",
    group: "rockets",
    height: 1602,
    id: "space-launch-system-hot-fire",
    ...PD_NASA,
    objectPosition: "70% 50%",
    sourceUrl: `${FILE}Hot_Fire_Test_of_SLS_Rocket_Core_Stage_(NHQ202101160005).jpg`,
    title: "Core stage hot fire",
    vehicleId: "space-launch-system",
    view: "detail",
    width: 2400,
  }),

  // Starship
  "starship-full-stack": photo({
    alt: "Starship stacked on its Super Heavy booster beside the launch tower, with a Jeep in the foreground for scale",
    caption:
      "Starship SN20 on Super Heavy BN4, fully stacked at Starbase, Texas, with a Jeep for scale, March 2022.",
    credit: "Hotel Pika",
    group: "rockets",
    height: 2400,
    id: "starship-full-stack",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    objectPosition: "85% 50%",
    sourceUrl: `${FILE}Starship_full_stack_with_Jeep.jpg`,
    title: "Full stack with a Jeep",
    vehicleId: "starship",
    view: "ground",
    width: 1807,
  }),
  "starship-booster-catch": photo({
    alt: "Super Heavy booster descending beside the launch tower with its engines firing, under an orange sky",
    caption:
      "The Super Heavy booster being caught by the launch tower on Starship's fifth flight test, October 2024.",
    credit: "Steve Jurvetson",
    group: "rockets",
    height: 2400,
    id: "starship-booster-catch",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    objectPosition: "40% 45%",
    sourceUrl: `${FILE}Starship_Booster_Landing_on_Mechzilla_(54064036815).jpg`,
    title: "Booster catch, fifth flight test",
    vehicleId: "starship",
    view: "landing",
    width: 2140,
  }),
  "starship-booster-underside": photo({
    alt: "Group of visitors in hard hats looking up at the base of a Super Heavy booster and its engine mounts",
    caption:
      "NASA visitors under a Super Heavy booster at SpaceX, December 2021. The engine mounts and wiring are visible.",
    credit: "NASA",
    group: "rockets",
    height: 2400,
    id: "starship-booster-underside",
    ...PD_NASA,
    objectPosition: "50% 45%",
    sourceUrl: `${FILE}NASA_Marshall_visit_to_Super_Heavy_booster.jpg`,
    title: "Under a Super Heavy booster",
    vehicleId: "starship",
    view: "detail",
    width: 1600,
  }),
} as const satisfies Record<string, VehiclePhoto>;

type AdditionalPhotoId = keyof typeof additionalPhotos;

/* ------------------------------------------------------------------------ */
/* Identity photographs (card and profile), from the existing visual records */
/* ------------------------------------------------------------------------ */

/** Caption and view for each identity photograph, keyed by vehicle id. */
const identityCaptions: Record<
  string,
  {
    readonly caption: string;
    readonly title: string;
    readonly view: PhotoView;
  }
> = {
  "b-2-spirit": {
    caption: "B-2 Spirit over the Pacific Ocean, May 2006.",
    title: "Over the Pacific",
    view: "flight",
  },
  "f-15-eagle": {
    caption:
      "F-15C Eagle of the 44th Fighter Squadron on a training flight from Kadena Air Base, Japan, April 2019.",
    title: "Training flight, Kadena",
    view: "flight",
  },
  "f-22-raptor": {
    caption: "F-22 Raptor over Kadena Air Base, Japan, January 2009.",
    title: "Over Kadena",
    view: "flight",
  },
  "f-35-lightning-ii": {
    caption:
      "F-35A Lightning II above the Mojave Desert, California, on a test flight in January 2023.",
    title: "Above the Mojave Desert",
    view: "flight",
  },
  "sr-71-blackbird": {
    caption: "NASA SR-71B (NASA 831) over the Sierra Nevada, California.",
    title: "Over the Sierra Nevada",
    view: "flight",
  },
  "falcon-9": {
    caption:
      "Falcon 9 launching the Demo-2 mission from Launch Complex 39A, May 2020.",
    title: "Demo-2 launch",
    view: "launch",
  },
  "falcon-heavy": {
    caption:
      "Falcon Heavy launching Europa Clipper from Launch Complex 39A, October 2024.",
    title: "Europa Clipper launch",
    view: "launch",
  },
  "saturn-v": {
    caption:
      "The Apollo 11 Saturn V lifting off from Launch Complex 39A, 16 July 1969.",
    title: "Apollo 11 launch",
    view: "launch",
  },
  "space-launch-system": {
    caption:
      "Space Launch System launching Artemis II from Launch Complex 39B, April 2026.",
    title: "Artemis II launch",
    view: "launch",
  },
  starship: {
    caption: "Starship lifting off on its fifth flight test, October 2024.",
    title: "Fifth flight test lift-off",
    view: "launch",
  },
};

function identityPhoto(vehicleId: string): VehiclePhoto | undefined {
  const visual = getAircraftVisual(vehicleId) ?? getRocketVisual(vehicleId);
  const extra = identityCaptions[vehicleId];
  if (!visual || !extra) return undefined;
  return {
    alt: visual.alt,
    caption: extra.caption,
    credit: visual.credit,
    height: visual.height,
    id: visual.src.replace(/^.*\//, "").replace(/\.webp$/, ""),
    license: visual.license,
    licenseUrl: visual.licenseUrl,
    modifications: visual.modifications,
    objectPosition: visual.objectPosition,
    sourceUrl: visual.sourceUrl,
    src: visual.src,
    title: extra.title,
    vehicleId,
    view: extra.view,
    width: visual.width,
  };
}

/* ------------------------------------------------------------------------ */
/* Slot map                                                                  */
/* ------------------------------------------------------------------------ */

/** Per-vehicle slots that use their own file instead of the identity photograph. */
const vehicleSlotOverrides: Partial<
  Record<string, Partial<Record<VehiclePhotoSlot, AdditionalPhotoId>>>
> = {
  "b-2-spirit": {
    featured: "b-2-spirit-diego-garcia",
    profile: "b-2-spirit-takeoff",
  },
  "saturn-v": { featured: "saturn-v-rollout" },
};

/** Gallery views per vehicle profile, in display order (2 to 3 each). */
const galleries: Record<string, readonly AdditionalPhotoId[]> = {
  "b-2-spirit": ["b-2-spirit-refuel", "b-2-spirit-iceland"],
  "f-15-eagle": ["f-15-eagle-iceland", "f-15-eagle-takeoff", "f-15-eagle-taxi"],
  "f-22-raptor": ["f-22-raptor-taxi", "f-22-raptor-weapons-bay"],
  "f-35-lightning-ii": [
    "f-35-lightning-ii-hover",
    "f-35-lightning-ii-weapons-bay",
    "f-35-lightning-ii-hangar",
  ],
  "sr-71-blackbird": [
    "sr-71-blackbird-refuel",
    "sr-71-blackbird-top-down",
    "sr-71-blackbird-nose",
  ],
  "falcon-9": ["falcon-9-rollout", "falcon-9-crew-10", "falcon-9-landing"],
  "falcon-heavy": ["falcon-heavy-pad", "falcon-heavy-psyche-launch"],
  "saturn-v": ["saturn-v-vab", "saturn-v-pad-aerial"],
  "space-launch-system": [
    "space-launch-system-pad",
    "space-launch-system-hot-fire",
  ],
  starship: [
    "starship-full-stack",
    "starship-booster-catch",
    "starship-booster-underside",
  ],
};

const sitePhotos: Record<SitePhotoSlot, AdditionalPhotoId> = {
  about: "f-15-eagle-owens",
  "home-vehicles": "f-22-raptor-twilight",
  "learn-aerodynamics": "f-22-raptor-vapor",
  "learn-compressible-flow": "sr-71-blackbird-shock-diamonds",
  "learn-propulsion": "saturn-v-f-1-engines",
  "not-found": "f-22-raptor-hangar",
  og: "sr-71-blackbird-overhead",
};

/* ------------------------------------------------------------------------ */
/* Public API                                                                */
/* ------------------------------------------------------------------------ */

/**
 * The photograph for one vehicle slot: `card` (registry card), `profile`
 * (the vehicle's own profile hero) or `featured` (the registry hero on
 * `/aircraft` or `/rockets`; only B-2 and Saturn V have one).
 */
export function getVehiclePhoto(
  vehicleId: string,
  slot: VehiclePhotoSlot,
): VehiclePhoto | undefined {
  const override = vehicleSlotOverrides[vehicleId]?.[slot];
  if (override) return additionalPhotos[override];
  if (slot === "featured") return undefined;
  return identityPhoto(vehicleId);
}

/** The additional views shown on a vehicle profile, in order. */
export function getVehicleGallery(vehicleId: string): readonly VehiclePhoto[] {
  return (galleries[vehicleId] ?? []).map((id) => additionalPhotos[id]);
}

/** The photograph for a slot outside the vehicle pages. */
export function getSitePhoto(slot: SitePhotoSlot): VehiclePhoto {
  return additionalPhotos[sitePhotos[slot]];
}

/** Largest CSS size at which the file is still at least 1.0x at DPR 2. */
export function maxSharpCssSize(photo: Pick<VehiclePhoto, "height" | "width">) {
  return { height: photo.height / 2, width: photo.width / 2 } as const;
}

export interface PhotoUse {
  readonly photo: VehiclePhoto;
  /** Where it is used, for example "card, profile" or "gallery". */
  readonly slots: readonly PhotoSlotName[];
  readonly vehicleName: string;
}

const vehicleNames = new Map<string, string>(
  [...aircraftVehicles, ...rocketVehicles].map((vehicle) => [
    vehicle.id,
    vehicle.name,
  ]),
);

/** Display name for a vehicle id, for captions and credits. */
export function getVehicleName(vehicleId: string): string {
  return vehicleNames.get(vehicleId) ?? vehicleId;
}

/** Every slot name a photograph can fill, as `listPhotos` reports it. */
export type PhotoSlotName = SitePhotoSlot | VehiclePhotoSlot | "gallery";

/**
 * Slots that a page renders today. Credits lists only photographs in these
 * slots, so it never credits a file no page shows. A page team adds a slot
 * here in the same change that makes a page render it; the integration task
 * checks every slot listed is on screen.
 *
 * The vehicle pages render `card` (registry entries), `featured` (the
 * `/aircraft` and `/rockets` heroes), `profile` (profile heroes) and
 * `gallery` (profile galleries). Identity photographs are also credited
 * through `aircraft-visuals.ts` and `rocket-visuals.ts`; Credits skips
 * those here. The home page renders `home-vehicles`, /learn the three
 * `learn-*` slots, /about the `about` slot, the 404 page `not-found` and
 * the Open Graph and Twitter preview images `og`.
 */
export const PHOTO_SLOTS_IN_USE: ReadonlySet<PhotoSlotName> =
  new Set<PhotoSlotName>([
    "card",
    "featured",
    "profile",
    "gallery",
    "home-vehicles",
    "learn-aerodynamics",
    "learn-propulsion",
    "learn-compressible-flow",
    "about",
    "not-found",
    "og",
  ]);

/**
 * Every photograph file in the slot map, once each, with the slots it fills:
 * aircraft first, then launch vehicles, in registry order; within a vehicle
 * the identity photograph, then featured, profile, gallery and site slots.
 * With `inUseOnly`, only files that fill at least one slot in
 * `PHOTO_SLOTS_IN_USE` (for Credits).
 */
export function listPhotos(
  options: { readonly inUseOnly?: boolean } = {},
): readonly PhotoUse[] {
  const uses = new Map<
    string,
    { photo: VehiclePhoto; slots: PhotoSlotName[] }
  >();
  const add = (photo: VehiclePhoto | undefined, slot: PhotoSlotName) => {
    if (!photo) return;
    const entry = uses.get(photo.src) ?? { photo, slots: [] };
    entry.slots.push(slot);
    uses.set(photo.src, entry);
  };

  for (const vehicle of [...aircraftVehicles, ...rocketVehicles]) {
    add(getVehiclePhoto(vehicle.id, "card"), "card");
    add(getVehiclePhoto(vehicle.id, "profile"), "profile");
    add(getVehiclePhoto(vehicle.id, "featured"), "featured");
    for (const item of getVehicleGallery(vehicle.id)) add(item, "gallery");
    for (const [slot, id] of Object.entries(sitePhotos) as [
      SitePhotoSlot,
      AdditionalPhotoId,
    ][]) {
      const item = additionalPhotos[id];
      if (item.vehicleId === vehicle.id) add(item, slot);
    }
  }

  return [...uses.values()]
    .filter(
      ({ slots }) =>
        !options.inUseOnly ||
        slots.some((slot) => PHOTO_SLOTS_IN_USE.has(slot)),
    )
    .map(({ photo, slots }) => ({
      photo,
      slots,
      vehicleName: getVehicleName(photo.vehicleId),
    }));
}

/** The default change recorded for a photograph; Credits lists only others. */
export const DEFAULT_PHOTO_MODIFICATIONS = RESIZED;
