import Lightsheet from "./src/main.ts";
var data = [
  ["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing", "3120"],
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
const toolbar = [
  {
    type: "i",
    content: "undo",
  },
  {
    type: "i",
    content: "redo",
  },
  {
    type: "i",
    content: "save",
  },
  {
    type: "i",
    content: "format_align_left",
    k: "text-align",
    v: "left",
  },
  {
    type: "i",
    content: "format_align_center",
    k: "text-align",
    v: "center",
  },
  {
    type: "i",
    content: "format_align_right",
    k: "text-align",
    v: "right",
  },
  {
    type: "i",
    content: "format_bold",
    k: "font-weight",
    v: "bold",
  },
  {
    type: "i",
    content: "format_italic",
  },
  {
    type: "i",
    content: "format_underlined",
  },
  {
    type: "i",
    content: "strikethrough_s",
  },
  {
    type: "i",
    content: "border_all",
  },
  {
    type: "i",
    content: "vertical_align_bottom",
  },
  {
    type: "i",
    content: "format_text_wrap",
  },
  {
    type: "color",
    content: "format_color_text",
    k: "color",
  },
  {
    type: "color",
    content: "format_color_fill",
    k: "background-color",
  },
];
new Lightsheet(document.getElementById("lightsheet"), {
  data,
  columns,
  toolbar,
  onCellChange: (colIndex, rowIndex, newValue) => {
    console.log(colIndex, rowIndex, newValue);
  },
});
