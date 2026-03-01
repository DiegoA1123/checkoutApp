import { createStore } from "vuex";

const STORAGE_KEY = "checkout_state";

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persistPlugin(store: any) {
    store.subscribe((_mutation: any, state: any) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    });
}

export default createStore({
    plugins: [persistPlugin],

    state: () =>
        loadState() || {
            products: [],
            selectedProduct: null,

            customer: { fullName: "", email: "", phone: "" },
            delivery: { address: "", city: "", notes: "" },

            card: { number: "", expMonth: "", expYear: "", cvc: "", holder: "" },

            transaction: {
                id: null,
                reference: null,
                totalAmountCents: 0,
                breakdown: null,
                status: null,
            },

            step: 1,
            error: null,
        },

    mutations: {
        setProducts(state, products) {
            state.products = products;
        },
        setSelectedProduct(state, product) {
            state.selectedProduct = product;
        },
        setCustomer(state, payload) {
            state.customer = { ...state.customer, ...payload };
        },
        setDelivery(state, payload) {
            state.delivery = { ...state.delivery, ...payload };
        },
        setCard(state, payload) {
            state.card = { ...state.card, ...payload };
        },
        setTransaction(state, payload) {
            state.transaction = { ...state.transaction, ...payload };
        },
        setStatus(state, status) {
            state.transaction.status = status;
        },
        resetFlow(state) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        },
    },
});