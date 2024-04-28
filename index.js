import Lightsheet from "./src/main.ts";
var data = [
  ["", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
  ["2", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
  ["3", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
];

const toolbar = ["undo", "redo", "save"];

new Lightsheet(
  {
    sheetName: "Sheet1",
    data,
    onCellChange: (colIndex, rowIndex, newValue) => {
      console.log(colIndex, rowIndex, newValue);
    },
    toolbarOptions: {
      showToolbar: true,
      items: toolbar,
    },
    style: [
      {
        position: "A",
        css: "font-weight: bold;",
        format: { type: "number", options: { decimal: 0 } },
      },
      {
        position: "3",
        css: "background-color: yellow;",
        format: { type: "currency", options: { name: "EUR", decimal: 2 } },
      },
      {
        position: "B",
        css: "background-color: blue;",
        format: { type: "number", options: { decimal: 0 } },
      },
    ],
  },
  document.getElementById("lightsheet"),
);
