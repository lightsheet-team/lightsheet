export const GenerateRowLabel = (rowIndex: number) => {
  let label = "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (rowIndex > 0) {
    rowIndex--; // Adjust index to start from 0
    label = alphabet[rowIndex % 26] + label;
    rowIndex = Math.floor(rowIndex / 26);
  }
  return label || "A"; // Return "A" if index is 0
};
