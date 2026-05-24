import { Request } from 'express';
import BusinessView from './Businessview.model';
import Business from '../Buisness/Business.model';


// ═══════════════════════════════════════════════════════════════════
//  Track View Service  ← business details page e call korbo
// ═══════════════════════════════════════════════════════════════════
export const trackBusinessViewService = async (
  businessId: string,
  viewerId: string
): Promise<void> => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;

  await BusinessView.create({
    business: businessId,
    viewer:   viewerId,
    viewedAt: now,
    year,
    month,
  });
};

// ═══════════════════════════════════════════════════════════════════
//  Analytics Dashboard Service
// ═══════════════════════════════════════════════════════════════════
export const getAnalyticsService = async (req: Request) => {
  const userId      = req.user?.id;
  const year        = parseInt(req.query.year as string) || new Date().getFullYear();

  // ── User er sob business ID ───────────────────────────────────
  const businesses = await Business.find({ host: userId }).select('_id');
  const businessIds = businesses.map((b) => b._id);

  // ── Total business count ──────────────────────────────────────
  const totalBusiness = businessIds.length;

  // ── Total views (all time) ────────────────────────────────────
  const totalView = await BusinessView.countDocuments({
    business: { $in: businessIds },
  });

  // ── Monthly views for selected year ──────────────────────────
  const monthlyRaw = await BusinessView.aggregate([
    {
      $match: {
        business: { $in: businessIds },
        year,
      },
    },
    {
      $group: {
        _id:   '$month',
        count: { $sum: 1 },
      },
    },
  ]);

  // ── Fill all 12 months (missing months = 0) ───────────────────
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const monthlyViews = monthNames.map((name, i) => {
    const found = monthlyRaw.find((m) => m._id === i + 1);
    return {
      month: name,
      views: found ? found.count : 0,
    };
  });

  return {
    totalBusiness,
    totalView,
    year,
    monthlyViews,
  };
};

export const analyticsServices = {
  trackBusinessViewService,
  getAnalyticsService,
};