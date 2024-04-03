import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";
import { CellIdInfo } from "./render.types.ts";

export default class UI {
  tableEl: Element;
  tableHeadDom: Element;
  tableBodyDom: Element;
  rowCount: number;
  colCount: number;
  lightSheet: LightSheet;
  selectedCell: number[] | undefined;
  selectedRowNumberCell: HTMLElement | null = null;
  selectedHeaderCell: HTMLElement | null = null;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    rowCount: number,
    colCount: number,
  ) {
    this.tableEl = el;
    this.colCount = colCount;
    this.rowCount = rowCount;
    this.lightSheet = lightSheet;
    this.selectedCell = [];

    this.tableEl.classList.add("lightsheet_table_container");

    const lightSheetContainerDom = document.createElement("div");
    lightSheetContainerDom.classList.add("lightsheet_table_content");
    this.tableEl.appendChild(lightSheetContainerDom);

    const tableContainerDom = document.createElement("table");
    tableContainerDom.classList.add("lightsheet_table");
    tableContainerDom.setAttribute("cellpadding", "0");
    tableContainerDom.setAttribute("cellspacing", "0");
    tableContainerDom.setAttribute("unselectable", "yes");
    lightSheetContainerDom.appendChild(tableContainerDom);

    //thead
    this.tableHeadDom = document.createElement("thead");
    tableContainerDom.appendChild(this.tableHeadDom);

    //tbody
    this.tableBodyDom = document.createElement("tbody");
    tableContainerDom.appendChild(this.tableBodyDom);
  }

  addHeader(headerData: string[]) {
    const headerRowDom = document.createElement("tr");
    this.tableHeadDom.appendChild(headerRowDom);

    for (let i = 0; i < headerData.length; i++) {
      const headerCellDom = document.createElement("td");
      headerCellDom.classList.add(
        "lightsheet_table_header",
        "lightsheet_table_td",
      );
      headerCellDom.textContent = headerData[i];
      headerRowDom.appendChild(headerCellDom);

      if(i > 0) {
        headerCellDom.onclick = (e: MouseEvent) => {
          const selectedColumn = e.target as HTMLElement;
          if (!selectedColumn) return;
          
          if (this.selectedRowNumberCell) {
            this.removeRowSelection();
          }
          if (this.selectedHeaderCell) {
            this.removeColumnSelection();
          } 
          if(this.selectedHeaderCell === selectedColumn){
            this.removeColumnSelection();
            this.selectedHeaderCell = null;
          }else {
            selectedColumn.classList.add("lightsheet_table_selected_row_number_header_cell");
            this.selectedHeaderCell = selectedColumn;
  
            // const cellIdInfo = this.checkCellId(selectedColumn);
            // console.log(selectedColumn.id);
  
            Array.from(this.tableBodyDom.children).forEach((childElement) => {
              // Code inside the forEach loop
              childElement.children[i].classList.add("lightsheet_table_selected_row_column");
            });
          }
        };
      }
    }
  }

  addRow(rowLabelNumber: number): Element {
    const rowDom = document.createElement("tr");
    this.tableBodyDom.appendChild(rowDom);

    //row number
    const rowNumberCell = document.createElement("td");
    rowNumberCell.innerHTML = `${rowLabelNumber + 1}`; // Row numbers start from 1
    rowNumberCell.classList.add(
      "lightsheet_table_row_number",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    rowDom.appendChild(rowNumberCell); // Append the row number cell to the row

    rowNumberCell.onclick = (e: MouseEvent) => {
      const selectedRow = e.target as HTMLElement; 
      if (!selectedRow) return;
      
      if (this.selectedRowNumberCell) {
        this.removeRowSelection();
      }
      if (this.selectedHeaderCell) {
        this.removeColumnSelection();
      }

      if(this.selectedRowNumberCell === selectedRow){
        this.removeRowSelection();
        this.selectedRowNumberCell = null;
      } else {
        selectedRow.classList.add("lightsheet_table_selected_row_number_header_cell");
        this.selectedRowNumberCell = selectedRow;
        
        const parentElement = selectedRow.parentElement;
        if (parentElement) {
            for (let i = 1; i < parentElement.children.length; i++) {
                const childElement = parentElement.children[i];
                if (childElement !== selectedRow) {
                    childElement.classList.add("lightsheet_table_selected_row_column");
                }
            }
        }
      }
    };

    return rowDom;
  }

  addColumn(
    rowDom: Element,
    colIndex: number,
    rowIndex: number,
    value: any,
    columnKey?: string,
  ) {
    const cellDom = document.createElement("td");
    cellDom.classList.add(
      "lightsheet_table_cell",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    rowDom.appendChild(cellDom);
    cellDom.id = `${colIndex}_${rowIndex}`;
    const inputDom = document.createElement("input");
    inputDom.classList.add("lightsheet_table_cell_input");
    inputDom.value = "";

    cellDom.appendChild(inputDom);

    if (value) {
      cellDom.id = `${columnKey}_${rowDom.id}`;
      inputDom.value = value;
    }

    inputDom.onchange = (e: Event) =>
      this.onCellValueChange(
        (e.target as HTMLInputElement).value,
        rowDom,
        cellDom,
        colIndex,
        rowIndex,
      );

    inputDom.onfocus = () => {
      if(this.selectedRowNumberCell) {
        this.removeRowSelection();
      }

      if(this.selectedHeaderCell) {
        this.removeColumnSelection();
      }

      cellDom.classList.add("lightsheet_table_selected_cell");

      let columnIndex: number | undefined;
      let rowIndex: number | undefined;

      const cellIdInfo = this.checkCellId(cellDom);
      if (!cellIdInfo) return;
      const { keyParts, isIndex } = cellIdInfo;

      if (isIndex) {
        columnIndex = Number(keyParts[0]);
        rowIndex = Number(keyParts[1]);
      } else {
        const columnKey = cellDom.id;
        const rowKey = cellDom.parentElement?.id;

        columnIndex = this.lightSheet.sheet.getColumnIndex(
          generateColumnKey(columnKey!),
        );
        rowIndex = this.lightSheet.sheet.getRowIndex(generateRowKey(rowKey!));
      }
      this.selectedCell?.push(Number(columnIndex), Number(rowIndex));
    };

    inputDom.onblur = () => {
      this.selectedCell = [];
      cellDom.classList.remove("lightsheet_table_selected_cell");
    };
  }

  onCellValueChange(
    newValue: string,
    rowDom: Element,
    cellDom: Element,
    colIndex: number,
    rowIndex: number,
  ) {
    const cellIdInfo = this.checkCellId(cellDom);
    if (!cellIdInfo) return;
    const { keyParts, isIndex } = cellIdInfo;
    if (keyParts.length != 2) return;

    let cell;
    // If the key parts are integers, we need to create a cell in core and update ui with new keys.
    if (isIndex) {
      cell = this.lightSheet.setCellAt(colIndex, rowIndex, newValue);
      // Keys will be valid as value shouldn't be empty at this point.
      rowDom.id = cell.position.rowKey!.toString();
      cellDom.id = `${cell.position.columnKey!.toString()}_${cell.position.rowKey!.toString()}`;
    } else {
      cell = this.lightSheet.setCell(keyParts[0], keyParts[1], newValue);
      // The row may be deleted if the cell is cleared.
      if (!cell.position.rowKey) {
        rowDom.id = `row_${rowIndex}`;
      }
      // Empty cells should not hold a column key.
      if (newValue == "") {
        cellDom.id = `${colIndex}_${rowIndex}`;
      }
    }
    // Set cell value to resolved value from the core.
    // TODO Cell formula should be preserved. (Issue #49)
    (cellDom.firstChild! as HTMLInputElement).value = cell.value!;

    //fire cell onchange event to client callback
    this.lightSheet.onCellChange?.(colIndex, rowIndex, newValue);
  }

  checkCellId(cellDom: Element): CellIdInfo | undefined {
    const keyParts = cellDom.id.split("_");
    if (keyParts.length != 2) return;

    const isIndex = keyParts[0].match("^[0-9]+$") !== null;

    return { keyParts: keyParts, isIndex: isIndex };
  }

  removeRowSelection() {
    this.selectedRowNumberCell?.classList.remove("lightsheet_table_selected_row_number_header_cell");
        const parentElement = this.selectedRowNumberCell?.parentElement;
        if (parentElement) {
            for (let i = 1; i < parentElement.children.length; i++) {
                const childElement = parentElement.children[i];
                if (childElement !== this.selectedRowNumberCell) {
                    childElement.classList.remove("lightsheet_table_selected_row_column");
                }
            }
        }
  }

  removeColumnSelection() {
    this.selectedHeaderCell?.classList.remove("lightsheet_table_selected_row_number_header_cell");
    for(const childElement of this.tableBodyDom.children) {
      Array.from(childElement.children).forEach((element: Element) => {
        element.classList.remove("lightsheet_table_selected_row_column");
      });
    }
  }
}
