import Member from "@/models/member";

export const syncMemberStatuses = async () => {
  const now = new Date();

  await Member.updateMany(
    {
      status: { $ne: "Suspended" },
      subscriptionEndDate: { $lt: now },
    },
    { $set: { status: "Expired" } }
  );

  await Member.updateMany(
    {
      status: "Expired",
      subscriptionEndDate: { $gte: now },
    },
    { $set: { status: "Active" } }
  );
};
