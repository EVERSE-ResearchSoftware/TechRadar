export const DIMENSION_PALETTE = [
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#f59e0b', // Amber 500
    '#84cc16', // Lime 500
    '#10b981', // Emerald 500
    '#06b6d4', // Cyan 500
    '#3b82f6', // Blue 500
    '#6366f1', // Indigo 500
    '#8b5cf6', // Violet 500
    '#d946ef', // Fuchsia 500
    '#f43f5e', // Rose 500
];

export const getDimensionColor = (dimName, allDimensions) => {
    const index = allDimensions.indexOf(dimName);
    if (index === -1) return '#94a3b8'; // Default slate
    return DIMENSION_PALETTE[index % DIMENSION_PALETTE.length];
};
