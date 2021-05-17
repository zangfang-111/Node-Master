import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";
import moment, { unitOfTime } from "moment";

import { User, Transactions } from "../../models";
import { PaymentStatus } from "../../types";

/**
 * Get dashboard users info
 */
export const getUsersInfo = async (req: Request, res: Response): Promise<void> => {
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
    const currentMonthUsers = await User.count({ where: { createdAt: whereMonth } });
    const lastMonthUsers = await User.count({ where: { createdAt: whereLastMonth } });

    let userPercent = 0;
    if (lastMonthUsers !== 0) {
      userPercent = Number((((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100).toFixed(2));
    } else if (currentMonthUsers !== 0) {
      userPercent = 100;
    }

    const history = await User.findAll({
      attributes: [
        [Sequelize.fn("date_trunc", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "count"],
      ],
      where: { updatedAt: whereYear },
      group: [Sequelize.fn("date_trunc", "month", Sequelize.col("createdAt"))],
      order: Sequelize.fn("date_trunc", "month", Sequelize.col("createdAt")),
    });

    res.json({
      currentMonth: currentMonthUsers,
      percent: userPercent,
      history: history,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get dashboard transaction info
 */
export const getTransactionsInfo = async (req: Request, res: Response): Promise<void> => {
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
    const currentMonthAmounts = await Transactions.count({ where: { updatedAt: whereMonth } });
    const lastMonthAmounts = await Transactions.count({ where: { updatedAt: whereLastMonth } });

    let transactionPercent = 0;
    if (lastMonthAmounts !== 0) {
      transactionPercent = Number((((currentMonthAmounts - lastMonthAmounts) / lastMonthAmounts) * 100).toFixed(2));
    } else if (currentMonthAmounts !== 0) {
      transactionPercent = 100;
    }

    const history = await Transactions.findAll({
      attributes: [
        [Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("fiatAmount")), "counts"],
      ],
      where: { updatedAt: whereYear },
      group: [Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt"))],
      order: Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")),
    });

    res.json({
      currentMonth: currentMonthAmounts,
      percent: transactionPercent,
      history: history,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get dashboard stats
 */
export const getStatsInfo = async (req: Request, res: Response): Promise<void> => {
  const type: unitOfTime.StartOf = <unitOfTime.StartOf>req.params.type; // enum - [day, week, month, year]
  const when = { [Op.gte]: moment().startOf(type).format("YYYY-MM-DD hh:mm:ss") };

  try {
    const successTrans = await Transactions.count({
      where: {
        updatedAt: when,
        status: PaymentStatus.APPROVED,
      },
    });
    const declineTrans = await Transactions.count({
      where: {
        updatedAt: when,
        status: PaymentStatus.DECLINED,
      },
    });
    const pendingTrans = await Transactions.count({
      where: {
        updatedAt: when,
        status: PaymentStatus.PENDING,
      },
    });
    const results = await Transactions.findAll({
      where: {
        status: { [Op.not]: PaymentStatus.SUBMITTED },
      },
      order: [["updatedAt", "desc"]],
      limit: 10,
      offset: 0,
      include: {
        association: Transactions.associations.User,
      },
    });
    const lastTransfers = results.map((cur: Transactions) => ({
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

    res.json({
      success: successTrans,
      decline: declineTrans,
      pending: pendingTrans,
      lastTransfers,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};
