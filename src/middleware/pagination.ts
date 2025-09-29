import type { NextFunction, Request, Response } from "express";

export const pagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Calculate skip and take for Prisma
  const skip = (page - 1) * limit;

  // Attach pagination info to request object
  req.pagination = {
    page,
    limit,
    skip,
  };

  next();
};
