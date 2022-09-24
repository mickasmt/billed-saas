/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then form should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const formNewBill = screen.getAllByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });
  });

  // tests for input file
  describe("When I upload an image file in form", () => {
    document.body.innerHTML = NewBillUI();
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "empl@test.com",
      })
    );

    test("Then the file extension should be correct", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const fileInput = screen.getByTestId("file");
      expect(fileInput).toBeTruthy();

      fileInput.addEventListener("change", handleChangeFile);

      //fire event
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["imgTest.png"], "imgTest.png", { type: "image/png" }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(fileInput.files[0].name).toBe("imgTest.png");
    });

    test("Then the file shouldn't been sent if it has a wrong extension", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      const fileInput = screen.getByTestId("file");
      expect(fileInput).toBeTruthy();

      fileInput.addEventListener("change", handleChangeFile);

      //fire event
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["imgTest.webp"], "imgTest.webp", { type: "image/webp" }),
          ],
        },
      });

      expect(handleChangeFile).toHaveBeenCalled();
      // file input is empty if file extension is wrong
      expect(fileInput.value).toBe("");
    });

    test("Then I should submit the form", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);

      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);

      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
