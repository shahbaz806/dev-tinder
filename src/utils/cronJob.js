const cron = require("node-cron");
const ConnectionRequestModel = require("../modals/connectionRequest");
const sendEmail = require("./sendEmail");
const {subDays,startOfDay,endOfDay} = require("date-fns");

cron.schedule("0 8 * * *", async () => {
  //send emails to who got request the previos day

  try {
    const yesterDay = subDays(new Date(), 1);

    const yesterDayStart = startOfDay(yesterDay);
    const yesterDayEnd = endOfDay(yesterDay);
    const pendingRequest = await ConnectionRequestModel.find({
        status: "interested",
        createdAt: {
          $gte: yesterDayStart,
          $lt:yesterDayEnd,
        },
    }).populate("fromUserId toUserId");

    const listOfEmails = [ ...new Set(pendingRequest.map((req) => req.toUserId.emailId)),];
    console.log(listOfEmails);

    for (const email of listOfEmails) {
        try {
            const res = await sendEmail.run("new friends request pending for" + email,
                "there are so many friend request pending"
            );
            console.log(res);
        } catch(err) {
            console.log(err)
        }
    }

  } catch(err) {
    console.log(err)
  }
});
