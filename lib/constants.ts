export const NG_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

// Country-keyed so pan-African expansion is additive
export const COUNTRY_CONFIG: Record<
  string,
  { currency: string; dialCode: string; states: string[] }
> = {
  NG: { currency: "NGN", dialCode: "234", states: NG_STATES },
};

export const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? 3);
