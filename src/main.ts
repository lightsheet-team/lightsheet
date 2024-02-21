import { renderHtml } from './ui/render.ts'
import sheet from './core/sheet.ts'
import { LightSheetOptions } from './main.types.ts';

export default class main {
  tableEl: any;
  options: LightSheetOptions;
  constructor(targetElement: Element | HTMLDocument, options: LightSheetOptions) {
    this.options = options;
    if (!(targetElement instanceof Element || targetElement instanceof HTMLDocument)) {
      console.error('Jspreadsheet: el is not a valid DOM element');
    }
    this.tableEl = targetElement;
    this.prepareTable();
  }

  prepareTable() {
    let size = this.options.columns.length;
    if (this.options.data && typeof this.options.data[0] !== 'undefined') {
      // Data keys
      var keys = Object.keys(this.options.data[0]);

      if (keys.length > size) {
        size = keys.length;
      }
    }

    for (let i = 0; i < size; i++) {
      if (!this.options.columns[i]) {
        this.options.columns[i] = { type: 'text', name: '', title: '' };
      } else if (!this.options.columns[i].type) {
        this.options.columns[i].type = 'text';
      }

      if (!this.options.columns[i].title) {
        this.options.columns[i].title = '';
      }
    }


    this.createTable();

  }

  createTable() {
    const tableDom = document.createElement('table');
    const theadDom = document.createElement('thead');
    const tBodyDom = document.createElement('tbody');

    let headerContainer = document.createElement('tr');

    for (let i = 0; i < this.options.columns.length; i++) {
      const cell = document.createElement('th');
      cell.innerHTML = this.options.columns[i].title
      // Append cell to the container
      headerContainer.appendChild(cell);
    }
    theadDom.appendChild(headerContainer);
    tableDom.appendChild(theadDom)
    this.tableEl.appendChild(tableDom)

    for (let row = 0; row < this.options.data.length; row++) {
      const rowDom = document.createElement('tr');
      for (let col = 0; col < this.options.columns.length; col++) {
        const cell = document.createElement('td');
        cell.innerHTML = this.options.data[row][this.options.columns[col].name]
        rowDom.appendChild(cell)
      }
      tBodyDom.appendChild(rowDom)
    }
    tableDom.appendChild(tBodyDom)
  }

}
