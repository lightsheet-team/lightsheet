import Lightsheet from "./src/main.ts";
var data = [
  ["1", "=1+2/3*6", "img/nophoto.jpg", "Marketing", "3120"],
  ["2", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
  ["3", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],
];
const columns = [
  {
    title: "Id",
    type: "autonumber",
    name: "id",
    readOnly: true,
    primaryKey: true,
    width: "80px",
  },
  {
    title: "Name",
    type: "text",
    name: "name",
    width: "140px",
  },
  {
    title: "Photo",
    type: "image",
    name: "img",
    width: "80px",
    render: "round",
  },
  {
    title: "Department",
    type: "text",
    name: "department",
    width: "180px",
    source: ["Marketing", "Accounts", "General"],
  },
  {
    title: "Extension",
    name: "extension",
    width: "120px",
  },
];
new Lightsheet(document.getElementById("lightsheet"), {
  data,
  columns,
  onCellChange: (colIndex, rowIndex, newValue) => {
    console.log(colIndex, rowIndex, newValue);
  },
});
