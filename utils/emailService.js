const nodemailer = require("nodemailer");
const Queue = require("bull");
const { Job } = require("../models/job");
const emailQueue = new Queue("emailQueue");

const createEmailJob = async (emailOptions) => {
  const newJob = await Job.create({
    data: emailOptions,
    email: emailOptions.to,
    type: "verfiyEmail"
  });
  emailService(newJob);
};

const emailService = async (newJob) => {
  try {
    // getting all the jobs from Database

    const cursor = Job.find({ _id: newJob._id }).cursor();

    // adding job to queue

    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      // Process the document here
      const jobData = {data:doc.data,
        id:doc._id};
      // const jobData = newJob.data
//
      // for(let i = 0; i<=3;i++){
      const job = await emailQueue.add(jobData);
      console.log(`Email Job ${job} added to the queue.`);
      // }
      //
    }
  } catch (error) {
    console.log(error);
  }
};

emailQueue.process(async (job) => {
  try {
    console.log(`Processing email job ${job.id}`);

    // processing the job
    // Send email using nodemailer

    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: job.data.data.to,
      subject: job.data.data.subject,
      text: job.data.data.text,
    };

    await transporter.sendMail(mailOptions);

    await Job.findOneAndUpdate({ _id: job.data.id }, { status: "success" });
    console.log("success");
  } catch (error) {
    console.log(error);
    await Job.findOneAndUpdate({ _id: job.data.id }, { status: "failure" });
    console.log("failure");
  }
});
// const emailService = async (emailOptions) => {
//   // Send email using nodemailer

//   const transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: emailOptions.to,
//     subject: emailOptions.subject,
//     text: emailOptions.text,
//   };

//   await transporter.sendMail(mailOptions);
// };

module.exports = createEmailJob;
