export type DadataAddressData = {
  geo_lat?: string;
  geo_lon?: string;
  [key: string]: unknown;
};

export type DadataSuggestion = {
  value?: string;
  unrestricted_value?: string;
  data?: DadataAddressData;
};

export type DadataResponse = {
  suggestions?: DadataSuggestion[];
  [key: string]: unknown;
};


