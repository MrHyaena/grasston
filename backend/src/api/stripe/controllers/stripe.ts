/**
 * stripe controller
 */

const stripe = require("stripe")(process.env.STRIPE_SECRET);
const strapi = require("@strapi/strapi");

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::stripe.stripe",
  ({ strapi }) => ({
    async getCheckoutSession(ctx) {
      const data = JSON.parse(ctx.request.body);
      let url =
        process.env.API_SERVER + `/api/stripe/success/${data.documentId}`;

      try {
        //Creating STRIPE checkout session
        const session = await stripe.checkout.sessions.create({
          success_url: url,
          ui_mode: "hosted",
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "CZK",
                product_data: {
                  name: "Objednávka - 5 % celkové ceny objednávky",
                },
                unit_amount: data.payNowPrice * 100,
              },
              quantity: 1,
            },
          ],
        });
        console.log(session);

        ctx.body = session;
      } catch (err) {
        ctx.body = err;
      }
    },
    async checkoutSessionSuccess(ctx) {
      let params = ctx.request["params"];

      const strapiResponse = await fetch(
        process.env.API_SERVER + `/api/orders/${params.orderid}`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_READONLY_API}`,
          },
        }
      );
      const json: any = await strapiResponse.json();
      const orderInformation = JSON.parse(json.data.orderInformation);
      const rentalItems = JSON.parse(json.data.rentalItems);
      const additionalItems = JSON.parse(json.data.additionalItems);

      console.log(orderInformation);
      //ctx.response.redirect(process.env.API_WEB + "/dekujeme");
    },
  })
);
