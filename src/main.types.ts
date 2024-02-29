export type LightSheetOptions = {
    data: any[],
    columns: LightSheetColumn[],
    onCellChange?: (colIndex: number, rowIndex: number, value: any) => {}
}

type LightSheetColumn =
    { type: string, title: string, name: string }
