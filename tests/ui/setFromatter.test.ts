import LightSheet from "../../src/main";

describe("LightSheet", () => {
    let targetElementMock: HTMLElement;

    beforeEach(() => {
        window.sheetHolder?.clear();
        targetElementMock = document.createElement("div");
        document.body.appendChild(targetElementMock);
    });

    afterEach(() => {
        document.body.removeChild(targetElementMock);
    });

    test("Should be able to render table based on provided formatters", () => {

        new LightSheet(
            {
                data: [["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
                ["2.44445", "400000.000000", "img/nophoto.jpg", "Marketing", "3120"],
                ["3.555555", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],],
                sheetName: "Sheet",
                style: [
                    {
                        position: "A",
                        css: "font-weight: bold;",
                        format: { type: "number", options: { decimal: 2 } },
                    },
                ]
            },
            targetElementMock,
        );

        const tableBody = targetElementMock.querySelector("tbody");
        if (!tableBody) {
            // If tbody is not found, fail the test or log an error
            fail("tbody element not found in the table.");
        }
        expect((tableBody.rows[1].children[1].children[0] as HTMLInputElement).value).toEqual("2.44")
    });

    test("Should be able to set formatter to existing table", () => {
        const ls = new LightSheet(
            {
                data: [["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
                ["2.44445", "400000.000000", "img/nophoto.jpg", "Marketing", "3120"],
                ["3.555555", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],],
                sheetName: "Sheet",
            },
            targetElementMock,
        );
        ls.setFormatting("A2", { type: "number", options: { decimal: 2 } })

        const tableBody = targetElementMock.querySelector("tbody");
        if (!tableBody) {
            // If tbody is not found, fail the test or log an error
            fail("tbody element not found in the table.");
        }
        expect((tableBody.rows[1].children[1].children[0] as HTMLInputElement).value).toEqual("2.44")
    });

    test("Should be able to clear formatter to from table", () => {
        const ls = new LightSheet(
            {
                data: [["1", "=1+2/3*6+A1+test(1,2)", "img/nophoto.jpg", "Marketing"],
                ["2.44445", "400000.000000", "img/nophoto.jpg", "Marketing", "3120"],
                ["3.555555", "Jorge", "img/nophoto.jpg", "Marketing", "3120"],],
                sheetName: "Sheet",
                style: [
                    {
                        position: "A",
                        css: "font-weight: bold;",
                        format: { type: "number", options: { decimal: 2 } },
                    },
                ]
            },
            targetElementMock,
        );
        ls.clearFormatter("A")

        const tableBody = targetElementMock.querySelector("tbody");
        if (!tableBody) {
            // If tbody is not found, fail the test or log an error
            fail("tbody element not found in the table.");
        }

        expect((tableBody.rows[1].children[1].children[0] as HTMLInputElement).value).toEqual("2.44445")
    });
})