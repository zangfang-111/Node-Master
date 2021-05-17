import { Request, Response } from "express";
import { Sequelize, Op, OrderItem, literal } from "sequelize";
import moment, { unitOfTime } from "moment";

import { admin } from "../../services/firebase";
import { getTxHistory, getTxDetail, currentBTCPrice, convertSatoshToBtc } from "../../services/bws";
import { User, Transactions } from "../../models";
import { UserResponse, TransactionFilter, UserStatus, SentTransaction } from "../../types/admin";
import { SupportedOrderType, UserEntity } from "../../types";
import { PaymentStatus } from "../../types";
import { upperCase } from "../../utils/userUtils";

/**
 * Get user list
 */
export const getUserList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, transfer_sort, date_sort, page, per_page } = req.query;

    let whereStatement: any = {};
    let orderStatement: OrderItem[] = [];
    let limitNumber;
    let offsetNumber;

    if (search) {
      whereStatement = {
        [Op.or]: [
          {
            firstName: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            lastName: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ],
      };
    }

    // Date sort => Most recent: desc, Least recent: asc
    if (date_sort) {
      orderStatement.push(["createdAt", date_sort as string]);
    }
    // Transfer sort => High - Low: desc, Low - High: asc
    if (transfer_sort) {
      orderStatement.push([literal('"transactionCount"'), transfer_sort as string]);
    }

    if (page && per_page) {
      limitNumber = Number(per_page as string);
      offsetNumber = (Number(page as string) - 1) * Number(per_page as string);
    }

    const queryResult = await User.findAll({
      where: whereStatement,
      attributes: [
        "User.*",
        [
          literal('(SELECT COUNT(*) FROM "Transactions" WHERE "Transactions"."UserId" = "User".id)'),
          "transactionCount",
        ],
      ],
      limit: limitNumber,
      offset: offsetNumber,
      order: orderStatement,
      raw: true,
    });

    const userList: UserResponse[] = queryResult.map((user: User) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      uuid: user.uuid,
      email: user.email,
      walletAddress: user.walletAddress,
      phoneNumber: user.phoneNumber,
      verified: !!user.emailVerified && !!user.phoneVerified,
      location: `${user.city || ""} ${user.country || ""}`,
      status: user.status,
      createdAt: user.createdAt,
      transactions: user.transactionCount,
    }));

    res.json(userList);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get a user by Id
 * @param req
 * @param res
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { stats } = req.query;

    if (!id) {
      throw new Error("User Id is required!");
    }

    // Get a user by ID
    const where = { where: { id } };
    const user = await User.findOne(where);

    if (!user) {
      throw new Error("This user does not exist in our db.");
    }

    // Transaction Stats
    const dateType: unitOfTime.StartOf = <unitOfTime.StartOf>stats; // enum - [day, week, month, year]
    const when = { [Op.gte]: moment().startOf(dateType).format("YYYY-MM-DD hh:mm:ss") };

    const successTrans = await Transactions.count({
      where: {
        UserId: user.id,
        updatedAt: when,
        status: PaymentStatus.APPROVED,
      },
    });
    const declineTrans = await Transactions.count({
      where: {
        UserId: user.id,
        updatedAt: when,
        status: PaymentStatus.DECLINED,
      },
    });
    const pendingTrans = await Transactions.count({
      where: {
        UserId: user.id,
        updatedAt: when,
        status: PaymentStatus.PENDING,
      },
    });

    // Transaction chart history yearly
    const whereYear = {
      [Op.gte]: moment().subtract(1, "years").format("YYYY-MM-DD hh:mm:ss"),
    };

    const currentTransfers = await Transactions.count({
      where: {
        UserId: user.id,
        status: PaymentStatus.APPROVED,
        updatedAt: { [Op.gte]: moment().startOf("month").format("YYYY-MM-DD hh:mm:ss") },
      },
    });
    const history = await Transactions.findAll({
      attributes: [
        [Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("fiatAmount")), "counts"],
      ],
      where: {
        UserId: user.id,
        updatedAt: whereYear,
        status: PaymentStatus.APPROVED,
      },
      group: [Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt"))],
      order: Sequelize.fn("date_trunc", "month", Sequelize.col("updatedAt")),
    });

    res.json({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phoneNumber: user.phoneNumber,
        verified: !!user.emailVerified && !!user.phoneVerified,
        location: `${user.city || ""} ${user.country || ""}`,
        walletAddress: user.walletAddress,
        uuid: user.uuid,
        status: user.status,
      },
      stats: {
        success: successTrans,
        decline: declineTrans,
        pending: pendingTrans,
      },
      currentTransfers,
      transferHistory: history,
    });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Get a user transactions
 * @param req
 * @param res
 */
