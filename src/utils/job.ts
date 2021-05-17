import moment from "moment";

import { createEvents, deleteEvents } from "../services/simplex";
import { Transactions } from "../models";
import { getStatus } from "./statusUtils";
import logger from "./logger";
import { PaymentStatus, SimplexEvent } from "../types";

/**
 * Schedule Handler
 */
const scheduleHandler = async () => {
  logger.info(`JOB TRIGGERED AT 🔥 ${moment().toISOString()} 🔥`);

  try {
    const res: string = await createEvents();
    const { events } = JSON.parse(res);

    logger.info(`NUMBER OF EVENTS FOUND 🤞 => ${events.length}`);
    console.log(JSON.stringify(events));

    // Cancel jobs if no events created
    if (events.length > 0) {
      const sorted = events.sort(
        (a: SimplexEvent, b: SimplexEvent) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const promises = sorted.map(async (event: SimplexEvent) => {
        const { event_id, name, payment } = event;
        const { id, fiat_total_amount, crypto_total_amount } = payment;

        const transaction = await Transactions.findOne({ where: { paymentId: id } });

        // Mapping simplex status to our payment status
        const status = getStatus(name);

        if (transaction) {
          // Remove unfinished transaction
          if (transaction.status === PaymentStatus.SUBMITTED && status === PaymentStatus.DECLINED) {
            await transaction.destroy();
          } else {
            await transaction.update({
              status,
              fiatAmount: fiat_total_amount.amount,
              fiatCurrency: fiat_total_amount.currency,
              cryptoAmount: crypto_total_amount.amount,
              cryptoCurrency: crypto_total_amount.currency,
            });
          }
          logger.info(`TRANSACTION (${id}) HAS BEEN UPDATED! 🙌 `);
        }

        logger.info(`BEING DELETED EVENT ID ${event_id}`);

        // Delete the event when the payment status is resolved
        await deleteEvents(event_id);

        logger.info("ALL EVENTS HAVE BEEN HANDLED! WELL DONE 👍");
        return event_id;
      });

      await Promise.allSettled(promises);
    }
  } catch (e) {
    logger.debug(`ERROR FOUND 😱 : ${e.message}`);
  }
};

export default scheduleHandler;
