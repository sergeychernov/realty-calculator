export function mapRoomsToCount(rooms?: string): string | undefined {
	if (!rooms) return undefined;
	const value = rooms.trim().toLowerCase();
	if (value === "студия" || value === "studio") return "9";
	if (value === "5+" || value === "5plus" || value === "5") return "5";
	if (["1", "2", "3", "4"].includes(value)) return value;
	return undefined;
}


