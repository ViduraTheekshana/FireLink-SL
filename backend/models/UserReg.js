const { default: mongoose, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const schema = mongoose.Schema;


const regiSchema = new schema ({
          name : {
            type :  String , //dataType
            required : true , //validate
          },

           phone : {
            type :  Number , //dataType
            required : true , //validate
          },
         
          age : {
            type :  Number , //dataType
            required : true , //validate
          },

          gmail : {
            type :  String , //dataType
            required : true , //validate
          },

           position : {
            type :  String , //dataType
            required : true , //validate
          },

           status : {
            type :  String , //dataType
            required : true , //validate
          },

           address : {
            type :  String , //dataType
            required : true , //validate
          },

          password : {
            type :  String , //dataType
            required : true , //validate
          },

            staffId: { type: String, unique: true }

         

});

// Hash password before saving the user document
regiSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Hash password when using findOneAndUpdate / findByIdAndUpdate if provided
regiSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate();
    if (update && update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("UserReg", regiSchema);
