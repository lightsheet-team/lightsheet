import Lightsheet from "./src/main.ts";
var data = [
  ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
  ["2.44445", "400000.000000", "img/nophoto.jpg", "Marketing", "3120"],
  ["3.555555", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
];

const toolbar = ["undo", "redo", "save"];

const ls = new Lightsheet(
  {
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
        format: { type: "number", options: { decimal: 2 } },
      },
      {
        position: "B2",
        css: "background-color: yellow;",
        format: { type: "currency", options: { name: "EUR", decimal: 2 } },
      },
      {
        position: "3",
        css: "background-color: blue;",
        format: { type: "number", options: { decimal: 0 } },
      },
    ],
  },
  document.getElementById("lightsheet")
);

ls.clearFormatter("A2");
