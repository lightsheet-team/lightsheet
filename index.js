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
  "undo",
  "redo",
  "save",
  "format_bold",
  "format_italic",
  "format_color_text",
  "format_color_fill",
  "format_underlined",
  "strikethrough_s",
  "border_all",
  "format_align_center",
  "vertical_align_bottom",
  "format_text_wrap",
];

new Lightsheet(document.getElementById("lightsheet"), {
  data,
  columns,
  toolbarOptions: {
    showToolbar: true,
    items: toolbar,
    element: document.getElementById("toolbar-dom-id"),
  },
});
