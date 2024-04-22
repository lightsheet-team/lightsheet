import LightSheet from "../main";
import {
  generateColumnKey,
  generateRowKey,
} from "../core/structure/key/keyTypes";
import { CellIdInfo, Coordinate, SelectionContainer } from "./render.types.ts";
import LightsheetEvent from "../core/event/event.ts";
import {
  CoreSetCellPayload,
  UISetCellPayload,
} from "../core/event/events.types.ts";
import EventType from "../core/event/eventType.ts";
import LightSheetHelper from "../../utils/helpers.ts";
import { ToolbarOptions } from "../main.types";
import { ToolbarItems } from "../../utils/constants.ts";

export default class UI {
  tableEl: Element;
  toolbarDom: HTMLElement | undefined;
  formulaBarDom!: HTMLElement;
  formulaInput!: HTMLInputElement;
  selectedCellDisplay!: HTMLElement;
  tableHeadDom: Element;
  tableBodyDom: Element;
  lightSheet: LightSheet;
  selectedRowNumberCell: HTMLElement | null = null;
  selectedHeaderCell: HTMLElement | null = null;
  selectedCellsContainer: SelectionContainer;
  toolbarOptions: ToolbarOptions;
  isReadOnly: boolean;
  singleSelectedCell: Coordinate | undefined;

  constructor(
    el: Element,
    lightSheet: LightSheet,
    toolbarOptions?: ToolbarOptions,
  ) {
    this.tableEl = el;
    this.lightSheet = lightSheet;
    this.selectedCellsContainer = {
      selectionStart: null,
      selectionEnd: null,
    };
    this.singleSelectedCell = undefined;
    this.registerEvents();
    this.toolbarOptions = {
      showToolbar: false,
      element: undefined,
      items: ToolbarItems,
      ...toolbarOptions,
    };
    this.isReadOnly = lightSheet.options.isReadOnly || false;

    this.tableEl.classList.add("lightsheet_table_container");

    /*toolbar*/
    this.createToolbar();

    /*content*/
    const lightSheetContainerDom = document.createElement("div");
    this.tableEl.appendChild(lightSheetContainerDom);

    this.createFormulaBar(lightSheetContainerDom);

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

  createToolbar() {
    if (
      !this.toolbarOptions.showToolbar ||
      this.toolbarOptions.items?.length == 0
    )
      return;
    //Element
    this.toolbarDom = document.createElement("div");
    this.toolbarDom.classList.add("lightsheet_table_toolbar");

    if (this.toolbarOptions.element != null) {
      this.toolbarOptions.element.appendChild(this.toolbarDom);
    } else {
      this.tableEl.insertBefore(this.toolbarDom, this.tableEl.firstChild);
    }

    for (let i = 0; i < this.toolbarOptions.items!.length; i++) {
      const toolbarItem = document.createElement("i");
      toolbarItem.classList.add("lightSheet_toolbar_item");
      toolbarItem.classList.add("material-symbols-outlined");
      toolbarItem.textContent = this.toolbarOptions.items![i];
      this.toolbarDom.appendChild(toolbarItem);
    }
  }

  removeToolbar() {
    if (this.toolbarDom) this.toolbarDom.remove();
  }

  showToolbar(isShown: boolean) {
    this.toolbarOptions.showToolbar = isShown;
    if (isShown) {
      this.createToolbar();
    } else {
      this.removeToolbar();
    }
  }

  createFormulaBar(lightSheetContainerDom: HTMLDivElement) {
    if (this.isReadOnly) {
      return;
    }
    this.formulaBarDom = document.createElement("div");
    this.formulaBarDom.classList.add("lightsheet_table_formula_bar");
    lightSheetContainerDom.appendChild(this.formulaBarDom);

    //selected cell display element
    this.selectedCellDisplay = document.createElement("div");
    this.selectedCellDisplay.classList.add("lightsheet_selected_cell_display");
    this.formulaBarDom.appendChild(this.selectedCellDisplay);

    //"fx" label element
    const fxLabel = document.createElement("div");
    fxLabel.textContent = "fx";
    fxLabel.classList.add("lightsheet_fx_label");
    this.formulaBarDom.appendChild(fxLabel);

    //formula input
    this.formulaInput = document.createElement("input");
    this.formulaInput.classList.add("lightsheet_formula_input");
    this.formulaBarDom.appendChild(this.formulaInput);
    this.setFormulaBar();
  }

  setFormulaBar() {
    this.formulaInput.addEventListener("input", () => {
      const newValue = this.formulaInput.value;
      const selectedCellInput = document.querySelector(
        ".lightsheet_table_selected_cell input",
      ) as HTMLInputElement;
      if (selectedCellInput) {
        selectedCellInput.value = newValue;
      }
    });
    this.formulaInput.addEventListener("keyup", (event) => {
      const newValue = this.formulaInput.value;
      if (event.key === "Enter") {
        if (this.singleSelectedCell) {
          const colIndex = this.singleSelectedCell.columnPosition;
          const rowIndex = this.singleSelectedCell.rowPosition;
          this.onUICellValueChange(newValue, colIndex, rowIndex);
        }
        this.formulaInput.blur();
        const previouslySelectedCell = document.querySelector(
          ".lightsheet_table_selected_cell",
        );
        if (previouslySelectedCell) {
          previouslySelectedCell.classList.remove(
            "lightsheet_table_selected_cell",
          );
        }
      }
    });
    this.formulaInput.onblur = () => {
      const newValue = this.formulaInput.value;
      if (this.singleSelectedCell) {
        const colIndex = this.singleSelectedCell.columnPosition;
        const rowIndex = this.singleSelectedCell.rowPosition;
        this.onUICellValueChange(newValue, colIndex, rowIndex);
      }
    };
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

      if (i > 0) {
        headerCellDom.onclick = (e: MouseEvent) => {
          const selectedColumn = e.target as HTMLElement;
          if (!selectedColumn) return;
          const prevSelection = this.selectedHeaderCell;
          this.removeGroupSelection();

          if (prevSelection !== selectedColumn) {
            selectedColumn.classList.add(
              "lightsheet_table_selected_row_number_header_cell",
            );
            this.selectedHeaderCell = selectedColumn;
            Array.from(this.tableBodyDom.children).forEach((childElement) => {
              // Code inside the forEach loop
              childElement.children[i].classList.add(
                "lightsheet_table_selected_row_column",
              );
            });
          }
        };
      }
    }
  }

