const { default: mongoose, Schema } = require("mongoose");
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


module.exports = mongoose.model("Users", regiSchema);
