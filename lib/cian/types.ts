export interface CianSummary {
	object: {
		title: string;
		address: string;
		roomsLabel: string;
		areaLabel: string;
		areaSqm: number | null;
	};
	marketPrice: {
		averageRangeText: string;
		averageRange: { min: number | null; max: number | null; currency: 'RUB'; unit: 'million' };
		averageDescription: string;
		averageValueMillionRub: number | null;
		changePercentText: string;
		changePercent: number | null;
		changeDescription: string;
	};
	ui: {
		hasPreciseFilters: boolean;
	};
	allTestIds: Record<string, string | string[]>;
	meta: {
		fetchedAt: string;
	};
}


export interface CianHouse {
	title: string;
	rows: Array<{ name: string; value: string }>;
	parsed: {
		yearBuilt: number | null;
		houseType: string | null;
		series: string | null;
		ceilingHeightMeters: number | null;
		gasSupply: boolean | null;
		heating: string | null;
		slabType: string | null;
		entrancesCount: number | null;
		elevatorsPassenger: number | null;
		elevatorsFreight: number | null;
		apartmentsCount: number | null;
		renovation: boolean | null;
		emergency: boolean | null;
		playground: boolean | null;
		sportsGround: boolean | null;
	};
	meta: {
		fetchedAt: string;
	};
}


