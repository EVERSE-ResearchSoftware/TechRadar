// export const DIMENSION_PALETTE = [
//     '#ef4444', // Red 500
//     '#f97316', // Orange 500
//     '#f59e0b', // Amber 500
//     '#84cc16', // Lime 500
//     '#10b981', // Emerald 500
//     '#14b8a6', // Teal 500
//     '#06b6d4', // Cyan 500
//     '#3b82f6', // Blue 500
//     '#6366f1', // Indigo 500
//     '#8b5cf6', // Violet 500
//     '#d946ef', // Fuchsia 500
//     '#f43fc4ff', // Rose 500,
//     '#ff006aff', // 
// ];

export const DIMENSION_PALETTE = [
    "#2563EB", // Blue
    "#DC2626", // Red
    "#16A34A", // Green
    "#F59E0B", // Amber
    "#7C3AED", // Violet
    "#DB2777", // Pink
    "#0891B2", // Cyan
    "#65A30D", // Lime
    "#EA580C", // Orange
    "#4F46E5", // Indigo
    "#0D9488", // Teal
    "#A21CAF"  // Purple
];


// colorblind safe set
// export const DIMENSION_PALETTE = [
//     "#1D6FA4",
//     "#C0392B",
//     "#1A7A4A",
//     "#7B3FA0",
//     "#C96A00",
//     "#007B8A",
//     "#B5390C",
//     "#2E5BA8",
//     "#5A7A00",
//     "#8B1A5E",
//     "#1F6B61",
//     "#4A4A9E",
// ];


export const getDimensionColor = (dimName, allDimensions) => {
    const index = allDimensions.indexOf(dimName);
    if (index === -1) return '#94a3b8'; // Default slate
    return DIMENSION_PALETTE[index % DIMENSION_PALETTE.length];
};