  createRowElement(labelCount: number): HTMLElement {
    const rowDom = document.createElement("tr");
    const rowNumberCell = document.createElement("td");
    rowNumberCell.innerHTML = `${labelCount + 1}`; // Row numbers start from 1
    rowNumberCell.classList.add(
      "lightsheet_table_row_number",
      "lightsheet_table_row_cell",
      "lightsheet_table_td",
    );
    rowDom.appendChild(rowNumberCell);
    rowNumberCell.onclick = (e: MouseEvent) => {
      const selectedRow = e.target as HTMLElement;
      if (!selectedRow) return;
      const prevSelection = this.selectedRowNumberCell;
      this.removeGroupSelection();

      if (prevSelection !== selectedRow) {
        selectedRow.classList.add(
          "lightsheet_table_selected_row_number_header_cell",
        );
        this.selectedRowNumberCell = selectedRow;

        const parentElement = selectedRow.parentElement;
        if (parentElement) {
          for (let i = 1; i < parentElement.children.length; i++) {
            const childElement = parentElement.children[i];
            if (childElement !== selectedRow) {
              childElement.classList.add(
                "lightsheet_table_selected_row_column",
              );
            }
          }
        }
      }
    };
    return rowDom;
  }

  addRow(rowIndex: number): HTMLElement {
    const rowDom = this.createRowElement(rowIndex);
    rowDom.id = `row_${rowIndex}`; // TODO ID should be unique (see getElementInfoForSetCell).
    this.tableBodyDom.appendChild(rowDom);
    return rowDom;
  }

  getRow(rowKey: string): HTMLElement | null {
    return document.getElementById(rowKey);
  }

