import { createRouter, createWebHistory } from "vue-router";

import ProductPage from "../views/ProductPage.vue";
import CheckoutPage from "../views/CheckoutPage.vue";
import SummaryPage from "../views/SummaryPage.vue";
import StatusPage from "../views/StatusPage.vue";

const routes = [
    { path: "/", name: "product", component: ProductPage },
    { path: "/checkout", name: "checkout", component: CheckoutPage },
    { path: "/summary", name: "summary", component: SummaryPage },
    { path: "/status/:id", name: "status", component: StatusPage, props: true },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;