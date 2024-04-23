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
      showToolbar: false,
      items: toolbar,
      element: document.getElementById("toolbar-dom-id"),
    },
  },
  document.getElementById("lightsheet"),
);