  addCell(rowDom: Element, colIndex: number, rowIndex: number): HTMLElement {
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
    inputDom.readOnly = this.isReadOnly;
    cellDom.appendChild(inputDom);

    inputDom.addEventListener("input", (e: Event) => {
      const newValue = (e.target as HTMLInputElement).value;
      this.formulaInput.value = newValue;
    });

    inputDom.onchange = (e: Event) =>
      this.onUICellValueChange(
        (e.target as HTMLInputElement).value,
        colIndex,
        rowIndex,
      );

    inputDom.onfocus = () => {
      inputDom.value = inputDom.getAttribute("rawValue") ?? "";
      this.removeGroupSelection();

      const previouslySelectedInput = document.querySelector(
        ".lightsheet_table_selected_cell",
      );
      if (previouslySelectedInput) {
        previouslySelectedInput.classList.remove(
          "lightsheet_table_selected_cell",
        );
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
        const columnKey = keyParts[0];
        const rowKey = cellDom.parentElement?.id;

        columnIndex = this.lightSheet.sheet.getColumnIndex(
          generateColumnKey(columnKey!),
        );
        rowIndex = this.lightSheet.sheet.getRowIndex(generateRowKey(rowKey!));
      }
      this.singleSelectedCell = {
        columnPosition: Number(columnIndex),
        rowPosition: Number(rowIndex),
      };

      if (this.formulaBarDom) {
        this.formulaInput.value = inputDom.getAttribute("rawValue")!;
      }
    };

    inputDom.onblur = () => {
      inputDom.value = inputDom.getAttribute("resolvedValue") ?? "";
    };

    inputDom.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        inputDom.blur();
        cellDom.classList.remove("lightsheet_table_selected_cell");
      }
    });

    return cellDom;
  }

  setReadOnly(readonly: boolean) {
    const inputElements = this.tableBodyDom.querySelectorAll("input");
    inputElements.forEach((input) => {
      (input as HTMLInputElement).readOnly = readonly;
    });
    this.isReadOnly = readonly;
  }

  onUICellValueChange(rawValue: string, colIndex: number, rowIndex: number) {
    const payload: UISetCellPayload = {
      indexPosition: { columnIndex: colIndex, rowIndex: rowIndex },
      rawValue: rawValue,
    };
    this.lightSheet.events.emit(
      new LightsheetEvent(EventType.UI_SET_CELL, payload),
    );
  }

  private registerEvents() {
    this.lightSheet.events.on(EventType.CORE_SET_CELL, (event) => {
      this.onCoreSetCell(event);
    });
  }

  private onCoreSetCell(event: LightsheetEvent) {
    const payload = event.payload as CoreSetCellPayload;
    // Get HTML elements and (new) IDs for the payload's cell and row.
    const elInfo = LightSheetHelper.getElementInfoForSetCell(payload);

    if (!elInfo.rowDom) {
      const row = this.addRow(payload.indexPosition.rowIndex);
      elInfo.rowDom = row;
      row.id = elInfo.rowDomId;
    }
    if (!elInfo.cellDom) {
      elInfo.cellDom = this.addCell(
        elInfo.rowDom!,
        payload.indexPosition.columnIndex,
        payload.indexPosition.rowIndex,
      );
    }

    elInfo.cellDom.id = elInfo.cellDomId;
    elInfo.rowDom.id = elInfo.rowDomId;

    // Update input element with values from the core.
    const inputEl = elInfo.cellDom.firstChild! as HTMLInputElement;
    inputEl.setAttribute("rawValue", payload.rawValue);
    inputEl.setAttribute("resolvedValue", payload.formattedValue);
    inputEl.value = payload.formattedValue;
  }

  private checkCellId(cellDom: Element): CellIdInfo | undefined {
    const keyParts = cellDom.id.split("_");
    if (keyParts.length != 2) return;

    const isIndex = keyParts[0].match("^[0-9]+$") !== null;

    return { keyParts: keyParts, isIndex: isIndex };
  }

  removeGroupSelection() {
    this.removeColumnSelection();
    this.removeRowSelection();
  }

  removeRowSelection() {
    if (!this.selectedRowNumberCell) return;

    this.selectedRowNumberCell.classList.remove(
      "lightsheet_table_selected_row_number_header_cell",
    );
    const parentElement = this.selectedRowNumberCell.parentElement;
    if (parentElement) {
      for (let i = 1; i < parentElement.children.length; i++) {
        const childElement = parentElement.children[i];
        if (childElement !== this.selectedRowNumberCell) {
          childElement.classList.remove("lightsheet_table_selected_row_column");
        }
      }
    }

    this.selectedRowNumberCell = null;
  }

  removeColumnSelection() {
    if (!this.selectedHeaderCell) return;

    this.selectedHeaderCell.classList.remove(
      "lightsheet_table_selected_row_number_header_cell",
    );
    for (const childElement of this.tableBodyDom.children) {
      Array.from(childElement.children).forEach((element: Element) => {
        element.classList.remove("lightsheet_table_selected_row_column");
      });
    }

    this.selectedHeaderCell = null;
  }
}
