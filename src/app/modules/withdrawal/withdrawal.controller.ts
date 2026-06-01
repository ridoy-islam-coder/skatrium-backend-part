import { Request, Response, NextFunction } from 'express';
import { WithdrawalService } from './withdrawal.service';

export class WithdrawalController {
  static async requestWithdrawal(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result =
        await WithdrawalService.requestWithdrawal(
          req.user.id,
          Number(req.body.amount),
        );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWithdrawalHistory(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result =
        await WithdrawalService.getWithdrawalHistory(
          req.user.id,
        );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getWithdrawalStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result =
        await WithdrawalService.getWithdrawalStatus(
          req.params.withdrawalId as string,
        );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveWithdrawal(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await WithdrawalService.approveWithdrawal(
        req.params.withdrawalId as string,
        req.user.id,
      );

      res.json({
        success: true,
        message: 'Withdrawal approved',
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectWithdrawal(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await WithdrawalService.rejectWithdrawal(
        req.params.withdrawalId as string,
        req.user.id,
      );

      res.json({
        success: true,
        message: 'Withdrawal rejected',
      });
    } catch (error) {
      next(error);
    }
  }
}