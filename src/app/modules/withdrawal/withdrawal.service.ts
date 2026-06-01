
import mongoose from 'mongoose';
import Stripe from 'stripe';
import httpStatus from 'http-status';

import AppError from '../../error/AppError';
import { BalanceModel } from '../Balance/balance.model';
import { WithdrawalModel } from './withdrawal.model';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
);

const MIN_WITHDRAWAL_AMOUNT = 10;

export class WithdrawalService {
  static async requestWithdrawal(
    userId: string,
    amount: number,
  ) {
    if (!amount || amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT}`,
      );
    }

    const balance = await BalanceModel.findOneAndUpdate(
      {
        userId,
        currentBalance: { $gte: amount },
      },
      {
        $inc: {
          currentBalance: -amount,
        },
      },
      {
        new: true,
      },
    );

    if (!balance) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Insufficient balance',
      );
    }

    const withdrawal = await WithdrawalModel.create({
      driverProfileId: balance._id,
      amount,
      status: 'PENDING',
    });

    return withdrawal;
  }

  static async getWithdrawalHistory(
    userId: string,
  ) {
    const balance = await BalanceModel.findOne({
      userId,
    });

    if (!balance) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Balance account not found',
      );
    }

    return WithdrawalModel.find({
      driverProfileId: balance._id,
    })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getWithdrawalStatus(
    withdrawalId: string,
  ) {
    const withdrawal =
      await WithdrawalModel.findById(
        withdrawalId,
      );

    if (!withdrawal) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Withdrawal not found',
      );
    }

    return withdrawal;
  }

  static async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
  ) {
    const session =
      await mongoose.startSession();

    try {
      await session.startTransaction();

      const withdrawal =
        await WithdrawalModel.findById(
          withdrawalId,
        ).session(session);

      if (!withdrawal) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Withdrawal not found',
        );
      }

      if (
        withdrawal.status !== 'PENDING'
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Withdrawal already processed',
        );
      }

      await BalanceModel.findByIdAndUpdate(
        withdrawal.driverProfileId,
        {
          $inc: {
            currentBalance:
              withdrawal.amount,
          },
        },
        {
          session,
        },
      );

      withdrawal.status = 'REJECTED';
      withdrawal.processedBy = adminId;
      withdrawal.processedAt =
        new Date();

      await withdrawal.save({
        session,
      });

      await session.commitTransaction();

      return withdrawal;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async approveWithdrawal(
    withdrawalId: string,
    adminId: string,
  ) {
    const withdrawal =
      await WithdrawalModel.findById(
        withdrawalId,
      );

    if (!withdrawal) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Withdrawal not found',
      );
    }

    if (
      withdrawal.status !== 'PENDING'
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Withdrawal already processed',
      );
    }

    const balance =
      await BalanceModel.findById(
        withdrawal.driverProfileId,
      );

    if (!balance) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Balance account not found',
      );
    }

    if (
      !balance.stripeAccountId ||
      !balance.stripeOnboarded
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Stripe onboarding not completed',
      );
    }

    const transfer =
      await stripe.transfers.create({
        amount: Math.round(
          withdrawal.amount * 100,
        ),
        currency: 'usd',
        destination:
          balance.stripeAccountId,
        description: `Withdrawal ${withdrawal._id}`,
      });

    withdrawal.status =
      'COMPLETED';

    withdrawal.stripeTransferId =
      transfer.id;

    withdrawal.processedBy =
      adminId;

    withdrawal.processedAt =
      new Date();

    await withdrawal.save();

    return withdrawal;
  }
}

