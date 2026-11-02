import prisma from '../config/db.js';

export async function getSummary(req, res, next) {
  try {
    const grievances = await prisma.grievance.findMany({
      where: { is_deleted: false },
      include: {
        category: true,
        assigned_authority: true
      }
    });

    const flagsCount = await prisma.flag.count({
      where: { resolved: false }
    });

    const now = Date.now();
    const byStatus = {};
    const byCategory = {};
    const bySection = {};
    const ageBuckets = { '<1d': 0, '1-3d': 0, '3-7d': 0, '>7d': 0 };
    const bySubAuthority = {};

    let resolvedCount = 0;
    let totalResolutionHours = 0;
    let slaBreachedCount = 0;

    grievances.forEach(g => {
      // Status
      byStatus[g.status] = (byStatus[g.status] || 0) + 1;

      // Category
      const catName = g.category?.name || 'General';
      byCategory[catName] = (byCategory[catName] || 0) + 1;

      // Section
      const sec = g.category?.section || 'college';
      bySection[sec] = (bySection[sec] || 0) + 1;

      // Unresolved age buckets
      const isClosedOrResolved = ['Resolved', 'Closed', 'Rejected'].includes(g.status);
      if (!isClosedOrResolved) {
        const hoursOld = (now - new Date(g.created_at).getTime()) / 3600000;
        if (hoursOld < 24) ageBuckets['<1d']++;
        else if (hoursOld < 72) ageBuckets['1-3d']++;
        else if (hoursOld < 168) ageBuckets['3-7d']++;
        else ageBuckets['>7d']++;
      }

      // SLA & Resolution
      if (g.resolved_at) {
        resolvedCount++;
        const resHours = (new Date(g.resolved_at).getTime() - new Date(g.created_at).getTime()) / 3600000;
        totalResolutionHours += resHours;
        if (resHours > g.sla_hours) {
          slaBreachedCount++;
        }
      }

      // Sub Authority
      const authName = g.assigned_authority?.department || 'Unassigned';
      if (!bySubAuthority[authName]) {
        bySubAuthority[authName] = { total: 0, resolved: 0 };
      }
      bySubAuthority[authName].total++;
      if (['Resolved', 'Closed'].includes(g.status)) {
        bySubAuthority[authName].resolved++;
      }
    });

    const activeCount = grievances.filter(g => !['Resolved', 'Closed', 'Rejected'].includes(g.status)).length;
    const avgHours = resolvedCount > 0 ? +(totalResolutionHours / resolvedCount).toFixed(1) : 0;

    return res.status(200).json({
      total: grievances.length,
      active: activeCount,
      resolved: resolvedCount,
      flags: flagsCount,
      byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
      byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      bySection: Object.entries(bySection).map(([section, count]) => ({ section, count })),
      ageBuckets: Object.entries(ageBuckets).map(([bucket, count]) => ({ bucket, count })),
      sla: {
        avg_hours: avgHours,
        breach_count: slaBreachedCount,
        on_time: Math.max(0, resolvedCount - slaBreachedCount)
      },
      bySubAuthority: Object.entries(bySubAuthority).map(([name, data]) => ({ name, ...data }))
    });
  } catch (error) {
    next(error);
  }
}
