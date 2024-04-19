import Lightsheet from "./src/main.ts";
var data = [
  ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
  ["2", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
  ["3", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
];

const toolbar = ["undo", "redo", "save"];
//
new Lightsheet(document.getElementById("lightsheet"), {
  data,
  onCellChange: (colIndex, rowIndex, newValue) => {
    console.log(colIndex, rowIndex, newValue);
  },
  toolbarOptions: {
    showToolbar: false,
    items: toolbar,
    element: document.getElementById("toolbar-dom-id"),
  },
  style: [
    {
      position: "A",
      css: "font-weight: bold;",
      format: { type: "number", option: { decimal: 2 } },
    },
    {
      position: "B2",
      css: "background-color: yellow;",
      format: { type: "currency", option: { name: "EUR", decimal: 2 } },
    },
    {
      position: "3",
      css: "background-color: blue;",
      format: { type: "currency", option: { name: "EUR", decimal: 2 } },
    },
  ],
});
