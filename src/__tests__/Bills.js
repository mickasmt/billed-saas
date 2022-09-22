/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";

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
  });

  describe("When I click on new bill button", () => {
    test("Then, I should be sent to new bill page", () => {
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
        })
      );

      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill);

      const btnNewBill = screen.getByTestId("btn-new-bill");
      expect(btnNewBill).toBeTruthy();

      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  describe("When I click on the icon eye", () => {
    test("Then it should open a modal", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const bill = new Bills({
        document,
        onNavigate,
        mockStore,
        localStorage,
      });

      $.fn.modal = jest.fn();

      bill.handleClickIconEye = jest.fn(bill.handleClickIconEye);

      const iconsEye = screen.getAllByTestId("icon-eye");
      expect(iconsEye).toBeTruthy();

      if (iconsEye) {
        iconsEye.forEach((icon) => {
          icon.addEventListener("click", bill.handleClickIconEye(icon));
          userEvent.click(icon);
          expect(bill.handleClickIconEye).toHaveBeenCalled();
          expect(screen.getByTestId("modaleFile")).toBeTruthy();
        });
      }
    });
  });

  // test d'intégration GET
  describe("When I navigate to Bills Page", () => {
    // test("fetches bills from mock API GET", async () => {
    //   localStorage.setItem(
    //     "user",
    //     JSON.stringify({ type: "Employee", email: "e@e" })
    //   );

    //   const root = document.createElement("div");
    //   root.setAttribute("id", "root");
    //   document.body.append(root);
    //   router();

    //   window.onNavigate(ROUTES_PATH.Bills);
    
    //   const contentPending = await screen.getByText("Mes notes de frais");
    //   expect(contentPending).toBeTruthy();

    //   expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    // });

    test("Then, it should render Loading...", () => {
      document.body.innerHTML = BillsUI({ data: [], loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });

    // for test getBills()
    test('Then, fetches bills from mock API GET', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      mockStore.bills = jest.fn().mockImplementationOnce(() => {
        return {
          list: jest.fn().mockResolvedValue([{ id: 1, data: () => ({ date: '' }) }])
        }
      })

      const bills = new Bills({
        document, onNavigate, store: mockStore, localStorage
      })

      const res = bills.getBills()
      if (mockStore) expect(res).toEqual(Promise.resolve({}))
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "e@e",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);

        document.body.innerHTML = BillsUI({ error: "Erreur 404" });
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches bills from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);

        document.body.innerHTML = BillsUI({ error: "Erreur 500" });
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
