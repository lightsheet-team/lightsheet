export type LightSheetOptions = {
    data: any[],
    columns: LightSheetColumn[]
}

type LightSheetColumn =
    { type: string, title: string, name: string }