export const getUserTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const { type, amount_sort, date_sort } = req.query;
    if (!id) {
      throw new Error("User Id is required!");
    }

    // Get a user by ID
    const where = { where: { id } };
    const user = await User.findOne(where);

    if (!user) {
      throw new Error("This user does not exist in our db.");
    }

    // Transactions Data
    let transactions;
    if (upperCase(type as string) === SupportedOrderType.BUY) {
      let orderStatement: OrderItem[] = [];

      if (amount_sort) {
        orderStatement.push(["fiatAmount", amount_sort as string]);
      }

      if (date_sort) {
        orderStatement.push(["updatedAt", date_sort as string]);
      }
      const queryResult = await Transactions.findAll({
        where: {
          UserId: user.id,
          status: { [Op.not]: PaymentStatus.SUBMITTED },
        },
        order: orderStatement,
        include: {
          association: Transactions.associations.User,
        },
      });

      transactions = queryResult.map((cur: Transactions) => ({
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
    } else if (upperCase(type as string) === SupportedOrderType.SEND) {
      // Get the current BTC price from CoinGecko
      const btcPrice = await currentBTCPrice({});
      // Response of TX History
      const res = await getTxHistory(user.walletAddress);
      const histories: any[] = JSON.parse(res);
      let txs: SentTransaction[] = [];
      for (const history of histories) {
        // TX details
        const tx = await getTxDetail(history.mintTxid);
        txs.push(JSON.parse(tx));
      }
      // transactions
      transactions = txs.map((tx: SentTransaction) => {
        const feePair = convertSatoshToBtc(tx.fee, btcPrice);
        const amountPair = convertSatoshToBtc(tx.value, btcPrice);
        return {
          recipient: `${user.firstName} ${user.lastName}`,
          txid: tx.txid,
          network: tx.network,
          chain: tx.chain,
          blockHash: tx.blockHash,
          txDate: moment.utc(tx.blockTime).format("YYYY-MM-DDTHH:mm:ssZ"),
          feeFiatAmount: feePair.fiat,
          feeCryptoAmount: feePair.crypto,
          fiatAmount: amountPair.fiat,
          cryptoAmount: amountPair.crypto,
          status: tx.confirmations > 1 ? "Approved" : "Pending",
          currency: "USD",
        };
      });
    } else {
      throw new Error("Wrong transaction type!");
    }
    res.send(transactions);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Admin updates the user details.
 * @param req
 * @param res
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error("User Id is required!");
    }
    const where = { where: { id } };
    // Get a user from DB
    const user = await User.findOne(where);

    if (!user) {
      throw new Error("This user does not exist in our db.");
    }

    const { firstName, lastName, country, city, homeAddress, email, phoneNumber } = req.body;
    const newEntity: UserEntity = {};

    if (!!firstName) {
      newEntity.firstName = firstName;
    }
    if (!!lastName) {
      newEntity.lastName = lastName;
    }
    if (!!country) {
      newEntity.country = country;
    }
    if (!!city) {
      newEntity.city = city;
    }
    if (!!homeAddress) {
      newEntity.homeAddress = homeAddress;
    }
    if (!!email) {
      newEntity.email = email;
    }
    if (!!phoneNumber) {
      newEntity.phoneNumber = phoneNumber;
    }

    const firebaseEntity: { email?: string; phoneNumber?: string } = {};
    if (!!newEntity.email && newEntity.email !== user.email) {
      firebaseEntity.email = newEntity.email;
      newEntity.emailVerified = false;
    }

    if (!!newEntity.phoneNumber && newEntity.phoneNumber !== user.phoneNumber) {
      firebaseEntity.phoneNumber = newEntity.phoneNumber;
      newEntity.phoneVerified = false;
    }

    // Update Firebase User
    if (Object.keys(firebaseEntity).length !== 0) {
      // Get a user by email from firebase
      const firebaseUser = await admin.auth().getUserByEmail(user.email);
      await admin.auth().updateUser(firebaseUser.uid, firebaseEntity);
    }

    let updatedUser = null;
    // Update user table
    if (Object.keys(newEntity).length !== 0) {
      await User.update(newEntity, { where: { id: user.id } });
      updatedUser = await User.findOne({ where: { id: user.id } });
    }

    res.json(updatedUser);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Admin suspend a user.
 * @param req
 * @param res
 */
export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error("User Id is required!");
    }
    const where = { where: { id } };
    // Get a user from DB
    const user = await User.findOne(where);

    if (!user) {
      throw new Error("This user does not exist in our db.");
    }

    // Get a user by email from firebase
    const firebaseUser = await admin.auth().getUserByEmail(user.email);
    await admin.auth().updateUser(firebaseUser.uid, { disabled: true });

    // Update a user in db
    await User.update({ status: !!UserStatus.Suspended }, where);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};

/**
 * Admin delete a user
 * @param req
 * @param res
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      throw new Error("User Id is required!");
    }
    const where = { where: { id } };
    // Get a user from DB
    const user = await User.findOne(where);

    if (!user) {
      throw new Error("This user does not exist in our db.");
    }

    // Get a user by email from firebase
    const firebaseUser = await admin.auth().getUserByEmail(user.email);
    // Delete a user from Firebase
    await admin.auth().deleteUser(firebaseUser.uid);
    // Delete a user from DB
    await User.destroy(where);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
};
