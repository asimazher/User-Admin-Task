const mongoose = require("mongoose")
const joi = require("joi")

 const jobSchema = new mongoose.Schema({
    data: {
        type: Object,
        required:  true
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type:String,
        required: true
    },
    status:  {
        type: String,
        default: "pending"
    }
})

 const Job = mongoose.model("Job", jobSchema)

 const validateJob = (job)=>{
    const schema = joi.object({
        data: joi.object().required(),
        email: joi.string().required(),
        status: joi.string().required()
    })
    return schema.validate(job)
}

module.exports = {jobSchema, Job, validateJob}