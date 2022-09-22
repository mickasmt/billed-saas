/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");

      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    // test d'intégration GET
    // describe("Given I am a user connected as Admin", () => {
    //   describe("When I navigate to Dashboard", () => {
    //     test("fetches bills from mock API GET", async () => {
    //       localStorage.setItem(
    //         "user",
    //         JSON.stringify({ type: "Admin", email: "a@a" })
    //       );
    //       const root = document.createElement("div");
    //       root.setAttribute("id", "root");
    //       document.body.append(root);
    //       router();
    //       window.onNavigate(ROUTES_PATH.Dashboard);
    //       await waitFor(() => screen.getByText("Validations"));
    //       const contentPending = await screen.getByText("En attente (1)");
    //       expect(contentPending).toBeTruthy();
    //       const contentRefused = await screen.getByText("Refusé (2)");
    //       expect(contentRefused).toBeTruthy();
    //       expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
    //     });
    //     describe("When an error occurs on API", () => {
    //       beforeEach(() => {
    //         jest.spyOn(mockStore, "bills");
    //         Object.defineProperty(window, "localStorage", {
    //           value: localStorageMock,
    //         });
    //         window.localStorage.setItem(
    //           "user",
    //           JSON.stringify({
    //             type: "Admin",
    //             email: "a@a",
    //           })
    //         );
    //         const root = document.createElement("div");
    //         root.setAttribute("id", "root");
    //         document.body.appendChild(root);
    //         router();
    //       });
    //       test("fetches bills from an API and fails with 404 message error", async () => {
    //         mockStore.bills.mockImplementationOnce(() => {
    //           return {
    //             list: () => {
    //               return Promise.reject(new Error("Erreur 404"));
    //             },
    //           };
    //         });
    //         window.onNavigate(ROUTES_PATH.Dashboard);
    //         await new Promise(process.nextTick);
    //         const message = await screen.getByText(/Erreur 404/);
    //         expect(message).toBeTruthy();
    //       });

    //       test("fetches messages from an API and fails with 500 message error", async () => {
    //         mockStore.bills.mockImplementationOnce(() => {
    //           return {
    //             list: () => {
    //               return Promise.reject(new Error("Erreur 500"));
    //             },
    //           };
    //         });

    //         window.onNavigate(ROUTES_PATH.Dashboard);
    //         await new Promise(process.nextTick);
    //         const message = await screen.getByText(/Erreur 500/);
    //         expect(message).toBeTruthy();
    //       });
    //     });
    //   });
    // });
  });

  describe('When I click on new bill button', () => {
    test(('Then, I should be sent to new bill page'), () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage
      })

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill)
      
      const btnNewBill = screen.getByTestId('btn-new-bill')
      expect(btnNewBill).toBeTruthy()

      btnNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(btnNewBill)
      
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
});
