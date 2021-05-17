import { Request, Response } from "express";
import { Sequelize, Op, OrderItem } from "sequelize";
import moment from "moment";

import { Transactions, User } from "../../models";
import { PaymentStatus } from "../../types";
import { TransactionSum, TransactionStatistics, TransactionFilter } from "../../types/admin";

/**
 * Get transaction statistics
 */
export const getTransactionsStatistics = async (req: Request, res: Response): Promise<void> => {
  const whereMonth = {
    [Op.gte]: moment().startOf("month").format("YYYY-MM-DD hh:mm:ss"),
  };
  const whereYear = {
    [Op.gte]: moment().subtract(1, "years").format("YYYY-MM-DD hh:mm:ss"),
  };
  const whereLastMonth = {
    [Op.between]: [
      moment().subtract(1, "months").startOf("month").format("YYYY-MM-DD hh:mm:ss"),
      moment().subtract(1, "months").endOf("month").format("YYYY-MM-DD hh:mm"),
    ],
  };

  try {
    const currentMonthAmounts = await Transactions.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", Sequelize.col("fiatAmount")), "amount"]],
      where: { updatedAt: whereMonth },
      group: "status",
      raw: true,
    });

    const lastMonthAmounts = await Transactions.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", Sequelize.col("fiatAmount")), "amount"]],
      where: { updatedAt: whereLastMonth },
      group: "status",
      raw: true,
    });

    let statistics: TransactionStatistics[] = [];

    for (const status of Object.values(PaymentStatus)) {
      if (status !== PaymentStatus.SUBMITTED) {
        // Exclude SUBMITED Status
        let currentMonth: TransactionSum = currentMonthAmounts.filter((c) => c.status === status)[0];
        let lastMonth: TransactionSum = lastMonthAmounts.filter((c) => c.status === status)[0];
        let currentAmount = currentMonth ? currentMonth.amount : 0;
        let lastAmount = lastMonth ? lastMonth.amount : 0;
        let percent = 0;
        if (lastAmount !== 0) {
          percent = Number((((currentAmount - lastAmount) / lastAmount) * 100).toFixed(2));
        } else if (currentAmount !== 0) {
          percent = 100;
        }
        const history = await Transactions.findAll({
          attributes: [
            [Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")), "month"],
            [Sequelize.fn("COUNT", Sequelize.col("fiatAmount")), "counts"],
          ],
          where: { updatedAt: whereYear, status },
          group: [Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")), "status"],
          order: Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")),
        });

        statistics.push({
          status: status,
          current: currentAmount,
          percent: percent,
          history,
        });
      }
    }

    res.json({
      statistics,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get individual transaction detail
 */
export const getTransactionDetail = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const transaction = await Transactions.findOne({
      where: { id },
      include: {
        association: Transactions.associations.User,
      },
    });
    if (transaction) {
      res.json({
        id: transaction.id,
        accountName: `${transaction.User.firstName} ${transaction.User.lastName}`,
        transactionId: transaction.transactionId,
        paymentId: transaction.paymentId,
        orderId: transaction.orderId,
        status: transaction.status,
        fiatAmount: transaction.fiatAmount,
        fiatCurrency: transaction.fiatCurrency,
        cryptoAmount: transaction.cryptoAmount,
        cryptoCurrency: transaction.cryptoCurrency,
        toWalletAddress: transaction.toWalletAddress,
        updatedAt: transaction.updatedAt,
      });
    } else {
      res.status(400).json({
        error: "No transaction found!",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get individual transaction list
 */
export const getTransactionList = async (req: Request, res: Response): Promise<void> => {
  const { filter, sort, pagination } = req.body;
  let whereStatement: TransactionFilter = {};
  let orderStatement: OrderItem[] = [];
  let limitNumber;
  let offsetNumber;

  if (filter) {
    if (filter.id) {
      whereStatement.id = filter.id;
    }
    if (filter.status) {
      whereStatement.status = filter.status;
    }
    if (filter.type) {
      whereStatement.orderType = filter.type;
    }
  }

  // Amount sort => High - Low: desc, Low - High: asc
  if (sort && sort.amount) {
    orderStatement.push(["fiatAmount", sort.amount]);
  }

  // // Date sort => Most recent: desc, Least recent: asc
  if (sort && sort.date) {
    orderStatement.push(["updatedAt", sort.date]);
  }

  if (pagination && pagination.count && pagination.number) {
    limitNumber = pagination.count;
    offsetNumber = (pagination.number - 1) * pagination.count;
  }

  try {
    // Run queries
    const queryResult = await Transactions.findAll({
      where: {
        ...whereStatement,
        status: { [Op.not]: PaymentStatus.SUBMITTED },
      },
      order: orderStatement,
      limit: limitNumber,
      offset: offsetNumber,
      include: {
        association: Transactions.associations.User,
      },
    });

    const transactions = queryResult.map((cur: Transactions) => ({
      id: cur.id,
      accountName: `${cur.User.firstName} ${cur.User.lastName}`,
      transactionId: cur.transactionId,
      paymentId: cur.paymentId,
      orderId: cur.orderId,
      status: cur.status,
      fiatAmount: cur.fiatAmount,
      fiatCurrency: cur.fiatCurrency,
      cryptoAmount: cur.cryptoAmount,
      cryptoCurrency: cur.cryptoCurrency,
      toWalletAddress: cur.toWalletAddress,
      updatedAt: cur.updatedAt,
    }));
    res.json(transactions);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};
