import Lightsheet from "./src/main.ts";
var data = [
  ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
  ["2", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
  ["3", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
];

new Lightsheet(document.getElementById("lightsheet"), {
  data,
  onCellChange: (colIndex, rowIndex, newValue) => {
    console.log(colIndex, rowIndex, newValue);
  },
  isReadOnly: false,
});
